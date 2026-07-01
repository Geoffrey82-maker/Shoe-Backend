import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({

    customer: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    admin: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null

    },

    status: {

        type: String,

        enum: [

            "waiting",

            "active",

            "closed"

        ],

        default: "waiting"

    },

    lastMessage: {

        type: String,

        default: ""

    },

    lastMessageAt: {

        type: Date,

        default: Date.now

    }

}, {

    timestamps: true

});

export default mongoose.model(

    "ChatRoom",

    chatRoomSchema

);