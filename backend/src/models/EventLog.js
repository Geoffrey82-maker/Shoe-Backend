import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    action: {
        type: String,
        required: true
    },

    entity: {
        type: String
    },

    entityId: {
        type: String
    },

    metadata: {
        type: Object
    }
}, { timestamps: true });

export default mongoose.model("EventLog", eventLogSchema);