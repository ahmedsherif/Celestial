import { DateTime } from "luxon";
import { Request as ExpressRequest } from "express";
import { URLSearchParams } from "url";
import slug from "slug";

import { isValidTimeZone } from "./user";

const deriveDate = (
	date: string,
	time: string,
	userTimezone: string
): string | Error => {
	try {
		if (!date.match(/\d{4}\-\d{2}\-\d{2}/gi))
			throw new Error("The date was provided in an incorrect format.");

		if (!time.match(/\d{2}\:\d{2}/))
			throw new Error("The time was provided in an incorrect format.");

		if (!isValidTimeZone(userTimezone))
			throw new Error(
				"The timezone appears to be incorrect. Try changing it in preferences?"
			);

		const [year, month, day] = date.split("-");
		const [hour, minute] = time.split(":");

		return DateTime.fromObject({
			year: parseInt(year, 10),
			month: parseInt(month, 10),
			day: parseInt(day, 10),
			hour: parseInt(hour, 10),
			minute: parseInt(minute, 10),
			zone: userTimezone,
		})
			.toUTC()
			.toISO();
	} catch (error) {
		return new Error(
			`We could not create a valid date from the given data. More details: ${error.message}`
		);
	}
};

const setSyndicationTargets = (
	params: URLSearchParams,
	syndicationTargets: string | string[]
) => {
	// Can be a string, an emtpy string, or an array of string
	if (syndicationTargets && syndicationTargets !== "") {
		if (Array.isArray(syndicationTargets)) {
			// Is an array
			for (const target of syndicationTargets) {
				params.append("mp-syndicate-to[]", target);
			}
		} else {
			// Is a string
			params.append("mp-syndicate-to", syndicationTargets);
		}
	}
};

const setDate = (
	params: URLSearchParams,
	type: string,
	date: string,
	time: string,
	timezone: string
): void | Error => {
	// The date and time we receive are to be treated such that they are in the user's tz
	const datetime = deriveDate(date, time, timezone);
	if (datetime instanceof Error) return datetime;
	else params.append(type, datetime.toString());
};

const setSlug = (params: URLSearchParams, indicativeSlug: string) => {
	if (indicativeSlug && indicativeSlug !== "") {
		params.append(
			"mp-slug",
			// Slugify as a fail-safe
			slug(indicativeSlug, {
				replacement: "-",
				lower: true,
			})
		);
	}
};

const prepareParams = (req: ExpressRequest): URLSearchParams | Error => {
	const params = new URLSearchParams();

	// h-*
	if (req.body?.h && req.body?.h === "")
		return new Error("An h-* property must be available.");
	params.append("h", req.body.h);

	// mp-*
	// It might be possible to have a common setter for syndication targets and categories, since they both behave in a similar manner
	setSyndicationTargets(params, req.body?.["mp-syndicate-to"]);
	setSlug(params, req.body?.["mp-slug"]);

	const response = setDate(
		params,
		"published",
		req.body?.date,
		req.body?.time,
		req.session?.user?.preferences?.timezone
	);
	if (response instanceof Error) return response;

	params.append("h", req.body.h);

	// For the remaining properties, some basic rules:
	// - Removing the prefix, no two property names shall clash. If they do, only the first one takes effect.
	// - Do not handle manually managed properties.

	const manuallyManagedProperties = [
		"mp-syndicate-to",
		"mp-slug",
		"dt-published",
		"dt-updated",
		"h",
	];

	for (const formInput in req.body) {
		if (!manuallyManagedProperties.includes(formInput)) {
			const mf2Key = formInput.slice(formInput.indexOf("-") + 1);
			const mf2Value = req.body[formInput];

			if (params.get(mf2Key)) continue;
			else params.append(mf2Key, mf2Value);
		}
	}

	return params;
};

export { prepareParams, deriveDate };
