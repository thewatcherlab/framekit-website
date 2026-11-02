/*
 * Receives the bug report form (BugReportForm), emails it through Resend and posts it to
 * Discord (src/lib/discord.ts), whichever of the two is set up. Images go along as
 * attachments; videos were already put in R2 by /api/report/upload, and the email links to them
 * through /api/report/file/... It runs on the Cloudflare Worker; every other page is static.
 *
 * Fields (multipart): title, email, description, attachments (images), videos (R2 keys, one per
 * video), company (the honeypot). The limits in frame.reportLimits are checked again here,
 * since anyone can post.
 *
 * Settings: RESEND_API_KEY, REPORT_TO and DISCORD_WEBHOOK_URL (secrets), and REPORT_FROM,
 * declared in astro.config.mjs.
 */
import type { APIRoute } from "astro";
import { DISCORD_WEBHOOK_URL, RESEND_API_KEY, REPORT_FROM, REPORT_TO } from "astro:env/server";
import { env } from "cloudflare:workers";
import { frame } from "../../config/frame";
import { postToDiscord } from "../../lib/discord";
import { isReportKey, json, safeName, size, withinRateLimit } from "../../lib/report";

export const prerender = false;

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 5000;

const escapeHtml = (text: string) =>
	text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Base64 without Node's Buffer, in chunks so big files don't overflow the argument list. */
const toBase64 = (bytes: Uint8Array) => {
	let binary = "";
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary);
};

export const POST: APIRoute = async ({ request, url }) => {
	const { files: maxFiles, imageBytes, imageTotalBytes, videoBytes } = frame.reportLimits;

	// Refuse an oversized body before reading it. A little room is left for the text fields.
	const length = Number(request.headers.get("content-length") ?? 0);
	if (length > imageTotalBytes + 1024 * 1024) {
		return json(413, { error: `Images can add up to ${size(imageTotalBytes)}.` });
	}

	if (!(await withinRateLimit(request, "report"))) {
		return json(429, { error: "Too many reports. Try again in a minute." });
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json(400, { error: "The report couldn't be read." });
	}

	// A filled honeypot is a bot: answer as if it worked, and send nothing.
	if (String(form.get("company") ?? "").trim()) return json(200, { ok: true });

	const title = String(form.get("title") ?? "").trim();
	const email = String(form.get("email") ?? "").trim();
	const description = String(form.get("description") ?? "").trim();

	if (!title || title.length > MAX_TITLE) return json(400, { error: "Add a title of up to 120 characters." });
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
		return json(400, { error: "Add a valid email address." });
	}
	if (!description || description.length > MAX_DESCRIPTION) {
		return json(400, { error: "Add a description of up to 5000 characters." });
	}

	const images = form.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
	const videoKeys = [...new Set(form.getAll("videos").map(String))];
	if (images.length + videoKeys.length > maxFiles) return json(400, { error: `Attach up to ${maxFiles} files.` });

	let total = 0;
	for (const image of images) {
		if (!image.type.startsWith("image/")) return json(400, { error: "Attachments must be images; videos upload separately." });
		if (image.size > imageBytes) return json(400, { error: `Each image can be up to ${size(imageBytes)}.` });
		total += image.size;
	}
	if (total > imageTotalBytes) return json(413, { error: `Images can add up to ${size(imageTotalBytes)}.` });

	// Each video must be one finished upload in R2.
	const videos: { name: string; bytes: number; link: string }[] = [];
	for (const key of videoKeys) {
		const object = isReportKey(key) ? await env.REPORT_FILES.head(key) : null;
		if (!object || object.size > videoBytes) return json(400, { error: "A video didn't finish uploading. Try again." });
		videos.push({
			name: object.customMetadata?.originalName || key.split("/").pop()!,
			bytes: object.size,
			link: new URL(`/api/report/file/${key.split("/").map(encodeURIComponent).join("/")}`, url).href,
		});
	}

	const attachments = await Promise.all(
		images.map(async (image, index) => ({
			filename: safeName(image.name, `image-${index + 1}`),
			content: toBase64(new Uint8Array(await image.arrayBuffer())),
		})),
	);

	const userAgent = request.headers.get("user-agent") ?? "Unknown";
	const imageLines = images.map((image, index) => `${attachments[index].filename} (${size(image.size)})`);

	const text = [
		`From: ${email}`,
		`Browser: ${userAgent}`,
		"",
		description,
		"",
		images.length ? `Attached images:\n${imageLines.join("\n")}` : "No images.",
		"",
		videos.length ? `Videos:\n${videos.map((v) => `${v.name} (${size(v.bytes)}): ${v.link}`).join("\n")}` : "No videos.",
	].join("\n");

	const meta = "margin:16px 0 0;font:13px system-ui,sans-serif;color:#57534e";
	const html = `
		<h2 style="margin:0 0 12px;font:600 18px system-ui,sans-serif">${escapeHtml(title)}</h2>
		<p style="margin:0 0 4px;font:14px system-ui,sans-serif;color:#57534e">From: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
		<p style="margin:0 0 16px;font:12px system-ui,sans-serif;color:#78716c">${escapeHtml(userAgent)}</p>
		<div style="white-space:pre-wrap;font:15px/1.5 system-ui,sans-serif;color:#1c1917">${escapeHtml(description)}</div>
		${images.length ? `<p style="${meta}">Attached images: ${imageLines.map(escapeHtml).join(", ")}</p>` : ""}
		${
			videos.length
				? `<p style="${meta}">Videos:</p><ul style="margin:4px 0 0;padding-left:20px;font:14px system-ui,sans-serif">${videos
						.map((v) => `<li><a href="${escapeHtml(v.link)}">${escapeHtml(v.name)}</a> (${size(v.bytes)})</li>`)
						.join("")}</ul>`
				: ""
		}`;

	const sendEmail = async () => {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				authorization: `Bearer ${RESEND_API_KEY}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				from: REPORT_FROM,
				to: [REPORT_TO],
				reply_to: email,
				subject: `[${frame.name} bug] ${title}`,
				text,
				html,
				attachments,
			}),
		});
		if (!response.ok) console.error("Resend rejected the bug report", response.status, await response.text());
		return response.ok;
	};

	// Email and Discord go out together. Either is enough: the report counts as sent when
	// one of them takes it, and a failure is logged for Workers Logs.
	const channels: Promise<boolean>[] = [];
	if (RESEND_API_KEY && REPORT_TO) channels.push(sendEmail());
	if (DISCORD_WEBHOOK_URL) {
		channels.push(postToDiscord(DISCORD_WEBHOOK_URL, { title, email, description, userAgent, images, videos }));
	}
	if (!channels.length) {
		console.error("Neither email (RESEND_API_KEY + REPORT_TO) nor DISCORD_WEBHOOK_URL is set; the bug report wasn't sent.");
		return json(503, { error: "Reports can't be sent right now." });
	}

	const results = await Promise.allSettled(channels);
	const delivered = results.some((result) => result.status === "fulfilled" && result.value);
	results.forEach((result) => result.status === "rejected" && console.error("A report channel failed", result.reason));

	return delivered ? json(200, { ok: true }) : json(502, { error: "The report couldn't be sent." });
};
