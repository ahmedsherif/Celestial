import {
	Router,
	Request as ExpressRequest,
	Response as ExpressRespone,
	NextFunction as ExpressNextFunction,
} from "express";
import { Duration } from "luxon";

import { queryServer } from "../../../lib/micropub";
import { logger } from "../../../lib/logger";
import { isStale } from "../../../lib/helpers";

import { LogLevels } from "../../../enumerator/LogLevels";
import { MicropubQueryType } from "../../../enumerator/Micropub";

const apiv1Router = Router();

apiv1Router.get(
	"/micropub/category/",
	(req: ExpressRequest, res: ExpressRespone, next: ExpressNextFunction) => {
		// Make a ?q=category query
		if (!req.session?.endpoints?.micropub)
			next({
				code: "AppError",
				message:
					"We couldn't make a config request because we don't appear to have the Micropub endpoint for this user.",
			});

		if (!req.session?.micropub?.categories) {
			logger.log(
				LogLevels.debug,
				"No categories data available, making a fresh request to Micropub server.",
				{ user: req.session?.user?.profileUrl }
			);

			queryServer(req, MicropubQueryType.categories)
				.then(() => {
					logger.log(
						LogLevels.verbose,
						"Sending response back to front-end",
						{
							user: req.session?.user?.profileUrl,
							categories: req?.session?.micropub?.categories,
						}
					);
					res.json(req?.session?.micropub?.categories).end();
				})
				.catch((error) => {
					logger.log(
						LogLevels.warn,
						"Could not get Micropub categories."
					);
					res.json({
						error: "Could not get Micropub categories.",
						error_description: error,
					}).end();
				});
		} else {
			logger.log(
				LogLevels.debug,
				"Categories data available, yet to determine if we want to make a fresh call because our data might be stale.",
				{ user: req.session?.user?.profileUrl }
			);

			// Check for category first, then fall back on config
			if (
				(req.session?.micropub?.lastFetched?.category &&
					!isStale(
						req.session?.micropub?.lastFetched?.category,
						Duration.fromObject({ minutes: 10 })
					)) ||
				(req.session?.micropub?.lastFetched?.config &&
					!isStale(
						req.session?.micropub?.lastFetched?.config,
						Duration.fromObject({ minutes: 10 })
					))
			) {
				logger.log(
					LogLevels.verbose,
					"Sending existing data back to front-end",
					{
						user: req.session?.user?.profileUrl,
						categories: req?.session?.micropub?.categories,
					}
				);
				res.json(req?.session?.micropub?.categories).end();
			} else {
				logger.log(
					LogLevels.verbose,
					"Current data is stale, fetching fresh categories."
				);

				queryServer(req, MicropubQueryType.categories)
					.then(() => {
						logger.log(
							LogLevels.verbose,
							"Sending response back to front-end",
							{
								user: req.session?.user?.profileUrl,
								categories: req?.session?.micropub?.categories,
							}
						);
						res.json(req?.session?.micropub?.categories).end();
					})
					.catch((error) => {
						logger.log(
							LogLevels.warn,
							"Could not get Micropub categories."
						);
						res.json({
							error: "Could not get Micropub categories.",
							error_description: error,
						}).end();
					});
			}
		}
	}
);

export { apiv1Router };
