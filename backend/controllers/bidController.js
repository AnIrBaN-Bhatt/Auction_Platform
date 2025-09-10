import {catchAsyncError} from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js"
import {Auction} from "../models/auctionSchema.js"
import {Bid} from "../models/bidsSchema.js"
import {User} from "../models/userSchema.js"
import mongoose from "mongoose"

export const placeBid = catchAsyncError(async(req,res,next) =>{
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new ErrorHandler("Invalid auction ID", 400));
        }

    const auctionItem = await Auction.findById(id);

    if(!auctionItem){
        return next(new ErrorHandler("Auction Item not found" , 404));
    }

    const {amount} = req.body;

    if(!amount){
        return next(new ErrorHandler("Please place your bid" , 400));
    }

    if(amount <= auctionItem.currentBid){
        return next(new ErrorHandler("Bid amount must be greater than current Bid" , 400));
    }

    if(amount <= auctionItem.startingBid){
        return next(new ErrorHandler("Bid amount must be greater than starting Bid" , 400));
    }

    try {
        const existingBid = await Bid.findOne({
            "bidder.id" : req.user._id,
            auctionItem : auctionItem._id,
        })
        const existingBidInAuction = auctionItem.bids.find((bid) => bid.userId.toString() == req.user._id.toString());
        if(existingBid && existingBidInAuction){
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            await existingBidInAuction.save();
            await existingBid.save();
            auctionItem.currentBid = amount;
        }
        else{
            const bidderDetail = await User.findById(req.user._id);
            const bid = await Bid.create({
                amount,
                bidder : {
                    id : bidderDetail._id,
                    userName : bidderDetail.userName,
                    profileImage : bidderDetail.profileImage?.url
                },
                auctionItem : auctionItem._id
            })
            auctionItem.bids.push({
                userId : req.user._id,
                userName : bidderDetail.userName,
                profileImage : bidderDetail.profileImage?.url,
                amount,
            })
            auctionItem.currentBid = amount;
        }
        await auctionItem.save();
        
        res.status(201).json({
            success : true,
            message : "Bid placed.",
            currentBid : auctionItem.currentBid,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to place a bid." , 500));
    }
})