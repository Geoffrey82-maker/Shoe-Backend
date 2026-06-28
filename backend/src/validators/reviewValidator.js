import { body } from "express-validator";

export const reviewValidation = [

    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Review comment is required")
        .isLength({ min: 5, max: 1000 })
        .withMessage("Review must be between 5 and 1000 characters")

];