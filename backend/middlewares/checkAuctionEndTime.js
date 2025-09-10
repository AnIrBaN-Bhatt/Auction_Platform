import express from 'express'
import { catchAsyncError } from './catchAsyncError.js'
import mongoose from 'mongoose';
import ErrorHandler from './error.js';
import { Auction } from '../models/auctionSchema.js';

export const checkAuctionEndtime = catchAsyncError(async (req,res,next) =>{
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid Auction id" , 400));
    }

    const auctionItem = await Auction.findById(id);

    if(!auctionItem)
    {
        return next(new ErrorHandler("Auction does not exist", 400))
    }

    const now = new Date();
    

    if(new Date(auctionItem.startTime) > now)
    {
        return next(new ErrorHandler("Auction has not started yet",400));
    }

    if(new Date(auctionItem.endTime) < Date.now())
    {
        return next(new ErrorHandler("Auction already ended", 400));
    }
    next();

})