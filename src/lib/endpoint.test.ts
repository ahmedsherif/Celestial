import {
	endpointsWanted,
	findEndpointInBody,
	findEndpointInHeaders,
} from "./endpoint";

import httpLinkHeader from "http-link-header";
const rawLinkHeaders = `<https://switchboard.p3k.io/>; rel="hub", <https://aaronparecki.com/auth>; rel="authorization_endpoint", <https://aaronparecki.com/micropub>; rel="micropub", <https://aperture.p3k.io/microsub/1>; rel="microsub", <https://aaronparecki.com/auth/token>; rel="token_endpoint", <https://aaronparecki.com/>; rel="self"`;
const parsedLinkHeaders = new httpLinkHeader(rawLinkHeaders);
const expectedEndpointsFromHttp = {
	authorization_endpoint: "https://aaronparecki.com/auth",
	token_endpoint: "https://aaronparecki.com/auth/token",
	micropub: "https://aaronparecki.com/micropub",
};

import cheerio from "cheerio";
const rawHtml = `<!DOCTYPE html><html lang="en" class="font-sans"><head><meta charset="utf-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><link href="/assets/css/style.css" rel="stylesheet"><link rel="feed" href="/articles/"><link rel="feed" href="/notes/"><link href="/feed.xml" rel="alternate" title="Ru&apos;s articles, notes, replies, and more." type="application/atom+xml"><link href="/articles.xml" rel="alternate" title="Ru&apos;s blog on front-end development." type="application/atom+xml"><link href="/notes.xml" rel="alternate" title="Ru&apos;s notes on... things. Generally tech-focussed but not necessarily." type="application/atom+xml"><meta name="Description" content="Ru Singh&apos;s home on the internet. A remote-first frontend developer working with React, WordPress, and various static site generators. Features their published articles, and their work."><link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180"><link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png"><link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png"><link href="/site.webmanifest" rel="manifest"><title class>Ru Singh - Home</title><meta property="og:site_name" content="Ru Singh" key="ogsitename"><meta property="og:title" content="Home" key="ogtitle"><meta property="twitter:title" content="Home"><meta property="og:description" content="Ru Singh&apos;s home on the internet. A remote-first frontend developer working with React, WordPress, and various static site generators. Features their published articles, and their work." key="ogdesc"><meta property="twitter:description" content="Ru Singh&apos;s home on the internet. A remote-first frontend developer working with React, WordPress, and various static site generators. Features their published articles, and their work."><meta property="og:url" content="https://rusingh.com/" key="ogurl"><meta property="og:image" content="https://rusingh.com/assets/img/authors/rusingh.jpg" key="ogimage"><meta property="twitter:image" content="https://rusingh.com/assets/img/authors/rusingh.jpg"><meta name="twitter:creator" content="iamhirusi" key="twhandle"><link href="https://webmention.io/rusingh.com/webmention" rel="webmention"><link href="https://webmention.io/rusingh.com/xmlrpc" rel="pingback"><link href="https://indieauth.com/auth" rel="authorization_endpoint"><link href="https://tokens.indieauth.com/token" rel="token_endpoint"><link href="https://micropub.runnr.work/micropub" rel="micropub"><script crossorigin="anonymous" integrity="sha256-xibfHD8nwcjXiawc6ZwFPiVG+o4v1oQogcXhA0ZV5vE=" async data-domain="rusingh.com" src="https://goals.rusingh.com/js/index.js"></script><script>window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }</script><script crossorigin="anonymous" defer="defer" integrity="sha384-E4PZh8MWwKQ2W7ANni7xwx6TTuPWtd3F8mDRnaMvJssp5j+gxvP2fTsk1GnFg2gG" src="https://twemoji.maxcdn.com/v/12.1.5/twemoji.min.js"></script><script defer="defer" src="/assets/js/index.min.js"></script></head><body></body></html>`;
const $ = cheerio.load(rawHtml);
const expectedEndpointsFromHtml = {
	authorization_endpoint: "https://indieauth.com/auth",
	token_endpoint: "https://tokens.indieauth.com/token",
	micropub: "https://micropub.runnr.work/micropub",
};

describe("Endpoint discovery", () => {
	describe("From HTTP headers", () => {
		endpointsWanted.forEach((endpoint) => {
			test(`Find ${endpoint.key} header`, () => {
				const result = findEndpointInHeaders(
					parsedLinkHeaders,
					endpoint.name
				);
				expect(result).toEqual(
					expectedEndpointsFromHttp[endpoint.name]
				);
			});
		});
	});

	describe("From page HTML", () => {
		endpointsWanted.forEach((endpoint) => {
			test(`Find ${endpoint.key} header`, () => {
				const result = findEndpointInBody($, endpoint);
				expect(result).toEqual(
					expectedEndpointsFromHtml[endpoint.name]
				);
			});
		});
	});
});
