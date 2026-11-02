/*
 * Gumroad Ping: Gumroad posts here after every sale, $0 ones included, and this posts the buyer
 * to Discord, so each new download shows up in a channel.
 *
 * Set in Gumroad under Settings → Advanced → Ping endpoint:
 *   https://framekit.thewatcherlab.com/api/gumroad?token=<GUMROAD_PING_TOKEN>
 *
 * Gumroad doesn't sign its pings, so the token in the URL is what proves a ping came from your
 * settings; anything without it gets a 404. GUMROAD_SELLER_ID, when set, must match too.
 * Gumroad retries hourly for 3 hours until it gets a 200, so a Discord failure answers 502.
 *
 * Settings: GUMROAD_PING_TOKEN (secret), GUMROAD_SELLER_ID (optional), and the Discord webhook:
 * DISCORD_SALES_WEBHOOK_URL, or DISCORD_WEBHOOK_URL (the bug report one) when it isn't set.
 */
import type { APIRoute } from "astro";
import {
	DISCORD_SALES_WEBHOOK_URL,
	DISCORD_WEBHOOK_URL,
	GUMROAD_PING_TOKEN,
	GUMROAD_SELLER_ID,
} from "astro:env/server";

export const prerender = false;

/** Compares without stopping at the first difference, so timing doesn't leak the token. */
const sameText = (a: string, b: string) => {
	const x = new TextEncoder().encode(a);
	const y = new TextEncoder().encode(b);
	let diff = x.length ^ y.length;
	for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
	return diff === 0;
};

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export const POST: APIRoute = async ({ request, url }) => {
	const token = url.searchParams.get("token") ?? "";
	if (!GUMROAD_PING_TOKEN || !sameText(token, GUMROAD_PING_TOKEN)) return new Response("Not found", { status: 404 });

	let ping: FormData;
	try {
		ping = await request.formData();
	} catch {
		return new Response("Bad request", { status: 400 });
	}
	const field = (name: string) => String(ping.get(name) ?? "").trim();

	if (GUMROAD_SELLER_ID && field("seller_id") !== GUMROAD_SELLER_ID) return new Response("Not found", { status: 404 });

	const webhook = DISCORD_SALES_WEBHOOK_URL || DISCORD_WEBHOOK_URL;
	if (!webhook) {
		console.error("No Discord webhook is set; the Gumroad ping wasn't posted.");
		return new Response("Not configured", { status: 503 });
	}

	// Gumroad sends the price in cents, and "true"/"false" as text.
	const cents = Number(field("price")) || 0;
	const currency = (field("currency") || "usd").toUpperCase();
	const paid = cents > 0;
	const isTest = field("test") === "true";
	const refunded = field("refunded") === "true";
	const name = field("full_name");
	const email = field("email");

	const fields = [
		{ name: "Email", value: cut(email || "Not given", 1024), inline: true },
		...(name ? [{ name: "Name", value: cut(name, 1024), inline: true }] : []),
		{ name: "Paid", value: paid ? `${(cents / 100).toFixed(2)} ${currency}` : "Free", inline: true },
		...(field("ip_country") ? [{ name: "Country", value: cut(field("ip_country"), 1024), inline: true }] : []),
		...(field("referrer") ? [{ name: "Came from", value: cut(field("referrer"), 1024), inline: true }] : []),
		...(field("can_contact") === "false" ? [{ name: "Contact", value: "Opted out of emails", inline: true }] : []),
	];

	const response = await fetch(webhook, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			username: "Gumroad",
			allowed_mentions: { parse: [] },
			embeds: [
				{
					title: cut(
						`${isTest ? "[Test] " : ""}${refunded ? "Refunded: " : ""}${paid ? "New sale" : "New download"}: ${field("product_name") || "FrameKit"}`,
						256,
					),
					color: refunded ? 0xef4444 : paid ? 0x22c55e : 0xff90e8,
					fields,
					footer: field("sale_id") ? { text: `Sale ${cut(field("sale_id"), 100)}` } : undefined,
					timestamp: field("sale_timestamp") || new Date().toISOString(),
				},
			],
		}),
	});

	if (!response.ok) {
		console.error("Discord rejected the Gumroad ping", response.status, await response.text());
		return new Response("Couldn't post", { status: 502 });
	}
	return new Response("OK");
};
