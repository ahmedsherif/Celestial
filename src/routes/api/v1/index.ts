import express, {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from "express";

import { logger } from "../../../lib/logger";
import { LogLevels } from "../../../enumerator/LogLevels";

const apiRouter = express.Router();

apiRouter.get(
	"/endpoints/",
	(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
		logger.log(LogLevels.debug, "API request for endpoints");
		res.json({
			"media-endpoint": req.session?.micropub?.["media-endpoint"],
		}).end();
	}
);

export { apiRouter };
