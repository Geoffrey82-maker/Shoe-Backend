import express from "express";

import protect from "../middleware/authMiddleware.js";

import admin from "../middleware/adminMiddleware.js";

import {
    createChatRoom,
    getMessages,
    getWaitingChats,
    acceptChat,
    closeChat
}

from "../controllers/chatController.js";

const router=express.Router();

router.post(
    "/room",
    protect,
    createChatRoom
);

router.get(
    "/messages/:roomId",
    protect,
    getMessages
);

router.get(
    "/waiting",
    protect,
    admin,
    getWaitingChats
);

router.put(
    "/accept/:id",
    protect,
    admin,
    acceptChat
);

router.put(
    "/close/:id",
    protect,
    admin,
    closeChat
);

export default router;