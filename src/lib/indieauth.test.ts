import { setAuthData, cleanupAuthData } from "./indieauth";
import { IndieAuthToken } from "../interface/IndieAuth";

describe("Manage IndieAuth data in session", () => {
	let request;

	beforeEach(() => {
		request = {
			session: {},
		};
	});

	test("should set required values in session, with no token type specified", () => {
		setAuthData(request, {
			access_token: "helloworld",
			me: "https://example.com/",
			scope: "create",
		});

		expect(request.session.indieauth).toMatchObject({
			access_token: "helloworld",
			token_type: "Bearer",
			me: "https://example.com/",
			scope: "create",
		});
	});

	test("should set required values in session, with token type specified", () => {
		setAuthData(request, {
			access_token: "helloworld",
			me: "https://example.com/",
			token_type: "foobar",
			scope: "create",
		});

		expect(request.session.indieauth).toMatchObject({
			access_token: "helloworld",
			token_type: "foobar",
			me: "https://example.com/",
			scope: "create",
		});
	});

	test("should clean up intermediary authorization data", () => {
        request = { session: { indieauth: { code: "foobar" } } };
        
        cleanupAuthData(request);
        
		expect(request.session.indieauth.code).toBeUndefined();
	});
});
