import Campaign from "../models/Campaign.js";
import Subscriber from "../models/Subscriber.js";

import {
    sendCampaignEmail
} from "../services/newsletterService.js";

export const createCampaign = async (req, res) => {

    try {

        const campaign = await Campaign.create({

            subject: req.body.subject,

            title: req.body.title,

            content: req.body.content,

            buttonText: req.body.buttonText,

            buttonUrl: req.body.buttonUrl,

            image: req.body.image,

            createdBy: req.user._id

        });

        res.status(201).json({

            success: true,

            campaign

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getCampaigns = async (req, res) => {

    try {

        const campaigns = await Campaign.find()

            .sort({

                createdAt: -1

            });

        res.status(200).json({

            success: true,

            campaigns

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const sendCampaign = async (req, res) => {

    try {

        const campaign = await Campaign.findById(

            req.params.id

        );

        if (!campaign) {

            return res.status(404).json({

                success: false,

                message: "Campaign not found."

            });

        }

        if (campaign.sent) {

            return res.status(400).json({

                success: false,

                message: "Campaign already sent."

            });

        }

        const subscribers = await Subscriber.find({
            isVerified: true
        });

        await Promise.all(
            subscribers.map(subscriber =>
                sendCampaignEmail(
                    subscriber,
                    campaign
                )
            )
        );
        campaign.sent = true;

        campaign.sentAt = new Date();

        campaign.totalRecipients = subscribers.length;

        await campaign.save();

        res.status(200).json({

            success: true,

            message:

                `Campaign sent to ${subscribers.length} subscribers.`

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};