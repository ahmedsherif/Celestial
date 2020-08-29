import {
	Router,
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from "express";
import fetch from "node-fetch";
import set from "set-value";
// import getType from "post-type-discovery";

// Our interface, enums, middleware, libs
import { PostPageData } from "../interface/PageData";

import { urlEncodedParser } from "../middleware/urlEncodedParser";

import { LogLevels } from "../enumerator/LogLevels";
import { FormEncoding } from "../enumerator/FormEncoding";

import { pageDataHelper, postDataHelper } from "../lib/helpers";
import { resetEphemeralSessionData } from "../lib/session";
import { logger } from "../lib/logger";
import { prepareParams } from "../lib/publish";
import { protectedRoutes } from "../lib/utils";

const publishRouter = Router();

publishRouter.use(protectedRoutes);

publishRouter.get("/success/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = pageDataHelper(req, {
		pageTitle: "Post Successfully Created",
		postLink: req.session?.postLink,
	}) as PostPageData;

	resetEphemeralSessionData(req, ["postLink"]);

	res.render("publish/success", pageData);
});

publishRouter.get("/article/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Article",
	}) as PostPageData;

	res.render("publish/article", pageData);
});

publishRouter.get("/note/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Note",
	}) as PostPageData;
	res.render("publish/note", pageData);
});

publishRouter.get("/reply/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Reply",
	}) as PostPageData;
	res.render("publish/reply", pageData);
});

publishRouter.get("/like/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Like",
	}) as PostPageData;

	res.render("publish/like", pageData);
});

publishRouter.get("/repost/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Repost",
	}) as PostPageData;

	res.render("publish/repost", pageData);
});

publishRouter.get("/photo/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Photo",
	}) as PostPageData;

	res.render("publish/photo", pageData);
});

publishRouter.get("/video/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Video",
	}) as PostPageData;

	res.render("publish/video", pageData);
});

publishRouter.get("/event/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "Event",
	}) as PostPageData;

	res.render("publish/event", pageData);
});

publishRouter.get("/rsvp/", (req: ExpressRequest, res: ExpressResponse) => {
	const pageData: PostPageData = postDataHelper(req, {
		pageTitle: "RSVP",
	}) as PostPageData;

	res.render("publish/rsvp", pageData);
});

// Common publishing endpoint
publishRouter.post(
	"/create/",
	urlEncodedParser,
	(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
		logger.log(LogLevels.http, "Received a publishing request.", {
			body: req.body,
		});

		let requestOptions: object;
		switch (req.session?.user?.preferences?.publishingType) {
			case FormEncoding.URLEncoded:
			default:
				const params = prepareParams(req);
				if (params instanceof Error)
					next({
						code: "AppError",
						message: params.message,
					});

				const formData = {
					encoding: FormEncoding.URLEncoded,
				};

				(params as URLSearchParams).forEach((value, key) => {
					// Check if this is a key which has multiple values
					// For example, mp-syndicate-to or category

					// Has this key already been set?
					if (formData[key] !== undefined) return;

					const valuesWithThisKey = (params as URLSearchParams).getAll(
						key
					);
					const hasMultipleValues =
						valuesWithThisKey.length > 1 ? true : false;

					if (hasMultipleValues) {
						// If it does, build a nice comma-separated string and assign that to [key] on the form logging data object
						let values = "";
						valuesWithThisKey.forEach((eachValue, index) => {
							if (index + 1 !== valuesWithThisKey.length)
								values += `${eachValue}, `;
							else values += eachValue;

							// Also, slice the ending [] out
							set(formData, key.slice(0, -2), values);
						});
					} else {
						// Otherwise just set the key value on our logging data variable
						set(formData, key, value);
					}
				});

				logger.log(
					LogLevels.verbose,
					"Sending publish request to your Micropub server.",
					{ ...formData }
				);

				requestOptions = {
					method: "POST",
					headers: {
						Accept: "application/json",
						Authorization: `${req.session?.indieauth?.token_type} ${req.session?.indieauth?.access_token}`,
					},
					body: params,
				};
		}

		fetch(req.session?.endpoints?.micropub, requestOptions)
			.then((response) => {
				if (!response.ok) {
					response
						.json()
						.then((responseData) => {
							logger.log(
								LogLevels.error,
								"Received an error from the Micropub server.",
								{ error: responseData }
							);
							next({
								code: "MicropubServerError",
								message: `${responseData.error} ${responseData?.error_description}`,
							});
						})
						.catch((error) => {
							logger.log(
								LogLevels.error,
								"Received an error from the Micropub server but could not read it.",
								{ error }
							);
							throw new Error(error);
						});
				}

				logger.log(
					LogLevels.http,
					"Received a response from the Micropub server",
					{ response }
				);
				if (response.headers?.get("Location"))
					if (req.session)
						req.session.postLink = response.headers?.get(
							"Location"
						);
				// TODO Set shortlinks and syndication links, show them to the user
				// https://www.w3.org/TR/2017/REC-micropub-20170523/#response-p-5
				res.redirect(302, "/publish/success/");
			})
			.catch((error: Error | TypeError) => {
				next({
					code: "AppError",
					message: error.message,
				});
			});
	}
);

export { publishRouter };
