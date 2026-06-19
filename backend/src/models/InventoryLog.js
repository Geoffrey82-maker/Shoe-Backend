import mongoose from "mongoose";

const inventoryLogSchema =
new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    quantity: Number,

    action: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model(
    "InventoryLog",
    inventoryLogSchema
);