import {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from "express";
import { AppUserState } from "../enumerator/AppUserState";

const protectedRoutes = (req: ExpressRequest, res: ExpressResponse) => {
	if (req.session?.appState !== AppUserState.User) res.redirect("/login/");
};

export { protectedRoutes };
