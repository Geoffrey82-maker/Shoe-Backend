import Notification
from "../models/Notification.js";

export const getNotifications = async (req, res) => {

    try {
        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 20;

        const skip = (page - 1) * limit;

       const notifications = await Notification.find({

            user: req.user._id

        })

        .select(

            "title message type icon actionUrl isRead createdAt"

        )

        .sort({

            createdAt: -1

        })
        .skip(skip)

        .limit(limit);

        res.json({

            success: true,

            count: notifications.length,

            notifications

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message

        });

    }

};

export const markRead = async (req,res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid notification ID."

            });

        }
        const notification = await Notification.findOneAndUpdate(

            {
                _id: req.params.id,
                user: req.user._id
            },

            {
                isRead: true
            },
            {
                new: true
            }
        );

        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found."

            });

        }

        res.status(200).json({

            success: true,

            message: "Notification marked as read.",

            notification

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};

export const markAllRead = async (req,res) => {

    try {

        const result = await Notification.updateMany(

            {

                user: req.user._id,

                isRead: false

            },

            {

                $set: {

                    isRead: true

                }

            }

        );

        res.status(200).json({

            success: true,

            message: "All notifications marked as read.",

            updatedCount: result.modifiedCount

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};