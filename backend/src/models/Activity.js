import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({

    action: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    performedBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User"

    },

    module: {

        type: String,

        enum: [

            "order",

            "product",

            "payment",

            "campaign",

            "coupon",

            "user",

            "system"

        ]

    },

    metadata: {

        type: mongoose.Schema.Types.Mixed,

        default: {}

    }

}, {

    timestamps: true

});

export default mongoose.model(

    "Activity",

    activitySchema

);