/*
 * Shared by the bug report endpoints: /api/report (sends the email), /api/report/upload (puts
 * videos in R2) and /api/report/file/... (plays them back from the email's links).
 */
import { env } from "cloudflare:workers";

export const json = (status: number, body: Record<string, unknown>) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const size = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** A filename that's safe in a header or a URL path: no control characters, slashes or quotes. */
export const safeName = (name: string, fallback: string) =>
	name
		.replace(/[\u0000-\u001f\u007f/\\"]/g, "")
		.trim()
		.slice(-100) || fallback;

/**
 * Report videos live at reports/<date>/<uuid>/<filename>. The uuid is random, so a key can't be
 * guessed: only the uploader and the report email know it. Nothing outside reports/ is served.
 */
const KEY = /^reports\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\/[^/]{1,100}$/;
export const isReportKey = (key: string) => KEY.test(key);
export const newReportKey = (filename: string) =>
	`reports/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}/${safeName(filename, "video")}`;

/** False when this IP is over the limit in wrangler.jsonc. The prefix keeps counters apart. */
export const withinRateLimit = async (request: Request, prefix: string) => {
	const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
	const { success } = await env.REPORT_LIMITER.limit({ key: `${prefix}:${ip}` });
	return success;
};
