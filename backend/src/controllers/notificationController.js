import Notification
from "../models/Notification.js";

export const getNotifications = async (
    req,
    res
) => {

    const notifications =
        await Notification.find({

            user: req.user._id

        })

        .sort({

            createdAt: -1

        });

    res.json({

        success: true,

        notifications

    });

};

export const markRead = async (
    req,
    res
) => {

    await Notification.findByIdAndUpdate(

        req.params.id,

        {

            isRead: true

        }

    );

    res.json({

        success: true

    });

};

export const markAllRead = async (
    req,
    res
) => {

    await Notification.updateMany(

        {

            user: req.user._id

        },

        {

            isRead: true

        }

    );

    res.json({

        success: true

    });

};