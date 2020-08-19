import { makeUrl, isValidUrl, getProfileAndDiscoveryUrls } from "./user";
import fetchMock from "jest-fetch-mock";

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

	const expected = [
		"http://example.com/",
		"https://example.com/",
		"https://example.com/indieweb",
		"http://192.168.0.1/",
		"http://[2607:f0d0:1002:51::4]/",
	];
	expected.forEach((testUrl: string) => {
		test(`should return true for a valid URL such as ${testUrl}`, () => {
			const result = isValidUrl(new URL(testUrl));
			expect(result).toBeTruthy();
		});
	});
});

describe("Profile and discovery URLs", () => {
	beforeEach(() => {
		fetchMock.resetMocks();
	});

	test("should handle a successful response with temporary redirect", () => {
		expect.assertions(1);

		// @ts-ignore
		fetchMock
			.mockResponseOnce(() => ({
				status: 302,
				headers: {
					Location: "https://example.com/profile/",
				},
			}))
			.mockResponseOnce(() => ({
				status: 200,
			}));

		expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/temporary_redirect/"
			)
		).resolves.toMatchObject({
			profileUrl: "https://example.com/temporary_redirect/",
			discoveryUrl: "https://example.com/profile/",
		});
	});

	test("should handle an errant response with temporary redirect", () => {
		expect.assertions(1);

		// @ts-ignore
		fetchMock.mockResponse(() => ({
			status: 307,
		}));

		expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/temporary_redirect_no_location/"
			)
		).rejects.toThrowError(
			"We were given a temporary redirect to follow but the Location HTTP header was missing."
		);
	});

	test("should handle a successful response from permanent redirect", () => {
		expect.assertions(1);

		// @ts-ignore
		fetchMock
			.mockResponseOnce(() => ({
				status: 301,
				headers: {
					Location: "https://example.com/profile/",
				},
			}))
			.mockResponseOnce(() => ({
				status: 200,
			}));

		expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/permanent_redirect/"
			)
		).resolves.toMatchObject({
			profileUrl: "https://example.com/profile/",
			discoveryUrl: "https://example.com/profile/",
		});
	});

	test("should handle a bad response from permanent redirect", () => {
		expect.assertions(1);

		// @ts-ignore
		fetchMock.mockResponse(() => ({
			status: 308,
		}));

		expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/permanent_redirect_no_location/"
			)
		).rejects.toThrowError(
			"We were given a permanent redirect to follow but the Location HTTP header was missing."
		);
	});

	test("should handle a no-redirect address", () => {
		expect.assertions(1);

		// @ts-ignore
		fetchMock.mockResponse(() => ({
			status: 200,
		}));

		expect(
			getProfileAndDiscoveryUrls("https://example.com/profile/")
		).resolves.toMatchObject({
			profileUrl: "https://example.com/profile/",
			discoveryUrl: "https://example.com/profile/",
		});
	});
});
