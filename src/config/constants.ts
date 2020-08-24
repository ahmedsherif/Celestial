import * as env from "env-var";
const inflect = require("i")();
import path from "path";
const pacman = require(path.join(process.cwd(), "/package.json"));

export const PORT: number = env.get("PORT").default("4000").asPortNumber();

export const REDIS_URL: string = env.get("REDIS_URL").default("").asUrlString();

export const APP_TITLE: string = inflect.titleize(pacman.name);

export const APP_SUBTITLE: string = pacman.description;

export const APP_VERSION: string = pacman.version;

export const INDIEAUTH_CLIENT: {
	client_id: string;
	redirect_uri: string;
} = {
	client_id: env
		.get("CLIENT_ID")
		.default("http://localhost:4000/")
		.asUrlString(),
	redirect_uri: env
		.get("REDIRECT_URI")
		.default("http://localhost:4000/login/callback/")
		.asUrlString(),
};

export const POST_TYPES = [
	{
		name: "Article",
		type: "article",
		icon: "📄",
		endpoint: "/publish/article",
	},
	{
		name: "Note",
		type: "note",
		icon: "📔",
		endpoint: "/publish/note",
	},
	{
		name: "Reply",
		type: "reply",
		icon: "↪",
		endpoint: "/publish/reply",
	},
	{
		name: "RSVP",
		type: "rsvp",
		icon: "↪",
		endpoint: "/publish/rsvp",
	},
	{
		name: "Like",
		type: "like",
		icon: "♥",
		endpoint: "/publish/like",
	},
	{
		name: "Repost",
		type: "repost",
		icon: "♺",
		endpoint: "/publish/repost",
	},
	{
		name: "Photo",
		type: "photo",
		icon: "📷",
		endpoint: "/publish/photo",
	},
	{
		name: "Video",
		type: "video",
		icon: "🎥",
		endpoint: "/publish/video",
	},
	{
		name: "Event",
		type: "event",
		icon: "📅",
		endpoint: "/publish/event",
	},
];
