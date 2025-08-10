import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary"
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { generateToken } from "../utils/jwtToken.js";
import { response } from "express";

export const register = catchAsyncError(async (req,res,next) => {

    
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Profile Image required",400));
    }

    const { profileImage } = req.files;

    const  allowedFormats = ["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(profileImage.mimetype)){
        return next(new ErrorHandler("File format not supported", 400))
    }

        const {
           userName, 
           password, 
           email, 
           address, 
           phone, 
           role , 
           bankAccountNumber, 
           bankAccountName, 
           bankName, 
           upiNumber, 
           paypalEmail } = req.body;
    if(!userName || !password || !email || !address || !phone || !role){
        return next(new ErrorHandler("Please fill full form", 400));
    }



    if(role === "Auctioneer"){
        if(!bankAccountName || !bankAccountNumber || !bankName){
            return next(new ErrorHandler("Please provide full bank details",400));
        }
        if(!upiNumber){
            return next(new ErrorHandler("Please provide UPI Number",400));
        }
        if(!paypalEmail){
            return next(new ErrorHandler("Please provide paypal Email",400));
        }
    }
    const isRegistered = await User.findOne({email});

    if(isRegistered){
        return next(new ErrorHandler("User already registered",400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath,{
        folder: "MERN_AUCTION_PLATFORM_USERS",
    });

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary error:", cloudinaryResponse.error ||  "Unknown error occurred");
        return next(new ErrorHandler("Cloudinary error",500));
    }

    const user = await User.create({
        userName,
        password,
        passwordCopy: password, // Assuming you want to store the password copy as well
        email,
        address,
        phone,
        profileImage: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        },
        paymentMethods: {
            bankTransfer: {
                bankAccountNumber,
                bankAccountName,
                bankName
            },
            upi: {
                upiNumber
            },
            paypal: {
                paypalEmail
            }
        },
        role
    });

    // const createdUser = await User.findById(user._id);
    // generateToken(user, "User registered successfully", 201, res);

    try {
    generateToken(user, "User registered successfully", 201, res);
} catch (error) {
    await User.findByIdAndDelete(user._id);  // Rollback manually
    return next(new ErrorHandler("User registration failed during token generation", 500));
}
 

});

export const login = catchAsyncError(async (req, res, next) => {
    const {email,password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please fill full form", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("User not registered", 404));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(user, "User logged in successfully", 200, res);
});

export const getProfile = catchAsyncError(async (req, res, next) => {
    const user = req.user; // Assuming user is set by the auth middleware
    res.status(200).json({
        success: true,
        user
    });
});

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token","",{
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    .json({
        success: true,
        message: "User logged out successfully"
    })
});

export const fetchLeaderboard = catchAsyncError(async (req, res, next) => {
    const users = await User.find({moneySpent: {$gt: 0}});
    const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
    res.status(200).json({
        success: true,
        leaderboard: leaderboard.slice(0, 10) // Return top 10 users
    });
});