import { parseBody, parseVocabulary, parseProperty } from "./microformats";

describe("Get Microformats data from HTML", () => {
	let document: string;

	beforeAll(() => {
		document = `<!DOCTYPE html><html lang="en"><head></head><body><section class="h-card"><img src="https://example.com/jane-doe.jpg" class="u-photo" /><h1 class="p-name">Jane Doe</h1></section></body></html>`;
	});

	test("should get entire document", () => {
		const result = parseBody(document, "https://example.com");

		expect(result.items).toHaveLength(1);
		expect(result.items).toStrictEqual([
			{
				properties: {
					name: ["Jane Doe"],
					photo: ["https://example.com/jane-doe.jpg"],
				},
				type: ["h-card"],
			},
		]);
	});

	test("should get specified vocabulary", () => {
		const result = parseVocabulary(
			document,
			"https://example.com/",
			"h-card"
		);

		expect(result).toStrictEqual({
			properties: {
				name: ["Jane Doe"],
				photo: ["https://example.com/jane-doe.jpg"],
			},
			type: ["h-card"],
		});
	});

	test("should return undefined if specified vocabulary not found", () => {
		const result = parseVocabulary(
			document,
			"https://example.com/",
			"h-event"
		);

		expect(result).toBeUndefined();
	});

	test("should get specified property from vocabulary", () => {
		const result = parseProperty(
			document,
			"https://example.com",
			"h-card",
			"name"
		);

		expect(result).toStrictEqual(["Jane Doe"]);
	});

	test("should be undefined when missing property is requested", () => {
		const result = parseProperty(
			document,
			"https://example.com",
			"h-card",
			"pronouns"
		);

		expect(result).toBeUndefined();
	});
});
