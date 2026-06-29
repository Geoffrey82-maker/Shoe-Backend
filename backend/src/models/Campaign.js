const campaignSchema = new mongoose.Schema({

    title: String,

    subject: String,

    html: String,

    scheduledFor: Date,

    status: {

        type: String,

        enum: [

            "draft",

            "scheduled",

            "sent"

        ],

        default: "draft"

    },

    recipientCount: Number,

    sentAt: Date

});