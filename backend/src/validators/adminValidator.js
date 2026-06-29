import { body } from "express-validator";

export const updateOrderStatusValidator = [

    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn([
            "pending",
            "processing",
            "packed",
            "shipped",
            "delivered",
            "cancelled"
        ])
        .withMessage("Invalid order status")

];

export const updatePaymentStatusValidator = [

    body("status")
        .trim()
        .notEmpty()
        .withMessage("Payment status is required")
        .isIn([
            "pending",
            "paid",
            "failed",
            "refunded"
        ])
        .withMessage("Invalid payment status")

];