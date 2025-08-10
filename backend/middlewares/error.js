class ErrorHandler extends Error {                                  // we created a new error class inheriting form the Error class
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    if(err.name === "JsonWebTokenError"){
        const message = "Json web token is invalid, Try again";
        err = new ErrorHandler(message, 400);
    }

    if(err.name === "TokenExpiredError"){
        const message = "Json web token is expired, Try again";
        err = new ErrorHandler(message, 400);
    }

    if(err.name === "CastError"){
        const message = `Invalid ${err.path}`;                   //It is useful for cases such as we mentioned address can be string only but if we send a number instead. Then this error is triggered. 
        err = new ErrorHandler(message, 400);                     //Or suppose as we mentioned roles can be of three type only mentioned in the enum values. But if any other value comes instead    
    }


    const errorMessage = err.errors
    ? Object.values(err.errors)
    .map((error) => err.message)
    .join(" ")
    : err.message;

    return res.status(err.statusCode).json({
        success : false,
        message : errorMessage,
    });

};

export default ErrorHandler;