import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: String,

    image: String,

    size: {
        type: Number,
        required: true
    },

    color: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        default: 1
    },

    price: {
        type: Number,
        required: true
    },

    lastReminderSent: {

        type: Date,

        default: null

    },

    recovered: {

        type: Boolean,

        default: false

    }

});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    items: [cartItemSchema]
}, { timestamps : true });

export default mongoose.model("Cart", cartSchema);