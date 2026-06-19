import { body } from "express-validator";

export const registerValidator = [
    body("firstname")
        .notEmpty()
        .withMessage("Firstname is required"),

    body("lastname")
        .notEmpty()
        .withMessage("Lastname is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email required"),

    body("password")
        .isLength({ min: 6 })
];