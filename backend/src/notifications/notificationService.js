import Notification from "../models/Notification.js";
import { getIO } from "../socket/socket.js";

export const createNotification = async ({

    user = null,

    title,

    message,

    type = "system",

    icon = "bell",

    actionUrl = null,

    metadata = {}

}) => {

    const notification = await Notification.create({

        user,

        title,

        message,

        type,

        icon,

        actionUrl,

        metadata

    });

    const io = getIO();

    // User-specific notification
    if (user) {

        io.to(user.toString())
            .emit("notification", notification);

    }

    // Admin notification
    io.emit("admin-notification", notification);

    return notification;

};