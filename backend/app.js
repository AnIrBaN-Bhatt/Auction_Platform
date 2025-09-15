import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import cors from "cors"
import fileUpload from "express-fileupload";
import { connection } from "./Database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js";
import bidRouter from "./router/bidRoutes.js"
import commissionRouter from "./router/commissionRoutes.js"


const app = express();

config({
    path:"./config/config.env",
}); 

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST","GET","PUT","DELETE"],                     // To connect both frontend and backend
    credentials: true,
}));

app.use(cookieParser());                                        // To use the generated cookies

app.use(express.json());                                        // Helps to get data in JSON format

app.use(express.urlencoded({extended:true}));                   //To check if the data sent  is of the same format as that of the expected format

app.use(fileUpload({                                            //To upload files in cloudinary . This is a middleware provided by express-fileupload
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

app.use("/api/v1/user", userRouter);                                 // To use the user routes
app.use("/api/v1/auctionitem", auctionItemRouter);                    // To use the auction item routes
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission" , commissionRouter);

connection();

app.use(errorMiddleware);

export default app;