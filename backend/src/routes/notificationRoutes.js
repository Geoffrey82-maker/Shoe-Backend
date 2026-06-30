import express from "express";
const router = express.Router();
import { getNotifications, markRead, markAllRead } from "../controllers/notificationController.js";

router.get("/", getNotifications);
router.put("/:id/read", markRead);
router.put("/all/read", markAllRead);

export default router;