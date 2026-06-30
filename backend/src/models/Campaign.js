import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({

    subject: {
        type: String,
        required: true,
        trim: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    content: {
        type: String,
        required: true
    },

    buttonText: {
        type: String,
        default: ""
    },

    buttonUrl: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    sent: {
        type: Boolean,
        default: false
    },

    sentAt: Date,

    totalRecipients: {
        type: Number,
        default: 0
    },

    createdBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User"

    }

}, {

    timestamps: true

});

const Campaign = mongoose.model(
    "Campaign",
    campaignSchema
);

export default Campaign;