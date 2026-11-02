/**
 * Facts about FrameKit for the marketing pages. Everything here comes from the app itself
 * (its README, settings and project), so change it here when the app changes.
 */

const email = "framekit@thewatcherlab.com";
const repo = "https://github.com/fiqryq/frame";

export const frame = {
	name: "FrameKit",
	version: "0.1",
	description: "Screenshots, scrolling captures and screen recordings from the menu bar, with an editor and a studio to finish them.",
	email,
	repo,
	/** The newest release on GitHub. The repo has to be public for visitors to reach it. */
	download: `${repo}/releases/latest`,
	/** The FrameKit product page on Gumroad ($0+, pay what you want). */
	gumroad: "https://fiqryq.gumroad.com/l/framekit",
	/** Show the "Download for Mac" buttons (the direct download). Off while FrameKit is on Gumroad. */
	directDownload: false,
	requirement: "macOS 26 or later",
	price: "Free",
	/** Where the bug report form posts (multipart: title, email, description, attachments). */
	reportEndpoint: "/api/report",
	/**
	 * Limits the bug report form checks before sending, and the API checks again.
	 * Images travel as email attachments through Resend, which caps an email at 40 MB once
	 * they're base64-encoded (a third bigger), and the Worker has 128 MB of memory, so images
	 * together stay at 20 MB (imageTotalBytes). Videos go to R2 instead, in parts of partBytes
	 * (R2 wants every part but the last the same size, and at least 5 MB), and the email links
	 * to them.
	 */
	reportLimits: {
		files: 5,
		imageBytes: 10 * 1024 * 1024,
		imageTotalBytes: 20 * 1024 * 1024,
		videoBytes: 200 * 1024 * 1024,
		partBytes: 10 * 1024 * 1024,
	},
} as const;

export const faqs: { q: string; a: string; href?: string; link?: string }[] = [
	{
		q: "Is FrameKit free?",
		a: "Yes. FrameKit is free to download and use, with no account, no trial and no license.",
	},
	{
		q: "Which version of macOS do I need?",
		a: "macOS 26 or later.",
	},
	{
		q: "Why does FrameKit ask for permissions?",
		a: "Only when a feature first needs one. Screen Recording takes screenshots and recordings, Accessibility drives Auto-Scroll and masks password fields, Camera and Microphone are for recordings, and Speech Recognition writes captions on your Mac.",
	},
	{
		q: "Where do my captures go?",
		a: "To the folder set in Settings, your Desktop to begin with, and into Capture History. A floating preview after each capture lets you copy, save, drag or edit it.",
	},
	{
		q: "Can I capture a whole web page?",
		a: "Yes. Scrolling capture stitches the area into one long image while you scroll it, or scrolls it for you with Auto-Scroll. It works down and to the right.",
	},
	{
		q: "Does the teleprompter show up in my recording?",
		a: "No. Your notes sit under the notch or in the middle of the screen, and FrameKit keeps them out of the recording.",
	},
	{
		q: "Will a recording show my passwords?",
		a: "Recorder Studio masks email and password fields automatically, from where the keyboard focus was while you recorded. You can add your own masks too.",
	},
	{
		q: "Can I upload captures to the cloud?",
		a: "Yes, to your own Cloudflare R2 or any S3-compatible bucket. Your credentials stay in the Keychain.",
	},
	{
		q: "Does FrameKit collect any data?",
		a: "No. FrameKit doesn't send anything anywhere, except the uploads you make to your own bucket.",
		href: "/privacy",
		link: "Privacy",
	},
	{
		q: "What should I do if I find a bug?",
		a: "Send a note with what you did and what happened.",
		href: "/report",
		link: "Report a bug",
	},
];

/** One release. `features` lists what it includes, grouped, as the changelog page shows it. */
export const changelog: {
	version: string;
	date: string;
	description: string;
	features?: { title: string; items: string[] }[];
}[] = [
	{
		version: "0.1",
		date: "25 Oct 2026",
		description: "The first beta: a screenshot tool and a screen recorder in the menu bar, with an editor for each.",
		features: [
			{
				title: "Screenshots",
				items: [
					"Capture an area, a window or the full screen, on a timer, or repeat the last area.",
					"Drag an area at a fixed aspect ratio: 1:1, 4:3, 3:2, 16:9, 9:16, 4:5 or 3:4.",
					"Scrolling capture stitches a long page into one image, or scrolls it for you with Auto-Scroll.",
					"Copy text from anywhere on the screen.",
					"A keyboard shortcut for every capture.",
				],
			},
			{
				title: "Markup editor",
				items: [
					"Arrows, rectangles, ellipses, pen, text, highlights and numbered steps.",
					"Spotlight to draw the eye, redact to hide details, and crop.",
					"A wallpaper, gradient or solid background with padding and a shadow.",
				],
			},
			{
				title: "Screen recording",
				items: [
					"Record an area, a window or the whole screen.",
					"Camera, microphone and system audio, with a countdown and a cursor highlight.",
					"The capture bar stays open and follows the mouse to whichever screen it's on.",
					"The camera bubble shows while you record but stays out of the recording.",
					"A teleprompter under the notch, or in the middle of the screen, that's never recorded.",
				],
			},
			{
				title: "Studio",
				items: [
					"Zooms placed for you from your clicks, or by hand, with a picker for where each one points.",
					"Cursor smoothing, click sounds and cursor trails: Liquid, Fluid, Ripple and Splash.",
					"Camera layouts: overlay, cutout, split screen or camera only, with size and edge spacing.",
					"Size presets that fill the frame on recordings without a camera.",
					"Email and password fields masked automatically, plus masks of your own.",
					"Captions transcribed on your Mac, with a choice of language and audio source.",
					"A timeline to split and trim, with Trim Start and Trim End, and mute, volume and hide on each track.",
					"Presets to reuse a look in one click.",
					"Export to MP4 (H.264 or HEVC), GIF or animated WebP.",
				],
			},
			{
				title: "Everything else",
				items: [
					"A floating preview after each capture to copy, save, drag or edit it, or copy its link.",
					"Capture History with every screenshot and recording, grouped by day.",
					"Upload to your own Cloudflare R2 or any S3-compatible bucket, with your keys in the Keychain.",
				],
			},
		],
	},
];
