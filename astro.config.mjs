// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://framekit.thewatcherlab.com',
	// Pages stay static; only routes with `prerender = false` (the bug report API) run on the Worker.
	adapter: cloudflare(),
	env: {
		schema: {
			// Resend API key. Locally in .dev.vars; in production `wrangler secret put RESEND_API_KEY`.
			// Optional here so the rest of the endpoint still answers; it refuses to send without one.
			RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			// A Discord channel's incoming webhook; reports are posted there too. A secret, since
			// anyone with it can post: `wrangler secret put DISCORD_WEBHOOK_URL`.
			DISCORD_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Gumroad Ping (/api/gumroad). The token goes in the ping URL; a ping without it is
			// ignored. The seller ID, from any ping or Gumroad's settings, is checked when set.
			GUMROAD_PING_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
			GUMROAD_SELLER_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Where new Gumroad downloads are posted. Falls back to DISCORD_WEBHOOK_URL.
			DISCORD_SALES_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Who sends the report email. Its domain (framekit.thewatcherlab.com) must be verified in Resend.
			REPORT_FROM: envField.string({
				context: 'server',
				access: 'public',
				default: 'FrameKit Bug Reports <bugs@framekit.thewatcherlab.com>',
			}),
			// Where reports go. A secret so the inbox isn't in the public repo:
			// `wrangler secret put REPORT_TO`. Without it, reports skip email and go to Discord only.
			REPORT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
