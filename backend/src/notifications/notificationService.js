import Notification
from "../models/Notification.js";
import { getIO } from "../socket/socket.js";

export const createNotification = async ({

    user,

    title,

    message,

    type = "system",

    icon = "bell",

    actionUrl = null

}) => {

    const notification = await Notification.create({

        user,

        title,

        message,

        type,

        icon,

        actionUrl

    });

    getIO()

    .to(user.toString())

    .emit("notification", notification);

};

