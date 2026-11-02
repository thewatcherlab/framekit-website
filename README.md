# FrameKit website

The website for [FrameKit](https://framekit.thewatcherlab.com), a screenshot and screen recorder for Mac. Built with [Astro](https://astro.build) and hosted on Cloudflare Workers.

Download the app on [Gumroad](https://fiqryq.gumroad.com/l/framekit).

## Run locally

```sh
pnpm install
cp .dev.vars.example .dev.vars   # optional: only the bug report form needs it
pnpm dev
```

The site runs at `http://localhost:4321`.

## Deploy

```sh
pnpm deploy
```

This builds the site and deploys it with Wrangler. The pages are static; only the routes in `src/pages/api/` run on the Worker.

## Settings

Secrets live in Cloudflare, never in the code. Set each one with `pnpm wrangler secret put <NAME>`, and put local values in `.dev.vars`.

| Name | Used for |
| --- | --- |
| `RESEND_API_KEY` | Sending bug reports by email |
| `REPORT_TO` | The inbox that receives bug reports |
| `DISCORD_WEBHOOK_URL` | Posting bug reports to Discord |
| `DISCORD_SALES_WEBHOOK_URL` | Posting new Gumroad downloads to Discord |
| `GUMROAD_PING_TOKEN` | Checking that Gumroad pings are real |

The bug report videos are stored in the R2 bucket `framekit-bug-reports`. The sender address and other bindings are in `wrangler.jsonc`.

## Where things are

| Path | What it is |
| --- | --- |
| `src/config/frame.ts` | App facts: version, links, FAQs, changelog |
| `src/pages/` | The pages |
| `src/pages/api/report.ts` | Bug report form: email and Discord |
| `src/pages/api/report/` | Video uploads to R2 and playback |
| `src/pages/api/gumroad.ts` | Gumroad Ping to Discord |
| `src/styles/marketing.css` | Site styles |
