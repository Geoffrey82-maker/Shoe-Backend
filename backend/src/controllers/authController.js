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

        if (!firstname || !lastname || !email || !password) {

            return res.status(400).json({

                success: false,

                message: "All fields are required."

            });

        }

        const cleanFirstname = firstname.trim();

        const cleanLastname = lastname.trim();

        const cleanEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({

                success: false,

                message: "Invalid email address."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters."

            });

        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: cleanEmail });

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        // Create user
        const user =  await User.create({
            firstname: cleanFirstname,

            lastname: cleanLastname,

            email: cleanEmail,

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

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        const cleanEmail = email.trim().toLowerCase();

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
            entity: "User",
            entityId: user._id
        });

        res.cookie("token", token, {

            httpOnly: true,

            secure: process.env.NODE_ENV === "production",

            //sameSite: "strict"

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
        console.error(error);

        res.status(500).json({
            success: false,
            message : "Server error"
        });
    }
};

export const updateProfile = async(req, res) => {

    try{

        const user = await User.findById(req.user._id);

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (req.body.firstname) {

            user.firstname = req.body.firstname.trim();

        }

       if (req.body.lastname) {

            user.lastname = req.body.lastname.trim();

        }

        if (req.body.phone) {

            user.phone = req.body.phone.trim();

        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated",
            user: {

                id: user._id,

                firstname: user.firstname,

                lastname: user.lastname,

                email: user.email,

                phone: user.phone,

                role: user.role

            }
        });
    }catch(error) {

        console.error(error);
    }
};

export const changePassword = async(req, res) => {
    try{

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                success: false,

                message: "Current password and new password are required."

            });

        }

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const isMatch = await user.comparePassword(currentPassword);

        if (newPassword.length < 8) {

            return res.status(400).json({

                success: false,

                message: "New password must be at least 8 characters."

            });

        }

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

        await logEvent({

            user: user._id,

            action: "PASSWORD_CHANGED",

            entity: "User",

            entityId: user._id

        });
    }catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
}

export const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email is required."

            });

        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail
        });

        if(!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists, a password reset email has been sent."
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
            message: "If an account exists, a password reset email has been sent."
        });
    }catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
}

// Reset password

export const resetPassword = async(req, res) => {
    try{

        const { password } = req.body;

        if (!password) {

            return res.status(400).json({

                success: false,

                message: "New password is required."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters."

            });

        }

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

        user.password = password;

        user.resetPasswordToken = undefined;

        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

        await logEvent({

            user: user._id,

            action: "PASSWORD_RESET",

            entity: "User",

            entityId: user._id

        });

    }catch(error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Server error"
            });
    }
}

export const uploadAvatar = async(req,res)=>{

    try {

    

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

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.avatar = req.file.path;

        user.avatarPublicId = req.file.filename;

        if (user.avatarPublicId) {

            await cloudinary.uploader.destroy(

                user.avatarPublicId

            );

        }

        await user.save();

        res.status(200).json({

            success: true,

            message: "Avatar uploaded successfully.",

            avatar: user.avatar

        });
    }catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
  

};

export const getAddresses = async(req,res)=>{
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.status(200).json({

            success:true,

            addresses:
            user.addresses

        });
    }catch (error) {

            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
    }
};

export const addAddress = async(req,res)=>{
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        user.addresses.push(
            req.body
        );

        await user.save();

        res.status(201).json({

            success:true,

            addresses:
            user.addresses

        });
    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const deleteAddress = async(req,res)=>{

    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        const addressExists = user.addresses.some(

            address =>

                address._id.toString() === req.params.id

        );

        if (!addressExists) {

            return res.status(404).json({

                success: false,

                message: "Address not found"

            });

        }

        user.addresses = user.addresses.filter(

                address =>

                address._id.toString()
                !==
                req.params.id

            );

        if (

            user.addresses.length > 0 &&

            !user.addresses.some(a => a.isDefault)

        ) {

            user.addresses[0].isDefault = true;

        }

        await user.save();

        res.status(200).json({

            success:true,

            message:
            "Address deleted successfully",

        });
    }catch(error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Server error"
            });

    }

};

export const updateAddress = async(req,res)=>{
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

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

        }catch(error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Server error"
            });

        }

};

export const setDefaultAddress = async(req,res)=>{

    try {

        const user = await User.findById(
                req.user._id
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        const address = user.addresses.id(req.params.id);

        if (!address) {

            return res.status(404).json({

                success: false,

                message: "Address not found"

            });

        }

        user.addresses.forEach(
            address => { 
                address.isDefault = address._id.toString() === req.params.id;
            }
        );

        await user.save();

        res.status(200).json({

            success:true,

            message: "Default address updated successfully."

        });
    }catch(error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Server error"
            });
    }

};