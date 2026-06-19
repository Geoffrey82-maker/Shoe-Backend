import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim : true
    },
    lastname: {
        type: String,
        required: true,
        trim : true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true,
    },
    password: {
        type: String,
        required: true,
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpire: {
        type: Date
    },

    phone: {
        type: String,
        default: ""
    },

    addresses: [
        {
            fullName: {
                type: String
            },

            phone: {
                type: String
            },

            address: {
                type: String
            },

            city: {
                type: String
            },

            postalCode: {
                type: String
            },

            country: {
                type: String
            },

            isDefault: {
                type: Boolean,
                default: false
            }
        }
    ],

    avatar:{
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

userSchema.pre('save', async function() {
    if(!this.isModified('password')) {
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.generateResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model("User", userSchema);

export default User;