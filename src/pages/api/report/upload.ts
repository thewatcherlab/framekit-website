/*
 * Puts a bug report's video in R2, in parts, so no single request comes near the Worker's
 * 100 MB body limit. The form (BugReportForm) runs it in three steps:
 *
 *   POST ?step=create    { name, type, size }        → { key, uploadId }
 *   PUT  ?step=part&key&uploadId&part=N  <bytes>      → { partNumber, etag }
 *   POST ?step=complete  { key, uploadId, parts }     → { key }
 *   POST ?step=abort     { key, uploadId }            → { ok }
 *
 * Every part but the last is frame.reportLimits.partBytes. The report itself (/api/report)
 * then names the key, and its email links to the video. R2 drops multipart uploads that are
 * never completed after 7 days.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { frame } from "../../../config/frame";
import { isReportKey, json, newReportKey, size, withinRateLimit } from "../../../lib/report";

export const prerender = false;

const { videoBytes, partBytes } = frame.reportLimits;
const maxParts = Math.ceil(videoBytes / partBytes);

type UploadRef = { key?: unknown; uploadId?: unknown };

/** The upload a request names, if its key is a report key. */
const resume = ({ key, uploadId }: UploadRef) =>
	typeof key === "string" && typeof uploadId === "string" && isReportKey(key)
		? env.REPORT_FILES.resumeMultipartUpload(key, uploadId)
		: null;

export const POST: APIRoute = async ({ request, url }) => {
	const step = url.searchParams.get("step");
	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json(400, { error: "The upload couldn't be read." });

	if (step === "create") {
		const { name, type, size: bytes } = body;
		if (typeof name !== "string" || typeof type !== "string" || !type.startsWith("video/")) {
			return json(400, { error: "Only videos are uploaded this way." });
		}
		if (typeof bytes !== "number" || bytes <= 0 || bytes > videoBytes) {
			return json(400, { error: `Each video can be up to ${size(videoBytes)}.` });
		}
		if (!(await withinRateLimit(request, "upload"))) {
			return json(429, { error: "Too many uploads. Try again in a minute." });
		}
		const upload = await env.REPORT_FILES.createMultipartUpload(newReportKey(name), {
			httpMetadata: { contentType: type },
			customMetadata: { originalName: name.slice(0, 200) },
		});
		return json(200, { key: upload.key, uploadId: upload.uploadId });
	}

	const upload = resume(body as UploadRef);
	if (!upload) return json(400, { error: "That upload doesn't exist." });

	if (step === "complete") {
		const parts = body.parts;
		if (
			!Array.isArray(parts) ||
			parts.length === 0 ||
			parts.length > maxParts ||
			!parts.every((p) => typeof p?.partNumber === "number" && typeof p?.etag === "string")
		) {
			return json(400, { error: "The upload is missing parts." });
		}
		try {
			const object = await upload.complete(parts as R2UploadedPart[]);
			if (object.size > videoBytes) {
				await env.REPORT_FILES.delete(object.key);
				return json(400, { error: `Each video can be up to ${size(videoBytes)}.` });
			}
			return json(200, { key: object.key });
		} catch {
			return json(400, { error: "The upload couldn't be finished." });
		}
	}

	if (step === "abort") {
		await upload.abort().catch(() => {});
		return json(200, { ok: true });
	}

	return json(400, { error: "Unknown upload step." });
};

export const PUT: APIRoute = async ({ request, url }) => {
	const part = Number(url.searchParams.get("part"));
	const upload = resume({ key: url.searchParams.get("key"), uploadId: url.searchParams.get("uploadId") });
	if (!upload || !Number.isInteger(part) || part < 1 || part > maxParts) {
		return json(400, { error: "That upload doesn't exist." });
	}

	// A part is never bigger than partBytes, and R2 needs its length up front to stream it.
	const length = Number(request.headers.get("content-length"));
	if (!request.body || !length || length > partBytes) return json(400, { error: "That part is the wrong size." });

	try {
		const uploaded = await upload.uploadPart(part, request.body);
		return json(200, { partNumber: uploaded.partNumber, etag: uploaded.etag });
	} catch {
		return json(400, { error: "That part couldn't be uploaded." });
	}
};
