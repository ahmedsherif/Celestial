import {
	makeUrl,
	isValidUrl,
	getProfileAndDiscoveryUrls,
	setProfileDetails,
	setUserPreference,
	areAllPreferencesValid,
} from "./user";
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

	test("should handle a successful response with temporary redirect", async () => {
		expect.assertions(2);

		fetchMock
			.mockResponseOnce(async () => ({
				status: 302,
				headers: {
					Location: "https://example.com/profile/",
				},
			}))
			.mockResponseOnce(async () => ({
				status: 200,
			}));

		await expect(
			getProfileAndDiscoveryUrls("https://example.com/temporary/")
		).resolves.toMatchObject({
			profileUrl: "https://example.com/temporary/",
			discoveryUrl: "https://example.com/profile/",
		});

		expect(fetchMock.mock.calls.length).toEqual(2);
	});

	test("should handle a successful response with bad temporary redirect", async () => {
		expect.assertions(2);

		fetchMock
			.mockResponseOnce(async () => ({
				status: 302,
				headers: {
					Location: "https://example.com/profile/",
				},
			}))
			.mockResponseOnce(async () => ({
				status: 500,
			}));

		await expect(
			getProfileAndDiscoveryUrls("https://example.com/temporary/")
		).rejects.toThrowError(
			"We followed a temporary redirect but there was a problem fetching the redirected URL."
		);

		expect(fetchMock.mock.calls.length).toEqual(2);
	});

	test("should handle a bad response with temporary redirect", async () => {
		expect.assertions(1);

		fetchMock.mockResponse(async () => ({
			status: 307,
		}));

		await expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/temporary_no_location/"
			)
		).rejects.toThrowError(
			"We were given a temporary redirect to follow but the Location HTTP header was missing."
		);
	});

	test("should handle a successful response from permanent redirect", async () => {
		expect.assertions(2);

		fetchMock
			.mockResponseOnce(async () => ({
				status: 301,
				headers: {
					Location: "https://example.com/profile/",
				},
			}))
			.mockResponseOnce(async () => ({
				status: 200,
			}));

		await expect(
			getProfileAndDiscoveryUrls("https://example.com/permanent/")
		).resolves.toMatchObject({
			profileUrl: "https://example.com/profile/",
			discoveryUrl: "https://example.com/profile/",
		});

		expect(fetchMock.mock.calls.length).toBe(1);
	});

	test("should handle a bad response from permanent redirect", async () => {
		expect.assertions(1);

		fetchMock.mockResponse(async () => ({
			status: 308,
		}));

		await expect(
			getProfileAndDiscoveryUrls(
				"https://example.com/permanent_no_location/"
			)
		).rejects.toThrowError(
			"We were given a permanent redirect to follow, but the Location HTTP header was missing."
		);
	});

	test("should handle a no-redirect address", async () => {
		expect.assertions(1);

		fetchMock.mockResponse(async () => ({
			status: 200,
		}));

		await expect(
			getProfileAndDiscoveryUrls("https://example.com/profile/")
		).resolves.toMatchObject({
			profileUrl: "https://example.com/profile/",
			discoveryUrl: "https://example.com/profile/",
		});
	});
});

describe("Get name and photo from user's discovery page", () => {
	let request;

	beforeEach(() => {
		request = {
			session: {
				user: {
					discoveryUrl: "https://example.com/",
				},
			},
		};
	});

	test("should set name in session when only name is available", () => {
		expect.assertions(2);

		const rawHtml = `<!DOCTYPE html><html lang="en"><head></head><body><section class="h-card"><h1 class="p-name">Jane Doe</h1></section></body></html>`;

		setProfileDetails(request, rawHtml);

		expect(request.session.user.microformats.name).toBe("Jane Doe");
		expect(request.session.user.microformats.photo).toBeUndefined();
	});

	test("should set photo in session when only photo is available", () => {
		expect.assertions(2);

		const rawHtml = `<!DOCTYPE html><html lang="en"><head></head><body><section class="h-card"><img src="https://example.com/jane-doe.jpg" class="u-photo" /></section></body></html>`;

		setProfileDetails(request, rawHtml);

		expect(request.session.user.microformats.photo).toBe(
			"https://example.com/jane-doe.jpg"
		);
		// ? Why is p-name returning as "" when it is not available
		// Check http://microformats.org/wiki/microformats2-parsing#parsing_a_p-_property
		expect(request.session.user.microformats.name).toBeUndefined();
	});

	test("should set both name and photo in session when both are available", () => {
		expect.assertions(2);

		const rawHtml = `<!DOCTYPE html><html lang="en"><head></head><body><section class="h-card"><img src="https://example.com/jane-doe.jpg" class="u-photo" /><h1 class="p-name">Jane Doe</h1></section></body></html>`;

		setProfileDetails(request, rawHtml);

		expect(request.session.user.microformats.photo).toBe(
			"https://example.com/jane-doe.jpg"
		);
		expect(request.session.user.microformats.name).toBe("Jane Doe");
	});
});

describe("setUserPreference", () => {
	let request;

	beforeEach(() => {
		request = {
			session: {},
		};
	});

	test("should update session with given key and value", () => {
		setUserPreference(request, "timezone", "Asia/Kolkata");

		expect(request.session).toMatchObject({
			user: {
				preferences: {
					timezone: "Asia/Kolkata",
				},
			},
		});
	});

	test("should update session with given key (including a hyphen) and value", () => {
		setUserPreference(request, "timezone-preferred", "Asia/Kolkata");

		expect(request.session).toMatchObject({
			user: {
				preferences: {
					"timezone-preferred": "Asia/Kolkata",
				},
			},
		});
	});
});

describe("User preferences validation", () => {
	test("should fail if an invalid timezone is provided", () => {
		const request = {
			body: { timezone: "Asia/Calcutta" },
		};
		// @ts-ignore
		const response = areAllPreferencesValid(request);
		expect(response).toBe(false);
	});

	test("should fail if an empty timezone is provided", () => {
		const request = {
			body: { timezone: "" },
		};
		// @ts-ignore
		const response = areAllPreferencesValid(request);
		expect(response).toBe(false);
	});

	test("should fail if an invalid form encoding is provided", () => {
		const request = {
			body: { "form-encoding": "abc" },
		};
		// @ts-ignore
		const response = areAllPreferencesValid(request);
		expect(response).toBe(false);
	});

	test("should fail if an empty form encoding is provided", () => {
		const request = {
			body: { "form-encoding": "" },
		};
		// @ts-ignore
		const response = areAllPreferencesValid(request);
		expect(response).toBe(false);
	});

	test("should fail if invalid preferences are provided", () => {
		const requests = [
			{
				body: { "form-encoding": "", timezone: "" },
			},
			{
				body: { "form-encoding": "foo", timezone: "bar" },
			},
			{
				body: { "form-encoding": "foo", timezone: "" },
			},
			{
				body: { "form-encoding": "", timezone: "foo" },
			},
		];
		expect.assertions(requests.length);
		requests.forEach((request) => {
			// @ts-ignore
			const response = areAllPreferencesValid(request);
			expect(response).toBe(false);
		});
	});
});
