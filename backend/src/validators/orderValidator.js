import { body } from "express-validator";

export const orderValidation = [
    body("shippingAddress.fullName")
        .notEmpty()
        .withMessage("Full name required"),

    body("shippingAddress.phone")
        .notEmpty()
        .withMessage("Phone required"),
    
    body("shippingAddress.address")
        .notEmpty()
        .withMessage("Address required"),

    body("paymentMethod")
        .notEmpty()
        .withMessage()

];