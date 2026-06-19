import { body } from "express-validator";

export const couponValidator = [
    body("code")
        .notEmpty()
        .withMessage("Coupon code required"),
    
    body("discountType")
        .isIn([
            "percentage",
            "fixed"
        ]),

    body("discountValue")
        .isNumeric()
        .withMessage("Discount value must be numeric")
];