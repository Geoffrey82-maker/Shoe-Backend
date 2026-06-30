import crypto from "crypto";

import Subscriber from "../models/Subscriber.js";

import {
    sendVerificationEmail,
    sendWelcomeEmail
} from "../services/newsletterService.js";

export const subscribe = async (
    req,
    res
) => {

    try {

        const {
            email,
            firstname
        } = req.body;

        const exists =
            await Subscriber.findOne({
                email
            });

        if (exists) {

            return res.status(400).json({
                success: false,
                message:
                    "You are already subscribed."
            });

        }

        const verificationToken =
            crypto.randomUUID();

        const subscriber =
            await Subscriber.create({

                email,

                firstname,

                verificationToken

            });

        await sendVerificationEmail(
            subscriber
        );

        res.status(201).json({

            success: true,

            message:
                "Please check your email to verify your subscription."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const verifySubscription = async (req, res) => {

    try {

        const subscriber = await Subscriber.findOne({
            verificationToken: req.params.token
        });

        if (!subscriber) {

            return res.status(404).json({
                success: false,
                message: "Invalid verification link."

            });

        }

        if (subscriber.isVerified) {

            return res.status(400).json({
                success: false,
                message: "Subscription already verified."
            });

        }

        subscriber.isVerified = true;

        subscriber.verificationToken = undefined;

        await subscriber.save();

        await sendWelcomeEmail(subscriber);

        res.status(200).json({

            success: true,

            message:
                "Subscription verified successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};