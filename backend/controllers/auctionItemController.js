import {Auction} from '../models/auctionSchema.js';
import {User} from '../models/userSchema.js'
import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import {v2 as cloudinary} from 'cloudinary';
import mongoose from "mongoose";

export const addNewAuctionItem = catchAsyncError(async (req, res, next) => {

 if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Auction item Image required",400));
    }

    const { image } = req.files;

    const  allowedFormats = ["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(image.mimetype)){
        return next(new ErrorHandler("File format not supported", 400))
    }

    const {title,description,category,condition,startingBid,startTime,endTime} = req.body || {};

    if(!title || !description || !category || !condition || !startingBid || !startTime || !endTime){
        return next(new ErrorHandler("Please provide all details.", 400));
    }

    if(new Date(startTime) < Date.now()){
        return next(new ErrorHandler("Auction starting time must be greater than current time", 400));
    }

    if(new Date(endTime) <= new Date(startTime)){
        return next(new ErrorHandler("Auction end time must be greater than start time", 400));
    }

    const alreadyOneAuctionExists = await Auction.findOne({
        createdBy: req.user._id,
        endTime: { $gte: new Date(startTime) }
    });

    if(alreadyOneAuctionExists){
        return next(new ErrorHandler("You already have an auction.", 400));
    }

    try{
        const cloudinaryResponse = await cloudinary.uploader.upload(
        image.tempFilePath,
        {
        folder: "MERN_AUCTION_PLATFORM_AUCTIONS",
        });

        if(!cloudinaryResponse || cloudinaryResponse.error){
            console.error("cloudinary error:", cloudinaryResponse.error ||  "Unknown error occurred");
            return next(new ErrorHandler("Failed to upload auction image to cloudinary",500));
        }

        const auctionItem = await Auction.create({
            title,
            description,
            category,
            condition,
            startingBid,
            startTime,
            endTime,
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            },
            createdBy: req.user._id
        });
        await auctionItem.populate('createdBy', 'userName email');
        return res.status(201).json({
            success: true,
            message: `Auction item created and will be listed on auction page at ${startTime}`,
            auctionItem
        });
    }
    catch(error){
        return next(new ErrorHandler(error.message || "Failed to create auction.", 500));
    }

})

export const getAllItems = catchAsyncError(async (req, res, next) => {
    const auctions = await Auction.find({ endTime: { $gte: new Date() } })   //Fetching all auctions that are currently active
        .populate('createdBy', 'userName email')
        .sort({ startTime: 1 });

    if (!auctions || auctions.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No active auctions found."
        });
    }

    return res.status(200).json({
        success: true,
        auctions
    });
});


export const getMyAuctionDetails = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid auction ID", 400));
    }
    const auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found", 404));
    }
    const bidders = auctionItem.bids.sort((a,b) => b.bid - a.bid)
    res.status(200).json({
        success:true,
        auctionItem,
        bidders
    })
});

export const getMyAuctionItems = catchAsyncError(async (req, res, next) => {
    const items = await Auction.find({createdBy:req.user._id});
    res.status(200).json({
        success:true,
        items
    })
});

export const removeFromAuction = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid auction ID", 400));
    }
    const auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found", 404));
    }
    await auctionItem.deleteOne();
    res.status(200).json({
        success:true,
        message: "Auction item deleted successfully."
    })
});

export const republishItem = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid auction ID", 400));
    }
    let auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found", 404));
    }
    if(new Date(auctionItem.endTime) > Date.now()){
        return next(new ErrorHandler("Auction already active , cannot republish", 400))
    }
    
    if(!req.body || !req.body.startTime || !req.body.endTime){
        return next(new ErrorHandler("Starttime and Endtime for republish is mandatory.", 400));
    }

    console.log(new Date(req.body.startTime));
    let data = {
        startTime : new Date (req.body.startTime),
        endTime : new Date (req.body.endTime)
    }

    if(data.startTime < Date.now()){
        return next(new ErrorHandler("Auction starting time must be greater than present time" , 400))
    }
    if(data.startTime >= data.endTime){
        return next(new ErrorHandler("Auction starting time must be less than ending time" , 400))
    }
    data.bids = [];
    data.comissionCalculated = false;
    auctionItem = await Auction.findByIdAndUpdate(id,data,{
        new : true,
        runValidators: true,
        useFindAndModify: false
    });
    const createdBy = await User.findByIdAndUpdate(
    req.user._id,
    { unpaidCommission: 0 },
    {
      new: true,
      runValidators: false,
      useFindAndModify: false,
    }
  );
    res.status(200).json({
        success:true,
        auctionItem,
        message:`Auction republished and will be active on ${req.body.startTime}.`,
        createdBy
    });
});