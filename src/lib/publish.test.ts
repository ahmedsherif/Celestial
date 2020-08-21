import {
	deriveDate,
	setSyndicationTargets,
	setDate,
	deriveMf2Key,
	prepareParams,
	setSlug,
} from "./publish";

import { URLSearchParams } from "url";

describe("Understand browser-formatted date-time", () => {
	test("should return an ISO date (UTC) given valid input", () => {
		const date = deriveDate("2020-08-20", "14:45", "Asia/Kolkata");

		expect(date).toBe("2020-08-20T09:15:00.000Z");
	});

	test("should error with any invalid input", () => {
		const args = [
			["2020/08/20", "14:45", "Asia/Kolkata"],
			["2020-08-20", "14.45", "Asia/Kolkata"],
			["2020-08-20", "14.45", "Asia/Calcutta"],
			["2020-08-20", "14:45", "Asia"],
		];

		expect.assertions(args.length);

		args.forEach((a: string[]) => {
			const date = deriveDate(a[0], a[1], a[2]);
			expect(date).toBeInstanceOf(Error);
		});
	});
});

describe("Receive mf2 properties and translate them into submission data", () => {
	let params: URLSearchParams;
	beforeEach(() => {
		params = new URLSearchParams();
	});

	describe("", () => {});

	test("should handle no syndication targets", () => {
		setSyndicationTargets(params, "");

		expect(params.get("syndication-targets")).toBeNull();
	});

	test("should handle a single syndication target", () => {
		const target = "https://mastodon.social/@example";

		setSyndicationTargets(params, target);

		expect(params.get("mp-syndicate-to")).toBe(target);
	});

	test("should handle multiple syndication targets", () => {
		const target = [
			"https://mastodon.social/@example",
			"https://mastodon.social/@example2",
		];

		setSyndicationTargets(params, target);

		params
			.getAll("my-syndicate-to")
			.forEach((st: string, index: number) => {
				expect(st).toBe(target[index]);
			});
	});

	test("should handle published date", () => {
		setDate(params, "published", "2020-08-21", "12:17", "Asia/Kolkata");

		expect(params.get("published")).toBe("2020-08-21T06:47:00.000Z");
	});

	test("should handle updated date", () => {
		setDate(params, "updated", "2020-08-21", "12:18", "Asia/Kolkata");

		expect(params.get("updated")).toBe("2020-08-21T06:48:00.000Z");
	});

	describe("should set correct slug for a variety of values", () => {
		const slugs = {
			given: [
				"hello world",
				"hello-world",
				"HELLO-WORLD",
				"HELLO WORLD",
				"foo $ bar",
				"some news 😊",
				"I'm graduating!",
			],
			expected: [
				"hello-world",
				"hello-world",
				"hello-world",
				"hello-world",
				"foo-dollar-bar",
				"some-news",
				"im-graduating",
			],
		};

		slugs.given.forEach((slug: string, index: number) => {
			test(`should set correct slug for ${slug}`, () => {
				setSlug(params, slug);
				expect(params.get("mp-slug")).toBe(slugs.expected[index]);
			});
		});
	});

	describe("Derivation of property key from mf2 key equivalent", () => {
		const mf2 = {
			given: [
				"h-entry",
				"h-review",
				"h-resume",
				"h-event",
				"h-cite",
				"u-url",
				"u-in-reply-to",
				"u-like-of",
				"u-repost-of",
				"p-name",
				"p-summary",
				"e-content",
			],
			expected: [
				"entry",
				"review",
				"resume",
				"event",
				"cite",
				"url",
				"in-reply-to",
				"like-of",
				"repost-of",
				"name",
				"summary",
				"content",
			],
		};

		mf2.given.forEach((key: string, index: number) => {
			test(`should derive key for ${key} correctly`, () => {
				const derivedKey = deriveMf2Key(key);
				expect(derivedKey).toBe(mf2.expected[index]);
			});
		});
	});

	describe("should handle complete requests with varying properties", () => {
		let request;
		beforeEach(() => {
			request = {
				body: {},
			};
		});

		test("should fail if h property is missing", () => {
			request.body = {
				date: "2020-02-02",
				time: "02:02",
				"e-content": "Foo bar",
			};

			const params = prepareParams(request);

			expect(params).toBeInstanceOf(Error);
		});

		test("should not fail if date-time is missing", () => {
			// ...the Micropub server will default to "now"
			request.body = {
				h: "entry",
				"e-content": "Foo bar",
			};

			const params = prepareParams(request);

			expect(params).toBeInstanceOf(URLSearchParams);

			Object.keys(request.body).forEach((mf2Property) => {
				expect(
					(params as URLSearchParams).get(deriveMf2Key(mf2Property))
				).toBe(request.body[mf2Property]);
			});
		});
	});
});
