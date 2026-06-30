import mongoose from "mongoose";

const wishlistSchema =
new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    priceWhenAdded: {

            type: Number,

            required: true

    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

export default mongoose.model(
    "Wishlist",
    wishlistSchema
);