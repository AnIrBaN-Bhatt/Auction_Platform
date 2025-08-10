import e from "express";
import {addNewAuctionItem} from "../controllers/auctionItemController.js";
import {isAuthenticated} from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

router.post("/create",isAuthenticated, addNewAuctionItem); // Route to create a new auction item

export default router;   