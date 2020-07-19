// TODO More apt file name

import fetch from "node-fetch";
import isIp from "is-ip";

const makeUrl = (url: string): URL => {
	// Has the user entered any protocol at all - simple check for '://'
	// Also note that if no pathname is specified, '/' is assumed by the URL class. We don't need to take care of this check later on.
	if (url.indexOf("://")) {
		return new URL(url.toLowerCase());
	} else {
		// If http[s] not input the user, assume http
		return new URL(String.prototype.concat("http://", url.toLowerCase()));
	}
};

const isValidUrl = (url: URL): boolean | Error => {
	try {
		if (url.username)
			throw new Error(
				"The URL specified is invalid, as it includes a username."
			);
		if (url.password)
			throw new Error(
				"The URL specified is invalid, as it includes a password."
			);
		if (url.port)
			throw new Error(
				"The URL specified is invalid, as it includes a port."
			);
		if (!["http:", "https:"].includes(url.protocol))
			throw new Error(
				"The URL specified is invalid, as its protocol is neither HTTP nor HTTPS."
			);
		if (url.hash)
			throw new Error(
				"The URL specified is invalid, as it includes a hash/fragment."
			);

		if (isIp(url.toString()))
			throw new Error(
				"The URL specified is invalid, as it is an IP address (v4/v6)."
			);

		// ! IndieAuth spec violation.
		// TODO Unfortunately, URL discards pathname upto where it contains a single-dot or a double-dot path segment. For now, we've opted not to perform this check when validating.
		// if (
		// 	url.pathname
		// 		.split("/")
		// 		.some((segment) => [".", ".."].includes(segment))
		// )
		// 	throw new Error(
		// 		"The URL specified is invalid, as it contains either a single-dot or a double-dot path segment."
		// 	);

		return true;
	} catch (error) {
		return error;
	}
};

const getProfileAndDiscoveryUrls = (
	startingUrl: string
): Promise<{ discoveryUrl: string; profileUrl: string } | Error> =>
	new Promise((resolve, reject) => {
		let profileUrl: URL, discoveryUrl: URL, assumedUrl: URL;

		// IndieAuth W3C Living Standard 25 January 2020
		// 3.1 https://indieauth.spec.indieweb.org/#user-profile-url
		// 3.2 https://indieauth.spec.indieweb.org/#client-identifier
		// 3.3 https://indieauth.spec.indieweb.org/#url-canonicalization
		// 4.2 https://indieauth.spec.indieweb.org/#discovery-by-clients

		assumedUrl = makeUrl(startingUrl);

		// Perform validation checks as per spec
		const isValid = isValidUrl(assumedUrl);
		if (isValid instanceof Error) {
			return isValid;
		} else {
			// Everything checks out OK
			fetch(assumedUrl.toString(), {
				method: "HEAD",
				redirect: "manual",
			})
				.then((response) => {
					// Check if this was a temporary redirect
					if (response.status === 302 || response.status === 307) {
						if (response.headers.get("Location") === null) {
							throw new Error(
								"We were given a temporary redirect to follow but the Location HTTP header was missing."
							);
						}

						fetch(response.headers.get("Location") as string)
							.then((response) => {
								if (!response.ok)
									throw new Error(
										"We followed a temporary redirect but there was a problem fetching the redirected URL."
									);

								// Profile/Identity URL is the one entered by user
								// Discovery URL is the redirected URL
								profileUrl = new URL(assumedUrl.toString());
								discoveryUrl = new URL(
									response.headers.get("Location") as string
								);
								resolve({
									profileUrl: profileUrl.toString(),
									discoveryUrl: discoveryUrl.toString(),
								});
							})
							.catch((error) => reject(error));
					}
					// Was it a permanent redirect?
					else if (
						response.status === 301 ||
						response.status === 308
					) {
						// Profile and discovery URL are, both, the redirected URL
						if (response.headers.get("Location") === null)
							throw new Error(
								"We were given a permanent redirect to follow, but the Location HTTP header was missing."
							);

						profileUrl = discoveryUrl = new URL(
							response.headers.get("Location") as string
						);
						resolve({
							profileUrl: profileUrl.toString(),
							discoveryUrl: discoveryUrl.toString(),
						});
					} else {
						// Fallback. The URL we have is what we need to use.
						profileUrl = discoveryUrl = assumedUrl;
						resolve({
							profileUrl: profileUrl.toString(),
							discoveryUrl: discoveryUrl.toString(),
						});
					}
				})
				.catch((error) => reject(error));
		}
	});

export { getProfileAndDiscoveryUrls };