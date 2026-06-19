import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    discountType: {
        type: String,
        enum: [
            "percentage",
            "fixed"
        ],
        required: true
    },

    discountValue: {
        type: Number,
        required: true
    },

    minimumAmount: {
        type: Number,
        default: 0
    },

    expiresAt:{
        type: Date,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    usageLimit: {
        type: Number,
        default: 0
    },

    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);