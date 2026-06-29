import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        firstname: {
            type: String,
            trim: true,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        verificationToken: {
            type: String
        },

        source: {
            type: String,
            enum: [
                "website",
                "checkout",
                "popup",
                "admin"
            ],
            default: "website"
        }
    },
    {
        timestamps: true
    }
);

const Subscriber = mongoose.model(
    "Subscriber",
    subscriberSchema
);

export default Subscriber;