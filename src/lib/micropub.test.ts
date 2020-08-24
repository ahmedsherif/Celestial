import { queryServer, setMicropubCapabilities } from "./micropub";
import fetchMock from "jest-fetch-mock";
import { MicropubQueryType } from "../enumerator/Micropub";

describe("Get capabilities/properties of the Micropub server", () => {
	let request: any;

	beforeEach(() => {
		request = {
			session: {
				endpoints: {
					micropub: "https://example.com/micropub/",
				},
				indieauth: {
					access_token: "foobar",
					token_type: "Bearer",
				},
			},
		};

		fetchMock.resetMocks();
	});

	const responsesToTest = {
		[MicropubQueryType.syndicationTargets]: {
			unexpectedJsonNonObject: [
				{
					uid: "https://archive.org/",
					name: "archive.org",
				},
				{
					uid: "https://wikimedia.org/",
					name: "WikiMedia",
				},
			],
			unexpectedJsonMissingKey: {
				uid: "https://archive.org/",
				name: "archive.org",
			},
			expectedJson: {
				"syndicate-to": [
					{
						uid: "https://archive.org/",
						name: "archive.org",
					},
					{
						uid: "https://wikimedia.org/",
						name: "WikiMedia",
					},
				],
			},
		},
		[MicropubQueryType.configuration]: {
			expectedJson: {},
		},
		[MicropubQueryType.categories]: {
			expectedJson: {
				categories: ["tag1", "tag2", "tag3", "tag4", "tag5"],
			},
		},
		[MicropubQueryType.source]: {
			expectedJson: {},
		},
	};

	for (const micropubQueryTypeKey in MicropubQueryType) {
		describe(`Handle ${MicropubQueryType[micropubQueryTypeKey]} query`, () => {
			test("should handle query being unsupported (HTTP 404)", async () => {
				expect.assertions(2);

				fetchMock.mockRejectOnce(async () => ({
					status: 404,
				}));

				await expect(
					queryServer(
						request,
						MicropubQueryType[micropubQueryTypeKey]
					)
				).rejects.toThrowError(
					`We did not receive a successful response from your Micropub server for our ${MicropubQueryType[micropubQueryTypeKey]} query request.`
				);

				expect(fetchMock.mock.calls.length).toBe(1);
			});

			test("should handle query being unsupported (HTTP 200 with HTML)", async () => {
				expect.assertions(2);

				fetchMock.mockResponseOnce(async () => ({
					status: 200,
					headers: {
						"content-type": "text/html",
					},
				}));

				await expect(
					queryServer(
						request,
						MicropubQueryType[micropubQueryTypeKey]
					)
				).rejects.toThrowError(
					`We received a successful response from your Micropub server for our ${MicropubQueryType[micropubQueryTypeKey]} query request, but the server did not send JSON data. Please file an issue with your server's author/maintainer.`
				);

				expect(fetchMock.mock.calls.length).toBe(1);
			});

			test("should handle query being unsupported (HTTP 200 with text)", async () => {
				expect.assertions(2);

				fetchMock.mockResponseOnce(async () => ({
					status: 200,
					headers: {
						"content-type": "text/plain",
					},
				}));

				await expect(
					queryServer(
						request,
						MicropubQueryType[micropubQueryTypeKey]
					)
				).rejects.toThrowError(
					`We received a successful response from your Micropub server for our ${MicropubQueryType[micropubQueryTypeKey]} query request, but the server did not send JSON data. Please file an issue with your server's author/maintainer.`
				);

				expect(fetchMock.mock.calls.length).toBe(1);
			});

			if (
				MicropubQueryType[micropubQueryTypeKey].unexpectedJsonNonObject
			) {
				test("should handle query returning unexpected JSON (non-object)", async () => {
					// The correct response is to return a JSON object, with a syndicate-to key carrying an array
					// Here, we check if the server returns data, but in the wrong format.
					expect.assertions(2);

					fetchMock.mockResponseOnce(async () => ({
						status: 200,
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify(
							responsesToTest[
								MicropubQueryType[micropubQueryTypeKey]
							].unexpectedJsonNonObject
						),
					}));

					await expect(
						queryServer(
							request,
							MicropubQueryType[micropubQueryTypeKey]
						)
					).rejects.toThrowError(
						"Response is invalid JSON. We expected to see an object. Please file an issue with your Micropub server."
					);

					expect(fetchMock.mock.calls.length).toBe(1);
				});
			}

			if (
				MicropubQueryType[micropubQueryTypeKey].unexpectedJsonMissingKey
			) {
				test("should handle query returning unexpected JSON (object with missing key)", async () => {
					// The correct response is to return a JSON object, with a syndicate-to key carrying an array
					// Here, we check if the server returns data, but in the wrong format.
					expect.assertions(2);

					fetchMock.mockResponseOnce(async () => ({
						status: 200,
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify(
							responsesToTest[
								MicropubQueryType[micropubQueryTypeKey]
							].unexpectedJsonMissingKey
						),
					}));

					await expect(
						queryServer(
							request,
							MicropubQueryType[micropubQueryTypeKey]
						)
					).rejects.toThrowError(
						"Response is invalid JSON. We expect to see a syndicate-to key on the response. Please file an issue with your Micropub server."
					);

					expect(fetchMock.mock.calls.length).toBe(1);
				});
			}

			test("should handle query returning expected JSON", async () => {
				expect.assertions(3);

				Date.now = jest.fn(() => 1482363367071);

				fetchMock.mockResponseOnce(async () => ({
					status: 200,
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify(
						responsesToTest[MicropubQueryType[micropubQueryTypeKey]]
							.expectedJson
					),
				}));

				await expect(
					queryServer(
						request,
						MicropubQueryType[micropubQueryTypeKey]
					)
				).resolves.toBeUndefined();

				expect(request).toStrictEqual({
					session: {
						endpoints: {
							micropub: "https://example.com/micropub/",
						},
						indieauth: {
							access_token: "foobar",
							token_type: "Bearer",
						},
						micropub: {
							...responsesToTest[
								MicropubQueryType[micropubQueryTypeKey]
							].expectedJson,
							lastFetched: {
								[MicropubQueryType[micropubQueryTypeKey]]:
									"2016-12-21T23:36:07.071Z",
							},
						},
					},
				});

				expect(fetchMock.mock.calls.length).toBe(1);
			});
		});
	}

	// TODO Help needed
	// How do we deal with Promise.all?
	test("should fetch syndication data (w/ error) if config query fails and category query succeeds", async () => {
		expect.assertions(2);

		fetchMock
			.mockRejectOnce(async () => ({
				status: 404,
			}))
			.mockRejectOnce(async () => ({
				status: 404,
			}))
			.mockResponseOnce(async () => ({
				status: 200,
			}));

		await expect(setMicropubCapabilities(request)).rejects.toThrowError(
			"We did not receive a successful response from your Micropub server for our syndicate-to query request."
		);

		expect(fetchMock.mock.calls.length).toBe(3);
	});

	test("should fetch category data (w/ error) if config query fails and syndicate-to query succeeds", async () => {
		expect.assertions(2);

		fetchMock
			.mockRejectOnce(async () => ({
				status: 404,
			}))
			.mockResponseOnce(async () => ({
				status: 200,
			}))
			.mockRejectOnce(async () => ({
				status: 404,
			}));

		await expect(setMicropubCapabilities(request)).rejects.toThrowError(
			"We did not receive a successful response from your Micropub server for our category query request."
		);

		expect(fetchMock.mock.calls.length).toBe(3);
	});

	test("should fetch syndication and category data individually (w/ valid response) if config query does not include either data", async () => {
		expect.assertions(3);

		Date.now = jest.fn(() => 1482363367071);

		fetchMock
			.mockResponseOnce(async () => ({
				status: 200,
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({}),
			}))
			.mockResponseOnce(async () => ({
				status: 200,
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					...responsesToTest[MicropubQueryType.syndicationTargets]
						.expectedJson,
				}),
			}))
			.mockResponseOnce(async () => ({
				status: 200,
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					...responsesToTest[MicropubQueryType.categories]
						.expectedJson,
				}),
			}));

		await expect(setMicropubCapabilities(request)).resolves.toBeUndefined();

		expect(request).toStrictEqual({
			session: {
				endpoints: {
					micropub: "https://example.com/micropub/",
				},
				indieauth: {
					access_token: "foobar",
					token_type: "Bearer",
				},
				micropub: {
					...responsesToTest[MicropubQueryType.syndicationTargets]
						.expectedJson,
					...responsesToTest[MicropubQueryType.categories]
						.expectedJson,
					lastFetched: {
						[MicropubQueryType.configuration]:
							"2016-12-21T23:36:07.071Z",
						[MicropubQueryType.syndicationTargets]:
							"2016-12-21T23:36:07.071Z",
						[MicropubQueryType.categories]:
							"2016-12-21T23:36:07.071Z",
					},
				},
			},
		});

		expect(fetchMock.mock.calls.length).toBe(3);
	});
});
