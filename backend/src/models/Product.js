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

    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    

    comment: {
        type: String,
        required: true
    },

    helpfulVotes: {
        type: Number,
        default: 0
    },

    votedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    images: [

        {

            url: {

                type: String

            },

            public_id: {

                type: String

            }

        }

    ],

    isVisible: {

        type: Boolean,

        default: true

    },

    reply: {

        message: String,

        repliedBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        },

        repliedAt: Date

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
        discountPrice: {
            type: Number,
            min: 0
        },
        stock: {

            type: Number,

            required: true,

            default: 0,

            min: 0

        },

        lowStockThreshold: {

            type: Number,

            default: 5

        },

        status: {

            type: String,

            enum: [

                "in_stock",

                "low_stock",

                "out_of_stock"

            ],

            default: "in_stock"

        },
        category: {
            type: String,
            required: true
        },

        brand: {

            type: String,

            required: true,

            trim: true

        },

        colors: [
            {
                type: String
            }
        ],

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

productSchema.index({

    name: "text",

    description: "text",

    brand: "text",

    category: "text"

});

export default Product;
