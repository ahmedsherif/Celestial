import {
	endpointsWanted,
	findEndpointInBody,
	setEndpointsFromBody,
	findEndpointInHeaders,
	setEndpointsFromHeaders,
} from "./endpoint";

import httpLinkHeader from "http-link-header";
const rawLinkHeaders = `<https://switchboard.p3k.io/>; rel="hub", <https://aaronparecki.com/auth>; rel="authorization_endpoint", <https://aaronparecki.com/micropub>; rel="micropub", <https://aperture.p3k.io/microsub/1>; rel="microsub", <https://aaronparecki.com/auth/token>; rel="token_endpoint", <https://aaronparecki.com/>; rel="self"`;
const parsedLinkHeaders = new httpLinkHeader(rawLinkHeaders);
const expectedEndpointsFromHttp = {
	authorization: "https://aaronparecki.com/auth",
	token: "https://aaronparecki.com/auth/token",
	micropub: "https://aaronparecki.com/micropub",
};

import cheerio from "cheerio";
const rawHtml = `<!DOCTYPE html><html lang="en"><head><link href="https://webmention.io/rusingh.com/webmention" rel="webmention"><link href="https://webmention.io/rusingh.com/xmlrpc" rel="pingback"><link href="https://indieauth.com/auth" rel="authorization_endpoint"><link href="https://tokens.indieauth.com/token" rel="token_endpoint"><link href="https://micropub.runnr.work/micropub" rel="micropub"></head><body></body></html>`;
const $ = cheerio.load(rawHtml);
const expectedEndpointsFromHtml = {
	authorization: "https://indieauth.com/auth",
	token: "https://tokens.indieauth.com/token",
	micropub: "https://micropub.runnr.work/micropub",
};

describe("Endpoint discovery", () => {
	describe("From HTTP headers", () => {
		endpointsWanted.forEach((endpoint) => {
			test(`should find ${endpoint.name}`, () => {
				const result = findEndpointInHeaders(
					parsedLinkHeaders,
					endpoint.name
				);
				expect(result).toEqual(expectedEndpointsFromHttp[endpoint.key]);
			});
		});
	});

	describe("From page HTML", () => {
		endpointsWanted.forEach((endpoint) => {
			test(`should find ${endpoint.name}`, () => {
				const result = findEndpointInBody($, endpoint);
				expect(result).toEqual(expectedEndpointsFromHtml[endpoint.key]);
			});
		});
	});
});

describe("Set endpoints in session", () => {
	let expressRequest;

	beforeEach(() => {
		expressRequest = { session: {} };
	});

	test("should read and set session data from HTTP headers", () => {
		setEndpointsFromHeaders(expressRequest, parsedLinkHeaders);
		expect(expressRequest.session).toMatchObject({
			endpoints: {
				...expectedEndpointsFromHttp,
			},
		});
	});

	test("should read and set session data from page HTML", () => {
		setEndpointsFromBody(expressRequest, $);
		expect(expressRequest.session).toMatchObject({
			endpoints: {
				...expectedEndpointsFromHtml,
			},
		});
	});
});
