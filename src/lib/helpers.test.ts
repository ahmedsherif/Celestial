import { pageDataHelper, postDataHelper, enumValuesAsArray } from "./helpers";
import { AppUserState } from "../enumerator/AppUserState";
import { FormEncoding } from "../enumerator/FormEncoding";

describe("Data helpers for Express routes", () => {
	describe("Data helpers for default pages", () => {
		let request;

		beforeEach(() => {
			request = {
				session: {
					appState: AppUserState.User,
					user: {
						profileUrl: "https://example.com",
						microformats: {
							name: "Jane",
							photo: "https://example.com/",
						},
						preferences: {
							timezone: "Asia/Kolkata",
							formEncoding: FormEncoding.URLEncoded,
						},
					},
				},
			};
		});

		test("should return default page data when no extra data provided", () => {
			const pageData = pageDataHelper(request);

			expect(pageData).toMatchSnapshot();
		});

		test("should return merged page data when extra data provided", () => {
			const pageData = pageDataHelper(request, { priority: "high" });

			expect(pageData).toMatchSnapshot();
		});

		test("should overwrite default page data when extra data provided", () => {
			const pageData = pageDataHelper(request, {
				user: { microformats: { name: "John Doe" } },
			});

			expect(pageData).toMatchSnapshot();
		});
	});

	describe("Data helpers for post pages", () => {
		let request;

		beforeAll(() => {
			// Luxon uses Date constructor internally. We mock the current date-time so the snapshots are consistent.
			Date.now = jest.fn(() => 1482363367071);
		});

		beforeEach(() => {
			request = {
				session: {
					appState: AppUserState.User,
					user: {
						profileUrl: "https://example.com",
						microformats: {
							name: "Jane",
							photo: "https://example.com/",
						},
						preferences: {
							timezone: "Asia/Kolkata",
							formEncoding: FormEncoding.URLEncoded,
						},
					},
				},
			};
		});

		test("should return default post data when no extra data provided", () => {
			const postData = postDataHelper(request);

			expect(postData).toMatchSnapshot();
		});

		test("should return merged post data when extra data provided", () => {
			const postData = postDataHelper(request, { priority: "high" });

			expect(postData).toMatchSnapshot();
		});

		test("should overwrite default post data when extra data provided", () => {
			const postData = postDataHelper(request, {
				formDefaults: {
					published: { date: "2020-01-01", time: "10:00" },
				},
			});

			expect(postData).toMatchSnapshot();
		});
	});
});

describe("Miscellaneous utilities", () => {
	test("should return an array of values for an enum with values", () => {
		enum example {
			foo = "bar",
			hello = "world",
		}

		const result = enumValuesAsArray(example);

		expect(result).toStrictEqual(["bar", "world"]);
	});
});
