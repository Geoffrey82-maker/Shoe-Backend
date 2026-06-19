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
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        transactionId: String,
    },

    paidAt: Date,

    orderStatus: {
        type: String,
        enum: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default: "pending"
    },

    deliveredAt: {
        type: Date
    },

    cancelledAt: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);