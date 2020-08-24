import fetch from "node-fetch";
import { Request as ExpressRequest } from "express";
import { URLSearchParams } from "url";
import set from "set-value";

import { logger } from "./logger";
import { LogLevels } from "../enumerator/LogLevels";
import { MicropubConfig, MicropubSyndicationData } from "../interface/Micropub";
import { isObject } from "./helpers";
import { MicropubQueryType } from "../enumerator/Micropub";
import { DateTime } from "luxon";

const setMicropubCapabilities = (req: ExpressRequest): Promise<void> => {
	return new Promise((resolve, reject) => {
		queryServer(req, MicropubQueryType.configuration)
			.then(() => {
				logger.log(
					LogLevels.debug,
					"Response from config query received.",
					{ user: req.session?.user?.profileUrl }
				);

				fallbackQueries(req)
					.then(() => resolve())
					.catch((error) => reject(error));
			})
			.catch(() => {
				// This is when we get a bad response, so we try to make separate requests.
				logger.log(LogLevels.verbose, "Configuration query failed.", {
					user: req.session?.user?.profileUrl,
				});

				fallbackQueries(req)
					.then(() => resolve())
					.catch((error) => reject(error));
			});
	});
};

const fallbackQueries = (req: ExpressRequest) =>
	new Promise((resolve, reject) => {
		const queries: Promise<any>[] = [];

		if (!req.session?.micropub?.["syndicate-to"]) {
			// This is when we get a good response, but response does not include syndication targets.
			logger.log(
				LogLevels.debug,
				"It looks like we don't have syndication endpoints in the session from the config query request.",
				{ user: req.session?.user?.profileUrl }
			);

			queries.push(
				queryServer(req, MicropubQueryType.syndicationTargets)
			);
		}

		if (!req.session?.micropub?.["categories"]) {
			logger.log(
				LogLevels.debug,
				"It looks like we don't have categories in the session from the config query request.",
				{ user: req.session?.user?.profileUrl }
			);

			queries.push(queryServer(req, MicropubQueryType.categories));
		}

		Promise.all(queries)
			.then(() => resolve())
			.catch((error) => {
				logger.log(
					LogLevels.error,
					"One of several query calls failed.",
					{ user: req.session?.user?.profileUrl, error }
				);
				reject(error);
			});
	});

const validateQueryResponse = (
	data,
	query: MicropubQueryType
): void | Error => {
	switch (query) {
		case MicropubQueryType.syndicationTargets:
			// Check if the format is correct. We need the root to be an object carrying a key "syndicate-to".
			// The server may return an empty array if there are no targets available.
			if (!isObject(data))
				return new Error(
					"Response is invalid JSON. We expected to see an object. Please file an issue with your Micropub server."
				);

			if (!data?.["syndicate-to"])
				return new Error(
					"Response is invalid JSON. We expect to see a syndicate-to key on the response. Please file an issue with your Micropub server."
				);
	}
};

const setQueryResponse = (
	req: ExpressRequest,
	data: Record<any, any>,
	query: MicropubQueryType
) => {
	if (req.session) {
		// Set data under micropub key.
		Object.keys(data).forEach((key) => {
			set(req, `session.micropub.${key}`, data[key]);
		});

		// Additionally, set last fetched date for this query type.
		set(
			req,
			`session.micropub.lastFetched.${query}`,
			DateTime.utc().toString()
		);
	}
};

const queryServer = (
	req: ExpressRequest,
	query: MicropubQueryType
): Promise<void | Error> =>
	new Promise((resolve, reject) => {
		// * MicropubQueryType.configuration
		// Micropub W3C Recommendation 23 May 2017
		// 3.7 https://www.w3.org/TR/2017/REC-micropub-20170523/#querying
		// 3.7.1 https://www.w3.org/TR/2017/REC-micropub-20170523/#configuration

		// First, we make a call for the config. It *should* include syndication targets and *must* include a media endpoint.
		// Indiekit also returns a list of categories and supported post types as well within the same call. Spec seems silent, so we'll make a separate request for categories as well as syndication targets just to be sure we have everything we need.

		// * MicropubQueryType.syndicationTargets
		// Micropub W3C Recommendation 23 May 2017
		// 3.7.3 https://www.w3.org/TR/2017/REC-micropub-20170523/#syndication-targets

		const queryUrl = new URL(req.session?.endpoints?.micropub);
		const params = new URLSearchParams(
			queryUrl.searchParams as URLSearchParams
		);
		params.append("q", query);

		logger.log(
			LogLevels.http,
			`Sending a ${query} query request to your Micropub server.`,
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
					`Received a response on our ${query} query request`,
					{
						user: req.session?.user?.profileUrl,
						response,
					}
				);
				if (response.ok) {
					if (
						response.headers
							.get("content-type")
							?.startsWith("application/json")
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
							`We received a successful response from your Micropub server for our ${query} query request, but the server did not send JSON data. Please file an issue with your server's author/maintainer.`
						);
					}
				} else {
					throw new Error(
						`We did not receive a successful response from your Micropub server for our ${query} query request.`
					);
				}
			})
			.then((data: MicropubConfig) => {
				logger.log(
					LogLevels.verbose,
					`Converted response from your Micropub server to JSON for our ${query} query.`,
					{ data }
				);

				const isValid = validateQueryResponse(data, query);
				if (isValid instanceof Error) throw isValid;

				setQueryResponse(req, data, query);

				resolve();
			})
			.catch((error: Error) => {
				logger.log(
					LogLevels.error,
					`An error occured while requesting ${query} data from your Micropub server.`,
					{
						user: req.session?.user?.profileUrl,
						error,
					}
				);
				reject(error);
			});
	});

export { setMicropubCapabilities, queryServer };
