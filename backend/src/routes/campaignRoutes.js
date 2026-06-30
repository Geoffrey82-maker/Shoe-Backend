import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {

    createCampaign,

    getCampaigns,

    sendCampaign

} from "../controllers/campaignController.js";

const router = express.Router();

router.post(
    "/",
    protect,
    admin,
    createCampaign
);

router.get(
    "/",
    protect,
    admin,
    getCampaigns
);

router.post(
    "/:id/send",
    protect,
    admin,
    sendCampaign
);

export default router;