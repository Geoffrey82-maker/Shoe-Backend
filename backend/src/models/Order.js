import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    size: {
        type: Number,
        required: true
    },

    color: {
        type: String
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [orderItemSchema],

    orderNumber: {
        type: String,
        unique: true
    },

    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        postalCode: String,

        country: {
            type: String,
            required: true
        }
    },

    subtotal: {
        type: Number,
        required: true
    },

    shippingFee: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true
    },

    discountAmount: {
        type: Number,
        default: 0
    },

    couponCode: {
        type: String
    },

    payment: {
        method: {
            type: String,
            enum: [
                "stripe",
                "paypal",
                "mpesa",
                "cash_on_delivery"
            ],
        },
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        transactionId: String,

        gateway: {
            type: String,
        },

        failedReason: {
            type: String
        },

        paidAt: Date,

        refund: {

            status: {
                type: String,
                enum: [
                    "none",
                    "pending",
                    "processed"
                ],
                default: "none"
            },

            refundedAt: Date,

            amount: {
                type: Number,
                default: 0
            }

        },
    },


    orderStatus: {
        type: String,
        enum: [
            "pending",
            "awaiting_payment",
            "paid",
            "processing",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
            "return_requested",
            "return_approved",
            "return_rejected",
            "refunded"
        ],
        default: "pending"
    },

    returnRequest: {

        requested: {
            type: Boolean,
            default: false
        },

        reason: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "completed"
            ],
            default: "pending"
        },

        requestedAt: Date,

        processedAt: Date,

        adminNotes: {
            type: String,
            default: ""
        }

    },

    deliveredAt: {
        type: Date
    },

    cancelledAt: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);