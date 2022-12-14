import { Response } from "express";
import { UserAuthRequest } from "@middleware/auth";
import env from "@config/path";
import { R } from "./response-helpers";
import path from "path";
import { UploadedFile } from "express-fileupload";

export const uploadFile = async (req: UserAuthRequest, res: Response) => {
	try {
		let publicPath = env.project;

		if (!req.files) {
			return R(res, false, "No file uploaded!");
		}

		const file = req.files.file;
		const data: any = [];

		const move = (image: any, i: any) => {
			const file = image;
			let filename = file?.name;
			let index = i + 1;
			try {
				const extensionName = path?.extname(filename ?? "");

				// const allowedExtension = [".png", ".jpg", ".jpeg"];

				// if (!allowedExtension.includes(extensionName)) {
				// 	return res.json({ message: "Invalid Image", status: false });
				// }

				if (req.user?.id) {
					filename =
						filename.substring(0, 3) +
						Date.now() +
						req.user?.id +
						extensionName;
				} else {
					filename =
						filename.substring(0, 10) +
						`${index}` +
						req.user?.id +
						extensionName;
				}

				file.mv(`${publicPath}${filename}`);
			} catch (e) {
				return R(res, false, "File upload failed");
			}

			data.push(filename);
		};

		Array.isArray(file)
			? file.forEach((file, i) => move(file, i))
			: move(file, 0);

		return data;
	} catch (e) {
		return R(res, false, "File upload failed");
	}
};

export const uploadOneFile = async (
	req: UserAuthRequest,
	res: Response,
	ignore?: Boolean,
) => {
	try {
		let publicPath = env.project;

		if (!req.files) {
			if (ignore) {
				return false;
			}
			return R(res, false, "No file uploaded!");
		}

		const file = req.files.file as UploadedFile;

		let filename = file?.name;

		const extensionName = path?.extname(filename ?? "");

		const allowedExtension = [".png", ".jpg", ".jpeg"];

		if (!allowedExtension.includes(extensionName)) {
			return res.json({ message: "Invalid Image", status: false });
		}

		filename = "" + Date.now() + req.user?.id + extensionName;

		file.mv(`${publicPath}${filename}`);

		return filename;
	} catch (e) {
		return R(res, false, "File upload failed");
	}
};
