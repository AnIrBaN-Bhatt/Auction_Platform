import { catchAsyncError } from '../middlewares/catchAsyncError.js'
import ErrorHandler from '../middlewares/error.js'
import { Commission } from '../models/commissionSchema.js'
import { User } from '../models/userSchema.js'
import mongoose from 'mongoose'
import { Auction } from '../models/auctionSchema.js'
import { PaymentProof } from '../models/commissionProofSchema.js'

export const deleteAuctionItem = catchAsyncError(async (req, res, next) => {
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

export const getAllPaymentProofs = catchAsyncError(async(req,res,next)=>{
    let paymentProofs = await paymentProofs.find();
    res.status(200).json({
        success : true,
        paymentProofs
    });
});

export const getPaymentProof = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid id format", 400));
    }

    const paymentProofDetail = await paymentProofs.findById(id);

    if(!paymentProofDetail)
    {
        return next(new ErrorHandler("Payment proof detail not found", 404));
    }
    res.status(200).json({
        success : true,
        paymentProofDetail
    });

});

export const updateProofStatus = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid Id format", 400));
    }

    const { amount, status } = req.body;
    let proof = await PaymentProof.findById(id);

    if(!proof){
        return next(new ErrorHandler("Payment proof detail not found",404));
    }
    proof = await PaymentProof.findByIdAndUpdate(id,{status, amount},{
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });
    
    res.status(200).json({
        success : true,
        message : "Payment proof amount and status updated",
        proof,
    });
});

export const deletePaymentProof = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invaild id format", 400));
    }

    const proof = await PaymentProof.findById(id);

    if(!proof){
        return next(new ErrorHandler("Payment proof not found", 404));
    }

    await proof.deleteOne();

    res.status(200).json({
        success : true,
        message : "Payment proof deleted",
    })

})

