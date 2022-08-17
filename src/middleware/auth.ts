import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { users } from "@model/users";
import env from "@config/env";

const ignorePaths = [
	"/auth/login",
	"/auth/test",
	"/auth/register",
	"/auth/send-mobile-otp",
	"/auth/get-otp",
	"/auth/verify-mobile-otp",

	"/auth/google-login",
	"/auth/register",
	"/auth/forgot-password",
	"/public",
	"/send-test-notification",
	"/auth/change-password",
	"/auth/verify-otp",
	"/auth/send-otp",
];

export interface UserAuthRequest extends Request {
	user?: users; // or any other type
	token: string;
}

export default async function verifyUser(
	req: any,
	res: Response,
	next: NextFunction,
) {
	let token;

	let ignore = ignorePaths.indexOf(req.path) > -1;
	if (req.url.startsWith("/public")) {
		ignore = true;
	}

	if (
		req.method === "OPTIONS" &&
		req.headers.hasOwnProperty("access-control-request-headers")
	) {
		return res.send("No DATA");
		// const hasAuthInAccessControl = !!~req.headers[
		// 	"access-control-request-headers"
		// ]
		// 	.split(",")
		// 	.map(function (header) {
		// 		return header.trim();
		// 	})
		// 	.indexOf("authorization");

		// if (hasAuthInAccessControl) {
		// 	return next();
		// }
	}

	if (req.headers && req.headers.authorization) {
		const parts = req.headers.authorization.split(" ");
		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];

			if (/^Bearer$/i.test(scheme)) {
				token = credentials;
				req.token = token;
			} else {
				if (!ignore) {
					return res.json({
						status: false,
						message: "Invalid request.",
						data: null,
					});
				}
			}
		} else {
			if (!ignore) {
				return res.json({
					status: false,
					message: "Invalid request.",
					data: null,
				});
			}
		}
	}

	if (!token && !ignore) {
		return res.json({
			status: false,
			message: "No authorization token was found.",
			data: null,
		});
	}

	if (token) {
		let user: any = jwt.verify(token ?? "", env.secret);

		if (!user && !ignore) {
			return res.status(401).json({
				status: false,
				message: "Invalid token.",
				data: null,
			});
		}

		if (user?.id) {
			try {
				req.user = user;
			} catch (e) {}
		}
	}

	return next();
}
