import express, { Request, Response } from "express";
import cn from "@client/controller/auth";

const router = express.Router();

router.get("/test", cn.test);

router.post("/register", cn.register);

router.post("/login", cn.login);

export default router;
