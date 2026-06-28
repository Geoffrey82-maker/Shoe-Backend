import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import logEvent from "../services/eventLogServices.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        // Create user
        const user =  await User.create({
            firstname,
            lastname,
            email,
            password
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            }
        });

    }catch(err) {
        console.error(err);
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Create Login controller

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);

        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        //Generate token
        const token = generateToken(user._id);

        await logEvent({
            user: user._id,
            action: "USER_LOGIN",
            enity: "User",
            enityId: user._id
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstname : user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            }
        });


    }catch(err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message : "Server error"
        });
    }
};

export const updateProfile = async(req, res) => {
    const user = await User.findById(req.user._id);

    if(!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    user.firstname = req.body.firstname || user.firstname;

    user.lastname = req.body.lastname || lastname;

    user.phone = req.body.phone || phone;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated",
        user
    });
};

export const changePassword = async(req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if(!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect"
        });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
}

export const forgotPassword = async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    });

    if(!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const resetToken = user.generateResetToken();

    await user.save({
        validateBeforeSave: false
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(
        user.email,
        resetUrl
    );

    res.status(200).json({
        success: true,
        message: "Reset email sent"
    });
}

// Reset password

export const resetPassword = async(req, res) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });

    if(!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful"
    });
}

export const uploadAvatar =
async(req,res)=>{

    if(!req.file){

        return res.status(400).json({

            success:false,

            message:
            "Please upload an image"

        });
    }

    const user =
        await User.findById(
            req.user._id
        );

    user.avatar =
        req.file.path;

    await user.save();

    res.status(200).json({

        success:true,

        avatar:
        req.file.path

    });

};

export const getAddresses =
async(req,res)=>{

    const user =
        await User.findById(
            req.user._id
        );

    res.status(200).json({

        success:true,

        addresses:
        user.addresses

    });

};

export const addAddress =
async(req,res)=>{

    const user =
        await User.findById(
            req.user._id
        );

    user.addresses.push(
        req.body
    );

    await user.save();

    res.status(201).json({

        success:true,

        addresses:
        user.addresses

    });

};

export const deleteAddress =
async(req,res)=>{

    const user =
        await User.findById(
            req.user._id
        );

    user.addresses =
        user.addresses.filter(

            address =>

            address._id.toString()
            !==
            req.params.id

        );

    await user.save();

    res.status(200).json({

        success:true,

        message:
        "Address deleted"

    });

};

export const updateAddress =
async(req,res)=>{

    const user =
        await User.findById(
            req.user._id
        );

    const address =
        user.addresses.id(
            req.params.id
        );

    if(!address){

        return res.status(404).json({

            success:false,

            message:
            "Address not found"

        });
    }

    address.fullName =
        req.body.fullName ||
        address.fullName;

    address.phone =
        req.body.phone ||
        address.phone;

    address.address =
        req.body.address ||
        address.address;

    address.city =
        req.body.city ||
        address.city;

    address.postalCode =
        req.body.postalCode ||
        address.postalCode;

    address.country =
        req.body.country ||
        address.country;

    await user.save();

    res.status(200).json({

        success:true,

        addresses:
        user.addresses

    });

};

export const setDefaultAddress =
async(req,res)=>{

    const user =
        await User.findById(
            req.user._id
        );

    user.addresses.forEach(
        address => {

            address.isDefault =
                address._id.toString()
                ===
                req.params.id;

        }
    );

    await user.save();

    res.status(200).json({

        success:true,

        message:
        "Default address updated"

    });

};