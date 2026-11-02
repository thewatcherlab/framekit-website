/**
 * Copy, navigation, and pricing for this product.
 * Duplicate the repo for a new SaaS and edit this file.
 * Visual tokens live in src/styles/global.css.
 */

const email = "framekit@thewatcherlab.com";

export const site = {
	name: "FrameKit",
	tagline: "Screenshots and screen recordings for Mac",
	description:
		"Screenshots, scrolling captures and screen recordings from the menu bar, with an editor and a studio to finish them.",
	url: "https://framekit.thewatcherlab.com",
	email,
	login: { label: "Log in", href: "/login" },
	cta: { label: "Start free", href: "/login" },
	nav: [
		{ label: "Product", href: "/#product" },
		{ label: "Pricing", href: "/pricing" },
		{ label: "Customers", href: "/#customers" },
		{ label: "Changelog", href: "/changelog" },
	],
	hero: {
		title: "A studio for product work.",
		subhead: "Requests, releases, and customer signals on one canvas.",
		lede: "Harbor keeps what customers ask, what you ship, and whether the service is up in one quiet record — so the team stops hunting through badges.",
		primary: { label: "Start free", href: "/login" },
		secondary: {
			label: "Book a demo",
			href: `mailto:${email}?subject=Harbor%20demo`,
		},
	},
	trust: {
		caption: "Used by teams who wanted a quieter tool",
		logos: ["Northwind", "Keel & Co", "Parcel", "Lumen", "Atelier", "Fold"],
	},
	quotes: [
		{
			company: "Northwind",
			quote: "The inbox is the only list we check now. Requests stop disappearing into side channels.",
			person: "C. Lang",
			role: "Product",
		},
		{
			company: "Parcel",
			quote: "Releases read like a log, not a dashboard. We can see who shipped what without a meeting.",
			person: "A. Okonkwo",
			role: "Engineering",
		},
		{
			company: "Fold",
			quote: "Customers get one sentence and a live dot. That is the status page we actually keep updated.",
			person: "M. Ibarra",
			role: "Support",
		},
	],
	product: {
		title: "The whole product, without the noise.",
		lede: "Three places to look. The same calm surface in each.",
	},
	features: [
		{
			icon: "inbox",
			visual: "inbox",
			title: "One queue for every request",
			body: "Mail, in-app notes, and internal asks land together. The owner, the state, and the last reply stay on the row.",
			flip: false,
		},
		{
			icon: "release",
			visual: "release",
			title: "A release log with a paper trail",
			body: "Ship notes, the owner, and the rollback live next to the version. The record reads like a studio log you can scan later.",
			flip: true,
		},
		{
			icon: "status",
			visual: "status",
			title: "Status in a single sentence",
			body: "A live dot when you are up. A plain line when you are not. Customers see the state without a wall of severity colors.",
			flip: false,
		},
	],
	pricingIntro: {
		title: "Simple seats. No checkout theater.",
		lede: "Start on Pilot. Move to Studio when the record becomes the team's home.",
	},
	pricing: [
		{
			name: "Pilot",
			price: "$0",
			period: "Free for one product",
			description: "Prove the record on a real project.",
			featured: false,
			features: ["1 workspace", "3 members", "30 days of history", "Community support"],
			cta: { label: "Start free", href: "/login", variant: "secondary" },
		},
		{
			name: "Team",
			price: "$18",
			period: "per seat / month",
			description: "For a squad shipping every week.",
			featured: false,
			features: ["Unlimited history", "10 members", "Release log", "Email support"],
			cta: { label: "Choose Team", href: "/login", variant: "secondary" },
		},
		{
			name: "Studio",
			price: "$36",
			period: "per seat / month",
			description: "For the team that lives in the record.",
			featured: true,
			features: ["Unlimited members", "Public status page", "SAML", "Priority support"],
			cta: { label: "Choose Studio", href: "/login", variant: "primary" },
		},
		{
			name: "Scale",
			price: "Custom",
			period: "Annual agreement",
			description: "For several products under one roof.",
			featured: false,
			features: ["Multiple workspaces", "Audit log", "Custom retention", "Dedicated support"],
			cta: { label: "Contact sales", href: `mailto:${email}?subject=Harbor%20Scale`, variant: "secondary" },
		},
	],
	faq: [
		{
			question: "Can we change plans later?",
			answer:
				"Yes. Move between Pilot, Team, and Studio whenever you want. You are billed for the seats you have that month.",
		},
		{
			question: "Do viewers need a paid seat?",
			answer:
				"No. People who only read the status page and the release log are free. A seat is for someone who edits the record.",
		},
		{
			question: "Where does Harbor store data?",
			answer: "In the region you choose when the workspace is created: United States or European Union.",
		},
		{
			question: "Is there an annual price?",
			answer: "Yes. Annual billing is two months free. The prices on this page are monthly.",
		},
	],
	closing: {
		title: "Open a workspace this afternoon.",
		lede: "One product. A handful of seats. Invite the rest of the team when the record feels right.",
		primary: { label: "Start free", href: "/login" },
		secondary: { label: "See pricing", href: "/pricing" },
	},
	changelog: [
		{
			date: "2026-10-02",
			title: "Pricing",
			body: "Four plans, from a free pilot to a custom workspace. Studio is the plan most teams pick.",
		},
		{
			date: "2026-09-18",
			title: "Public status",
			body: "A customer page with a live indicator, one sentence, and the last ten updates.",
		},
		{
			date: "2026-09-02",
			title: "Release log",
			body: "Every version keeps its notes, its owner, and the rollback next to the work.",
		},
	],
	chat: {
		launcher: "Help",
		title: "Harbor",
		status: "Online",
		body: "Questions about your workspace land with a person, usually within one business day.",
	},
	footer: [
		{
			title: "Product",
			links: [
				{ label: "Overview", href: "/#product" },
				{ label: "Pricing", href: "/pricing" },
				{ label: "Changelog", href: "/changelog" },
			],
		},
		{
			title: "Company",
			links: [
				{ label: "Customers", href: "/#customers" },
				{ label: "Contact", href: `mailto:${email}` },
				{ label: "Log in", href: "/login" },
			],
		},
		{
			title: "Resources",
			links: [
				{ label: "Design system", href: "/design" },
				{ label: "Book a demo", href: `mailto:${email}?subject=Harbor%20demo` },
			],
		},
		{
			title: "Legal",
			links: [
				{ label: "Privacy", href: "/privacy" },
				{ label: "Terms", href: "/terms" },
			],
		},
	],
} as const;

export type FeatureIcon = (typeof site.features)[number]["icon"];
export type FeatureVisual = (typeof site.features)[number]["visual"];
