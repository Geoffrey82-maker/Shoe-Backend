import crypto from "crypto";

import Subscriber from "../models/Subscriber.js";

import {
    sendVerificationEmail
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