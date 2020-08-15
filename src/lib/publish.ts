import { DateTime } from "luxon";
import { Request as ExpressRequest } from "express";
import { URLSearchParams } from "url";
import slug from "slug";

const deriveDate = (
	date: string,
	time: string,
	userTimezone: string
): string => {
	const [year, month, day] = date.split("-");
	const [hour, minute] = time.split(":");
	// TODO Cleaner API for converting to numbers?
	return DateTime.fromObject({
		year: parseInt(year),
		month: parseInt(month),
		day: parseInt(day),
		hour: parseInt(hour),
		minute: parseInt(minute),
		zone: userTimezone,
	})
		.toUTC()
		.toISO();
};

const prepareParams = (req: ExpressRequest): URLSearchParams => {
	const params = new URLSearchParams();

	// The date and time we receive are in user's tz
	const published = deriveDate(
		req.body?.date,
		req.body?.time,
		req.session?.user?.preferences?.timezone
	);
	params.append("published", published.toString());

	// Can be a string, an emtpy string, or an array of string
	if (req.body?.["mp-syndicate-to"] && req.body["mp-syndicate-to"] !== "") {
		if (Array.isArray(req.body["mp-syndicate-to"])) {
			// Is an array
			for (const target of req.body["mp-syndicate-to"]) {
				params.append("mp-syndicate-to[]", target);
			}
		} else {
			// Is a string
			params.append("mp-syndicate-to", req.body["mp-syndicate-to"]);
		}
	}

	// Add slug
	// Slugify as a fail-safe
	if (req.body?.["mp-slug"] && req.body?.["mp-slug"] !== "") {
		params.append(
			"mp-slug",
			slug(req.body["mp-slug"], {
				replacement: "-",
				lower: true,
			})
		);
	}

	// Post type - entry, review, resume, etc.
	params.append("h", req.body.h);

	// All other properties
	// TODO add these dynamically instead of cherry picking. we want this to be a common publishing endpoint for all types of publishing requests.

	// Content (can also be a quote in case of like)
	if (req.body?.content) params.append("content", req.body.content);

	if (req.body?.["like-of"]) params.append("like-of", req.body["like-of"]);

	if (req.body?.["in-reply-to"])
		params.append("in-reply-to", req.body["in-reply-to"]);

	if (req.body?.["repost-of"])
		params.append("repost-of", req.body["repost-of"]);

	return params;
};

export { prepareParams, deriveDate };
