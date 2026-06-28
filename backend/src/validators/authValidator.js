import { body } from "express-validator";

export const registerValidation = [
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

export const loginValidation = [

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

export const resetPasswordValidation = [

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")

];

export const forgotPasswordValidation = [

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()

];