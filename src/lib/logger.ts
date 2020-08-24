import { createLogger, format, transports } from "winston";
const { combine, prettyPrint, timestamp } = format;

const logger = createLogger({
	level: "silly",
	format: format.json(),
	defaultMeta: { service: "Celestial" },
	transports: [
		// - Write all logs with level `error` and below to `error.log`
		new transports.File({ filename: "error.log", level: "error" }),
		// - Write all logs with level `info` and below to `info.log`
		new transports.File({ filename: "info.log", level: "info" }),
		// - Write all logs with level `silly` and below to `all.log`
		new transports.File({ filename: "all.log", level: "silly" }),
	],
});

// If we're in development then log to the `console` as well
if (
	process.env.NODE_ENV === "development" ||
	process.env.NODE_ENV === "production"
) {
	logger.add(
		new transports.Console({
			format: combine(
				timestamp({
					format: "YYYY-MM-DD HH:mm:ss Z",
				}),
				prettyPrint()
			),
		})
	);
}

export { logger };
