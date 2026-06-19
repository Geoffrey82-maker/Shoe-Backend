import express from "express";
import protect from "../middleware/authMiddleware.js";

import { createPaymentIntent, stripeWebhook, initiateMpesaPayment, mpesaCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/stripe/create-payment-intent", protect, createPaymentIntent);

router.post(
    "/stripe/webhook",
    stripeWebhook
);

router.post("/mpesa/stkpush", protect, initiateMpesaPayment);

router.post("/mpesa/callback", mpesaCallback);

export default router;