import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: [
            "order",
            "payment",
            "product",
            "coupon",
            "system",
            "newsletter"
        ],
        default: "system"
    },

    icon: {
        type: String,
        default: "bell"
    },

    isRead: {
        type: Boolean,
        default: false
    },

    actionUrl: String

}, {
    timestamps: true
});

export default mongoose.model(
    "Notification",
    notificationSchema
);