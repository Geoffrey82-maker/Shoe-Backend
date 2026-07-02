import express from "express";
const router = express.Router();
import { getNotifications, markRead, markAllRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.get("/", getNotifications);

router.put("/:id/read", markRead);

router.put("/all/read", markAllRead);

export default router;