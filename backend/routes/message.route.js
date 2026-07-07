import express from "express";
import { getMessages, sendMessage, markAsRead } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getMessages);
router.post("/", verifyToken, sendMessage);
router.put("/read", verifyToken, markAsRead);

export default router;
