import fetch from "node-fetch";
import { Request as ExpressRequest } from "express";
import { URLSearchParams } from "url";

import { logger } from "./logger";
import { LogLevels } from "../enumerator/LogLevels";
import { MicropubConfig, MicropubSyndicationData } from "../interface/Micropub";

// Dummy handler to keep nesting hell readable.
const setMicropubCapabilities = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		setConfigurationData(req)
			.then(() => {
				logger.log(
					LogLevels.debug,
					"We should have syndication targets available in the session by now. If this is not the case, let's try to query them using its dedicated query.",
					{ user: req.session?.user?.profileUrl }
				);
				if (!req.session?.micropub?.["syndicate-to"])
					setSyndicationTargets(req)
						.then(() => resolve())
						.catch((error) => reject(error));
				// We have the syndication endpoints (at least), resolve the micropub capabilities method.
				else resolve();
			})
			.catch((error) => {
				logger.log(
					LogLevels.debug,
					"Maybe the server returned a 404 - for example, if it doesn't support the ?q=config query.",
					{
						user: req.session?.user?.profileUrl,
						error_details: error,
					}
				);
				if (!error.ok) {
					logger.log(
						LogLevels.debug,
						"Let's try to set syndication targets separately through a syndicate-to query.",
						{ user: req.session?.user?.profileUrl }
					);
					setSyndicationTargets(req)
						.then(() => resolve())
						.catch((error) => reject(error));
				}
			});
	});
};

const setConfigurationData = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		// 3.7 https://www.w3.org/TR/2017/REC-micropub-20170523/#querying
		// 3.7.1 https://www.w3.org/TR/2017/REC-micropub-20170523/#configuration

		// First, we make a call for the config. It *should* include syndication targets and *must* include a media endpoint.
		// Indiekit also returns a list of categories and supported post types as well within the same call. Spec seems silent, so we'll make a separate request for categories as well as syndication targets just to be sure we have everything we need.
		const queryUrl = new URL(req.session?.endpoints?.micropub);
		const params = new URLSearchParams(
			queryUrl.searchParams as URLSearchParams
		);
		params.append("q", "config");

		logger.log(
			LogLevels.http,
			"Sending a configuration query request to your Micropub server.",
			{ address: `${queryUrl}?${params.toString()}` }
		);

		fetch(`${queryUrl}?${params.toString()}`, {
			method: "GET",
			headers: {
				Authorization: `${req.session?.indieauth?.token_type} ${req.session?.indieauth?.access_token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (response.ok) return response.json();
				else reject(response);
			})
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"While requesting configuration data, we did not receive a JSON response -- or could not convert it to JSON.",
					{
						user: req.session?.user?.profileUrl,
						error_details: error,
					}
				);
				reject(error);
			})
			.then((configData: MicropubConfig) => {
				logger.log(
					LogLevels.http,
					"Received configuration data from your Micropub server.",
					{ config: configData }
				);
				// Create if it doesn't exist.
				if (req.session && !req.session?.micropub)
					req.session.micropub = {};
				// Set data
				Object.keys(configData).forEach((key) => {
					if (req.session)
						req.session.micropub[key] = configData[key];
				});

				resolve();
			})
			.catch((error) => {
				logger.log(LogLevels.error, error.message, {
					user: req.session?.user?.profileUrl,
					error_details: error,
				});
				reject(error);
			});
	});
};

const setSyndicationTargets = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		// Micropub W3C Recommendation 23 May 2017
		// 3.7.3 https://www.w3.org/TR/2017/REC-micropub-20170523/#syndication-targets

		logger.log(
			LogLevels.verbose,
			"We did not receive your syndication targets while making a configuration query request. Trying to fetch them individually now.",
			{
				user: req.session?.user?.profileUrl,
			}
		);

		const queryUrl = new URL(req.session?.endpoints?.micropub);
		const params = new URLSearchParams(
			queryUrl.searchParams as URLSearchParams
		);
		params.append("q", "syndicate-to");

		fetch(`${queryUrl}?${params.toString()}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${req.session?.indieauth?.access_token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})
			.then((response) => response.json())
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"While requesting syndication endpoints, we did not receive a JSON response -- or could not convert it to JSON.",
					{
						user: req.session?.user?.profileUrl,
						error_details: error,
					}
				);
			})
			.then((syndicationData: MicropubSyndicationData) => {
				logger.log(
					LogLevels.http,
					"Received syndication data from your Micropub server.",
					{
						"syndicate-to": syndicationData,
						user: req.session?.user?.profileUrl,
					}
				);

				// The server may return an empty array if there are no targets available.
				if (syndicationData["syndicate-to"].length && req.session) {
					// We'd have liked to use the set-value library here but unfortunately it doesn't play well with the bracket notation.
					// We could have formatted the JSON data to be dot notation friendly - but that looks to be a slippery slope.

					// Create if it doesn't exist.
					if (req.session?.micropub) req.session.micropub = {};
					// Set data.
					req.session.micropub["syndicate-to"] =
						syndicationData["syndicate-to"];
				}

				resolve();
			})
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"Could not set syndication endpoints.",
					{
						user: req.session?.user?.profileUrl,
						error_details: error,
					}
				);
				reject(error);
			});
	});
};

export { setMicropubCapabilities };
