import { Request as ExpressRequest } from "express";
import set from "set-value";
import { logger } from "./logger";
import { LogLevels } from "../enumerator/LogLevels";
import { IndieAuthToken } from "../interface/IndieAuth";

const setAuthData = (req: ExpressRequest, data: IndieAuthToken): void => {
	logger.log(
		LogLevels.debug,
		"Setting indieauth properties for the session.",
		{ user: req.session?.user?.profileUrl }
	);

	if (req.session) {
		Object.keys(data).forEach((datumKey: string) => {
			set(req, `session.indieauth.${datumKey}`, data[datumKey]);
		});

		// Default the token type to Bearer
		if (!req.session?.indieauth?.token_type)
			set(req, `session.indieauth.token_type`, "Bearer");
	}
};

const cleanupAuthData = (req: ExpressRequest): void => {
	logger.log(
		LogLevels.debug,
		"Removing intermediate code form IndieAuth session data.",
		{ user: req.session?.user?.profileUrl }
	);
	if (req.session && req.session.indieauth) delete req.session.indieauth.code;
};

export { cleanupAuthData, setAuthData };
