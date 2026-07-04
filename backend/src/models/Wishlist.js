import mongoose from "mongoose";

const wishlistSchema =
new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            priceWhenAdded: {
                type: Number,
                required: true
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
