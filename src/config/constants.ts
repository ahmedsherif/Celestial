import * as env from "env-var";
const inflect = require("i")();
// import { URL } from "url";

export const PORT: number = env.get("PORT").default("4000").asPortNumber();

export const REDIS_URL: string | undefined = env.get("REDIS_URL").asUrlString();

export const APP_TITLE: string = inflect.titleize(
	require("/app/package.json").name
);

export const APP_SUBTITLE: string = require("/app/package.json").description;

export const INDIEAUTH_CLIENT: {
	client_id: string;
	redirect_uri: string;
} = {
	client_id: "http://localhost:4000/",
	redirect_uri: "http://localhost:4000/login/callback/",
};
