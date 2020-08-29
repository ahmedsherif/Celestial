import {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from "express";
import { AppUserState } from "../enumerator/AppUserState";

const protectedRoutes = (
	req: ExpressRequest,
	res: ExpressResponse,
	next: ExpressNextFunction
) => {
	if (req.session?.appState !== AppUserState.User) res.redirect("/login/");
	next();
};

export { protectedRoutes };
