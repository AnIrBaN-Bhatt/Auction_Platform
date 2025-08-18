import {User} from "../models/userSchema.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const {token} = req.cookies; // Extracting token from cookies

    if(!token){
        return next(new ErrorHandler("User not Authenticated", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET); // Verifying the token with the secret key

    req.user = await User.findById(decodedData.id); // Finding the user by id from the decoded token

    next(); // Proceed to the next middleware or route handler
});

export const isAuthorized = (...roles) => {
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    }
}