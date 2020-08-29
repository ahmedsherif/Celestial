import { DateTime } from "luxon";
import { Request as ExpressRequest } from "express";
import { URLSearchParams } from "url";
import slug from "slug";

import { isValidTimeZone } from "./user";
import { POST_TYPES } from "../config/constants";
import { logger } from "./logger";
import { LogLevels } from "../enumerator/LogLevels";
import { VocabularyItems, VocabularyItem } from "../interface/Micropub";

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

const deriveMf2Key = (key: string) => {
	return key.slice(key.indexOf("-") + 1);
};

const setMultipleValues = (
	params: URLSearchParams,
	keyName: string,
	body: ExpressRequest["body"]
) => {
	// Can be a string, an emtpy string, or an array of string
	if (body?.[keyName] && body?.[keyName] !== "") {
		if (Array.isArray(body?.[keyName])) {
			// Is an array
			for (const target of body?.[keyName]) {
				params.append(`${keyName}[]`, target);
			}
		} else {
			// Is a string
			params.append(keyName, body?.[keyName]);
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

	// Properties which may be a string, or an "array" as used in url-encoded requests
	setMultipleValues(params, "mp-syndicate-to", req.body);
	setMultipleValues(params, "category", req.body);

	// mp-*
	setSlug(params, req.body?.["mp-slug"]);

	// dt-published
	if (req.body?.date && req.body?.time) {
		const response = setDate(
			params,
			"published",
			req.body?.date,
			req.body?.time,
			req.session?.user?.preferences?.timezone
		);
		if (response instanceof Error) return response;
	}
	// else proceed, Micropub server will default to "now"

	// dt-start
	if (
		req.body?.["h-event__dt-start--date"] &&
		req.body?.["h-event__dt-start--time"]
	) {
		const response = setDate(
			params,
			"dt-start",
			req.body?.["h-event__dt-start--date"],
			req.body?.["h-event__dt-start--time"],
			req.session?.user?.preferences?.timezone
		);
		if (response instanceof Error) return response;
	}

	// dt-end
	if (
		req.body?.["h-event__dt-end--date"] &&
		req.body?.["h-event__dt-end--time"]
	) {
		const response = setDate(
			params,
			"dt-end",
			req.body?.["h-event__dt-end--date"],
			req.body?.["h-event__dt-end--time"],
			req.session?.user?.preferences?.timezone
		);
		if (response instanceof Error) return response;
	}

	// For the remaining properties, some basic rules:
	// - Removing the prefix, no two property names shall clash. If they do, only the first one takes effect.
	// - Do not handle manually managed properties.

	const manuallyManagedProperties = [
		"h",
		"mp-syndicate-to",
		"mp-slug",
		"category",
		"date",
		"time",
		"h-event__dt-start--date",
		"h-event__dt-start--time",
		"h-event__dt-end--date",
		"h-event__dt-end--time",
	];

	for (const formInput in req.body) {
		if (!manuallyManagedProperties.includes(formInput)) {
			const mf2Key = deriveMf2Key(formInput);
			const mf2Value = req.body[formInput];

			if (params.get(mf2Key)) continue;
			else params.append(mf2Key, mf2Value);
		}
	}

	return params;
};

const getPostsNavigation = (
	serverPostTypes:
		| Array<{
				name: string;
				type: string;
		  }>
		| undefined
): VocabularyItems => {
	if (serverPostTypes !== undefined) {
		// Return union of what we support and what the server supports
		let unionPostTypes: Array<VocabularyItem> = [];
		POST_TYPES.forEach((POST_TYPE) => {
			if (
				serverPostTypes !== undefined &&
				serverPostTypes.findIndex(
					(spt) => spt.type === POST_TYPE.type
				) !== -1
			)
				unionPostTypes.push(POST_TYPE);
		});

		logger.log(LogLevels.debug, "Supported post types determined", {
			postsNavigation: unionPostTypes,
		});

		return unionPostTypes;
	} else {
		// Return everything we support
		return POST_TYPES;
	}
};

export {
	prepareParams,
	setDate,
	deriveDate,
	setMultipleValues,
	setSlug,
	deriveMf2Key,
	getPostsNavigation,
};
