import { Request as ExpressRequest } from "express";
import _merge from "lodash.merge";
import { DateTime, Duration } from "luxon";

import { APP_TITLE, APP_SUBTITLE, APP_VERSION } from "../config/constants";
import { AppUserState } from "../enumerator/AppUserState";
import {
	DefaultPageData,
	PostPageData,
	AuthPageData,
	UserPageData,
} from "../interface/PageData";
import { getPostsNavigation } from "./publish";
import { logger } from "./logger";
import { LogLevels } from "../enumerator/LogLevels";

const getBaseData = (req: ExpressRequest) => {
	return {
		title: APP_TITLE,
		subtitle: APP_SUBTITLE,
		version: APP_VERSION,
		appState: req.session?.appState || AppUserState.Guest,
		user: {
			microformats: {
				name: req.session?.user?.microformats?.name,
				photo: req.session?.user?.microformats?.photo,
			},
			indieauth: {
				identity: req.session?.user?.profileUrl,
			},
			preferences: {
				timezone: req.session?.user?.preferences?.timezone,
				formEncoding: req.session?.user?.preferences?.formEncoding,
			},
		},
		postsNavigation: getPostsNavigation(
			req.session?.micropub?.["post-types"]
		),
	};
};

/**
 * Currently, the app title, subtitle, app state, and user identity is set by default. You may pass these in as well in case you wish to overwrite the defaults.
 */
const pageDataHelper = (
	req: ExpressRequest,
	data?: object
): DefaultPageData | PostPageData | AuthPageData | UserPageData => {
	return _merge(getBaseData(req), data);
};

const postDataHelper = (req: ExpressRequest, data?: object): PostPageData => {
	return _merge(
		getBaseData(req),
		{
			formDefaults: {
				published: {
					date: DateTime.utc()
						.setZone(req.session?.user?.preferences?.timezone)
						.toFormat("yyyy-MM-dd")
						.toString(),
					time: DateTime.utc()
						.setZone(req.session?.user?.preferences?.timezone)
						.toFormat("HH:mm")
						.toString(),
				},
			},
			micropub: {
				"syndicate-to": req.session?.micropub?.["syndicate-to"],
				"media-endpoint": req.session?.micropub?.["media-endpoint"],
			},
		},
		data
	) as PostPageData;
};

/**
 * @param enumerator {any} TypeScript doesn't support specifying a parameter type check for enums. Be wary of what you're passing in!
 */
const enumValuesAsArray = (enumerator: any): Array<string> => {
	return Object.values(enumerator).map((e: any) => e as string);
};

const isObject = (value: any) => {
	return typeof value === "object" && !Array.isArray(value) && value !== null;
};

const isStale = (date: string, duration: Duration) => {
	const nowMinusDuration = DateTime.utc().minus(duration);

	logger.log(LogLevels.debug, "Checking if date is stale", {
		toCheck: date,
		with: nowMinusDuration.toISO(),
	});

	if (
		DateTime.fromISO(date).toUTC().toMillis() < nowMinusDuration.toMillis()
	) {
		logger.log(LogLevels.debug, "date is stale", {
			toCheck: date,
			with: nowMinusDuration.toISO(),
		});
		return true;
	}
	logger.log(LogLevels.debug, "date is not stale", {
		toCheck: date,
		with: nowMinusDuration.toISO(),
	});
	return false;
};

export { pageDataHelper, postDataHelper, enumValuesAsArray, isObject, isStale };
