/*
 * Posts a bug report to a Discord channel through an incoming webhook: one embed with the
 * report, the images as files, and links to the videos in R2.
 *
 * Discord's limits: an embed's title is 256 characters, its description 4096, a field 1024,
 * and the whole embed 6000. Webhook files are 10 MB each, which the report's image limit
 * already keeps to. Mentions are switched off, since the text is whatever a visitor typed.
 */
import { frame } from "../config/frame";
import { size } from "./report";

export type ReportForDiscord = {
	title: string;
	email: string;
	description: string;
	userAgent: string;
	images: File[];
	videos: { name: string; bytes: number; link: string }[];
};

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Resolves true when Discord accepted the message. */
export const postToDiscord = async (webhookUrl: string, report: ReportForDiscord) => {
	const fields = [
		{ name: "From", value: cut(report.email, 1024), inline: true },
		...(report.videos.length
			? [
					{
						name: report.videos.length === 1 ? "Video" : "Videos",
						value: cut(report.videos.map((v) => `[${v.name.replace(/[[\]]/g, "")}](${v.link}) (${size(v.bytes)})`).join("\n"), 1024),
					},
				]
			: []),
		{ name: "Browser", value: cut(report.userAgent, 1024) },
	];

	const payload = {
		username: `${frame.name} Bug Reports`,
		allowed_mentions: { parse: [] },
		embeds: [
			{
				title: cut(report.title, 256),
				description: cut(report.description, 3000),
				color: 0x8b5cf6,
				fields,
				timestamp: new Date().toISOString(),
			},
		],
	};

	const body = new FormData();
	body.append("payload_json", JSON.stringify(payload));
	report.images.forEach((image, index) => body.append(`files[${index}]`, image, image.name || `image-${index + 1}`));

	const response = await fetch(webhookUrl, { method: "POST", body });
	if (!response.ok) console.error("Discord rejected the bug report", response.status, await response.text());
	return response.ok;
};
