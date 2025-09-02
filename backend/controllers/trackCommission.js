import {User} from "../models/userSchema.js"
import {catchAsyncError} from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js"

export const trackCommissionStatus = catchAsyncError(async (req,res,next) => {
    const user = await User.findById(req.user._id);
    if(user.unpaidCommission > 0){
        return next(new ErrorHandler("You have unpaid commissions. Please pay them before posting new auctions",403));
    }
    next();
})