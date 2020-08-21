import * as env from "env-var";
const inflect = require("i")();
import path from "path";
const pacman = require(path.join(process.cwd(), "/package.json"));

export const PORT: number = env.get("PORT").default("4000").asPortNumber();

export const REDIS_URL: string = env.get("REDIS_URL").default("").asUrlString();

export const APP_TITLE: string = inflect.titleize(pacman.name);

export const APP_SUBTITLE: string = pacman.description;

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
