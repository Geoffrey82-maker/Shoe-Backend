import mongoose from "mongoose";

const inventoryHistorySchema = new mongoose.Schema({

    product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Product",

        required: true

    },

    previousStock: {

        type: Number,

        required: true

    },

    newStock: {

        type: Number,

        required: true

    },

    change: {

        type: Number,

        required: true

    },

    reason: {

        type: String,

        enum: [

            "sale",

            "restock",

            "manual",

            "return",

            "adjustment"

        ],

        default: "manual"

    },

    performedBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User"

    }

},

{

    timestamps: true

});

export default mongoose.model(

    "InventoryHistory",

    inventoryHistorySchema

);