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
                url: {
                    type: String,
                    required: true
                },
                public_id: {
                    type: String,
                    required: true
                }
            }
        ],
        sizes: [
            {
                type: String
            }
        ],
        numReviews: {
            type: Number,
            default: 0
        },
        
        reviews: [reviewSchema],

        averageRating: {
            type: Number,
            default: 0
        },

        featured: {
            type: Boolean,
            default: false
        },
        
        isActive: {
            type: Boolean,
            default: true
        },
        
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;