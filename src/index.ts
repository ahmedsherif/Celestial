// Core
import express, {
	Response as ExpressResponse,
	Request as ExpressRequest,
	NextFunction as ExpressNextFunction,
} from "express";

// Env and other constants
import { PORT, REDIS_URL } from "./config/constants";

// Template engine
import { Liquid } from "liquidjs";

// Middleware imports
const helmet = require("helmet");

// Session and store
const session = require("express-session");
import redis from "redis";
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient(REDIS_URL);

const app = express();

// Route imports
import { authRouter } from "./routes/authentication";
import { logoutRouter } from "./routes/logout";
import { publishRouter } from "./routes/publish";
import { userRouter } from "./routes/user";

// Our interface, enums, libs, etc.
import { AppUserState } from "./enumerator/AppUserState";
import { LogLevels } from "./enumerator/LogLevels";

import { DefaultPageData, UserPageData } from "./interface/PageData";
import { AppError } from "./interface/AppError";

import { logger } from "./lib/logger";
import { pageDataHelper } from "./lib/helpers";
import { resetEphemeralSessionData } from "./lib/session";

// Create a CSP
const directives = {
	defaultSrc: ["'self'"],
	scriptSrc: [
		"'self'",
		"https://twemoji.maxcdn.com/",
		"https://plausible.io/",
	],
	connectSrc: ["'self'", "https://plausible.io/"],
	imgSrc: ["'self'", "https://rusingh.com", "https://twemoji.maxcdn.com/"],
};

if (process.env.NODE_ENV === "development") {
	// Allow unsafe scripts locally - required for Webpack output to work
	directives.scriptSrc.push("'unsafe-eval'");
	// Also allow data: images
	directives.imgSrc.push("data:");
}

// Employ a CSP
app.use(
	helmet.contentSecurityPolicy({
		directives,
	})
);

// Setup liquid and views
const engine = new Liquid({
	root: [__dirname, "./views", "./templates", "./includes"],
	extname: ".liquid",
});
app.engine("liquid", engine.express());
// app.set("views", []);
app.set("view engine", "liquid");

// Let Express server assets - CSS, images, etc.
app.use(express.static("assets"));

// Create a session for every request
// https://www.npmjs.com/package/express-session
app.use(
	session({
		secret: "indie-aww",
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
			sameSite: false,
		},
		store: new RedisStore({
			client: redisClient,
		}),
	})
);

// Set appState for this session
app.use(
	(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
		if (
			req.session?.indieauth?.access_token &&
			req.session?.endpoints?.micropub &&
			req.session?.endpoints?.token
		) {
			// This is the least amount of data we need for the core functionality to work (publishing data to Micropub server and logging out).
			// If there are errors elsewhere due to a lack of data, they should be handled in that route and presented to the user.
			logger.log(
				LogLevels.debug,
				`User appears to be already logged in as per our session data. Setting appState to ${AppUserState.User}.`
			);
			req.session.appState = AppUserState.User;
		}
		next();
	}
);

// Routes
app.get("/", (req: ExpressRequest, res: ExpressResponse) => {
	let pageData: DefaultPageData | UserPageData;
	if (req.session?.appState === AppUserState.User) {
		pageData = pageDataHelper(req, {
			pageTitle: "Hello! 👋",
		}) as DefaultPageData;
	} else {
		pageData = pageDataHelper(req, {
			pageTitle: "Hello! 👋",
		}) as UserPageData;
	}

	res.render("index", pageData);
});

app.get("/error", (req: ExpressRequest, res: ExpressResponse) => {
	let pageData: DefaultPageData | UserPageData;
	if (req.session?.appState === AppUserState.User) {
		pageData = pageDataHelper(req, {
			pageTitle: "An error occured :(",
			error: req.session?.error,
		}) as UserPageData;
	} else {
		pageData = pageDataHelper(req, {
			pageTitle: "An error occured :(",
			error: req.session?.error,
		}) as DefaultPageData;
	}

	resetEphemeralSessionData(req, ["error"]);

	res.render("error", pageData);
});

app.use("/login/", authRouter);

app.use("/logout/", logoutRouter);

app.use("/publish/", publishRouter);

app.use("/user/", userRouter);

// Generic error handler
// Currently only handles errors with the code "AppError"
// Rest are passed onto Express' default handler
app.use(
	(
		err: AppError,
		req: ExpressRequest,
		res: ExpressResponse,
		next: ExpressNextFunction
	) => {
		if (err?.code === "AppError") {
			logger.log(LogLevels.error, err.message, {
				user: req.session?.user?.profileUrl,
			});
			if (req.session) req.session.error = err.message;
			res.redirect(302, "/error");
		}
		next(err);
	}
);

app.listen(PORT, (): void => {
	logger.log(LogLevels.info, `Server is listening on ${PORT}`);
});
