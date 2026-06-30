import express from "express";

import validate from "../middleware/validationMiddlware.js";

import {
    subscribeValidator
} from "../validators/marketingValidator.js";

import {

    subscribe,

    verifySubscription

} from "../controllers/marketingController.js";

const router = express.Router();

router.post(
    "/subscribe",
    subscribeValidator,
    validate,
    subscribe
);

router.get(
    "/verify/:token",
    verifySubscription
);

export default router;