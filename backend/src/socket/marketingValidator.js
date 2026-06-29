import { body } from "express-validator";

export const subscribeValidator = [

    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("firstname")
        .optional()
        .trim()
        .isLength({
            max: 50
        })
        .withMessage(
            "Firstname cannot exceed 50 characters"
        )

];