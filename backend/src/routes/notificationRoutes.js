import express from "express";
const router = express.Router();
import { getNotifications, markAsRead, markAllRead } from "../controllers/notificationController.js";

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/all/read", markAllRead);

export default router;