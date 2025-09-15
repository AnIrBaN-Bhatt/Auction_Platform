import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { PaymentProof } from "../models/commissionProofSchema.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const proofOfCommission = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Payment proof screenshot required", 400));
  }
  const { proof } = req.files;
  const { amount, comment } = req.body;
  const user = await User.findById(req.user._id);

  if (!amount || !comment) {
    return next(new ErrorHandler("Amount & comment are required files", 400));
  }

  if (user.unpaidCommission === 0) {
    return res.status(200).json({
      success: true,
      message: "You dont have any unpaid commission",
    });
  }

  if (user.unpaidCommission < amount) {
    return next(
      new ErrorHandler(
        `The amount exceeds the unpaid commission. Please enter an amount upto ${user.unpaidCommission}`,
        400
      )
    );
  }

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormats.includes(proof.mimetype)) {
    return next(new ErrorHandler("File format not supported", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    proof.tempFilePath,
    {
      folder: "MERN_AUCTION_PAYMENT_PROOFS",
    }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "cloudinary error:",
      cloudinaryResponse.error || "Unknown error occurred"
    );
    return next(new ErrorHandler("Failed to upload payment proof", 500));
  }

  const commissionProof = await PaymentProof.create({
    userId: req.user._id,
    amount,
    comment,
    proof: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Payment proof submitted successfully. We will review it and respond within 24 hours",
    commissionProof
  });
});
