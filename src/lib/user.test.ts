import { makeUrl } from "./user";

const urls = {
	given: [
		"example.com",
		"EXAMPLE.COM",
		"HTTP://EXAMPLE.COM",
		"http://example.com",
		"https://example.com",
		"http://example.com/",
		"https://example.com/",
		"https://example.com/indieweb",
	],
	expected: [
		"http://example.com/",
		"http://example.com/",
		"http://example.com/",
		"http://example.com/",
		"https://example.com/",
		"http://example.com/",
		"https://example.com/",
		"https://example.com/indieweb",
	],
};

describe("Get a URL object from user-input URL", () => {
	urls.given.forEach((gUrl, index) => {
		test(`should make URL from ${gUrl}`, () => {
			const url = makeUrl(gUrl);
			expect(url.toString()).toBe(urls.expected[index]);
		});
	});
});
