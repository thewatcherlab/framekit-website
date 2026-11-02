/*
 * Plays back a bug report's video from R2, for the link in the report email. The bucket is
 * private; this serves only report keys, whose random uuid nobody but the email has. Range
 * requests work, so the video seeks in the browser.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { isReportKey } from "../../../../lib/report";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
	const key = params.key ?? "";
	if (!isReportKey(key)) return new Response("Not found", { status: 404 });

	const object = await env.REPORT_FILES.get(key, { range: request.headers, onlyIf: request.headers });
	if (!object) return new Response("Not found", { status: 404 });

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("accept-ranges", "bytes");
	// Only the people with the link should see it: keep it out of shared caches and search.
	headers.set("cache-control", "private, max-age=3600");
	headers.set("x-robots-tag", "noindex");
	headers.set("content-disposition", "inline");

	// onlyIf matched an If-None-Match or similar: the browser's copy is current.
	if (!("body" in object)) return new Response(null, { status: 304, headers });

	const range = object.range as { offset?: number; length?: number; suffix?: number } | undefined;
	if (range && request.headers.has("range")) {
		const offset = range.suffix !== undefined ? object.size - range.suffix : (range.offset ?? 0);
		const length = range.suffix ?? range.length ?? object.size - offset;
		headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
		headers.set("content-length", String(length));
		return new Response(object.body, { status: 206, headers });
	}

	headers.set("content-length", String(object.size));
	return new Response(object.body, { headers });
};
