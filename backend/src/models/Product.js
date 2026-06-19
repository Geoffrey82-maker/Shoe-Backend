import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true
    }
}, { timestamps : true });

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        category: {
            type: String,
            required: true
        },
        images: [
            {
                type: String
            }
        ],
        rating: {
            type: Number,
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        },
        reviews: [reviewSchema],
        featured: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        reviews: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                red: "User"
            },

            name: {
                type: String
            },

            rating: {
                type: Number,
                required: true
            },

            comment: {
                type: String,
                required: true
            },

            createdAt: {
                type: Date,
                default: Date.now
            }
        }],

        averageRating: {
            type: Number,
            default: 0
        },
        
        numReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;