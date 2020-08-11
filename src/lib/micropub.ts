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
					"We *should* have syndication targets available in the session by now.",
					{ user: req.session?.user?.profileUrl }
				);
				// This is when we get a good response, but response does not include syndication targets.
				if (!req.session?.micropub?.["syndicate-to"]) {
					logger.log(
						LogLevels.debug,
						"It looks like we don't have syndication endpoints in the session from the config query request.",
						{ user: req.session?.user?.profileUrl }
					);
					setSyndicationTargets(req)
						.then(() => resolve())
						.catch((error) => reject(error));
				}
				// We have the syndication endpoints (at least), resolve the micropub capabilities method.
				else resolve();
			})
			.catch(() => {
				// This is when we get a bad response, so we try to make a separate request.
				logger.log(LogLevels.verbose, "Configuration query failed.", {
					user: req.session?.user?.profileUrl,
				});
				setSyndicationTargets(req)
					.then(() => resolve())
					.catch((error) => reject(error));
			});
	});
};

const setConfigurationData = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		// 3.7 https://www.w3.org/TR/2017/REC-micropub-20170523/#querying
		// 3.7.1 https://www.w3.org/TR/2017/REC-micropub-20170523/#configuration

		// First, we make a call for the config. It *should* include syndication targets and *must* include a media endpoint.
		// Indiekit also returns a list of categories and supported post types as well within the same call. Spec seems silent, so we'll make a separate request for categories as well as syndication targets just to be sure we have everything we need.
		// TODO Call for categories
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
				logger.log(
					LogLevels.http,
					"Received a response on our config query request",
					{
						user: req.session?.user?.profileUrl,
						response,
					}
				);
				if (response.ok) {
					if (
						response.headers
							.get("content-type")
							?.includes("application/json")
					) {
						try {
							return response.json();
						} catch (error) {
							logger.log(
								LogLevels.error,
								"Failed to convert response to JSON",
								{
									user: req.session?.user?.profileUrl,
								}
							);
							throw new Error(
								"Failed to convert response to JSON"
							);
						}
					} else {
						throw new Error(
							"We received a successful response from your Micropub server for our confiq query request, but the server did not send JSON data. Please file an issue with your server's author/maintainer."
						);
					}
				} else {
					throw new Error(
						"We did not receive a successful response from your Micropub server for our config query request."
					);
				}
			})
			.then((configData: MicropubConfig) => {
				logger.log(
					LogLevels.verbose,
					"Converted the configuration data from your Micropub server to JSON.",
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
				logger.log(
					LogLevels.error,
					"While requesting configuration data, we did not receive a JSON response -- or could not convert the response to JSON.",
					{
						user: req.session?.user?.profileUrl,
						error,
					}
				);
				reject();
			})
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"Could not make a call to the Micropub server for the config.",
					{
						user: req.session?.user?.profileUrl,
						error,
					}
				);
				reject();
			});
	});
};

const setSyndicationTargets = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		// Micropub W3C Recommendation 23 May 2017
		// 3.7.3 https://www.w3.org/TR/2017/REC-micropub-20170523/#syndication-targets

		const queryUrl = new URL(req.session?.endpoints?.micropub);
		const params = new URLSearchParams(
			queryUrl.searchParams as URLSearchParams
		);
		params.append("q", "syndicate-to");

		logger.log(
			LogLevels.http,
			"Trying to fetch syndication targets individually.",
			{
				user: req.session?.user?.profileUrl,
				address: `${queryUrl}?${params.toString()}`,
			}
		);

		fetch(`${queryUrl}?${params.toString()}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${req.session?.indieauth?.access_token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})
			.then((response) => {
				logger.log(
					LogLevels.http,
					"Received a response on our syndcation targets query request",
					{
						user: req.session?.user?.profileUrl,
						response,
					}
				);
				if (response.ok) {
					if (
						response.headers
							.get("content-type")
							?.includes("application/json")
					) {
						try {
							return response.json();
						} catch (error) {
							logger.log(
								LogLevels.error,
								"Failed to convert response to JSON",
								{
									user: req.session?.user?.profileUrl,
								}
							);
							throw new Error(
								"Failed to convert response to JSON"
							);
						}
					} else {
						throw new Error(
							"We received a successful response from your Micropub server for our syndcation targets query request, but the server did not send JSON data. Please file an issue with your server's author/maintainer."
						);
					}
				} else {
					throw new Error(
						"We did not receive a successful response from your Micropub server for our syndcation targets query request."
					);
				}
			})
			.then((syndicationData: MicropubSyndicationData) => {
				logger.log(
					LogLevels.http,
					"Converted syndication targets from your Micropub server to JSON successfully.",
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
					logger.log(
						LogLevels.verbose,
						"Setting syndication data in our session.",
						{
							"syndicate-to": syndicationData,
							user: req.session?.user?.profileUrl,
						}
					);
					req.session.micropub["syndicate-to"] =
						syndicationData["syndicate-to"];
				}

				resolve();
			})
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"Failed to get syndication targets.",
					{
						user: req.session?.user?.profileUrl,
						error: error,
					}
				);
				reject();
			});
	});
};

export { setMicropubCapabilities };
