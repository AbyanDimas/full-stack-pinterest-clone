import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/read", verifyToken, markAsRead);

export default router;
