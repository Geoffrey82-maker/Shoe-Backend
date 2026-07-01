import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    room: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "ChatRoom",

        required: true

    },

    sender: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    message: {

        type: String,

        required: true,

        trim: true

    },

    read: {

        type: Boolean,

        default: false

    }

}, {

    timestamps: true

});

export default mongoose.model(

    "Message",

    messageSchema

);