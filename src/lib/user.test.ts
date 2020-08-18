import { makeUrl, isValidUrl } from "./user";

describe("Derive an assumed URL from user-input URL", () => {
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
			"192.168.0.1",
			"[2607:f0d0:1002:0051:0000:0000:0000:0004]",
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
			"http://192.168.0.1/",
			"http://[2607:f0d0:1002:51::4]/",
		],
	};

	urls.given.forEach((gUrl, index) => {
		test(`should make expected URL from ${gUrl}`, () => {
			const url = makeUrl(gUrl);
			expect(url.toString()).toBe(urls.expected[index]);
		});
	});
});

describe("Validate assumed URL, which was derived from user-input URL", () => {
	test("should return an error if URL contains username", () => {
		const response = isValidUrl(new URL("http://username@example.com/"));
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if URL contains username or password", () => {
		const response = isValidUrl(
			new URL("http://username:password@example.com/")
		);
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if URL contains port", () => {
		const response = isValidUrl(new URL("http://example.com:8080/"));
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if URL contains a scheme other than http or https", () => {
		const response = isValidUrl(
			new URL("ssh://username:password@example.com/")
		);
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if URL contains a hash", () => {
		const response = isValidUrl(
			new URL("http://example.com/indieweb#hello")
		);
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if URL contains a hash", () => {
		const response = isValidUrl(
			new URL("http://example.com/indieweb#hello")
		);
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if web address is an IP address (v4)", () => {
		const response = isValidUrl(new URL("http://192.168.0.1"));
		expect(response).toBeInstanceOf(Error);
	});

	test("should return an error if web address is an IP address (v6)", () => {
		const response = isValidUrl(
			new URL("http://[2607:f0d0:1002:0051:0000:0000:0000:0004]")
		);
		expect(response).toBeInstanceOf(Error);
	});
});
