import { Request as ExpressRequest } from "express";
import _merge from "lodash.merge";
import { DateTime } from "luxon";

import { APP_TITLE, APP_SUBTITLE } from "../config/constants";
import { AppUserState } from "../enumerator/AppUserState";
import {
	DefaultPageData,
	PostPageData,
	AuthPageData,
	UserPageData,
} from "../interface/PageData";

const getBaseData = (req: ExpressRequest) => {
	return {
		title: APP_TITLE,
		subtitle: APP_SUBTITLE,
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

export { pageDataHelper, postDataHelper, enumValuesAsArray, isObject };
