import { deriveDate } from "./publish";

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
