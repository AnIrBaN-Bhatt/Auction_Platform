import {addNewAuctionItem, getAllItems, getMyAuctionDetails, removeFromAuction, republishItem, getMyAuctionItems} from "../controllers/auctionItemController.js";
import {isAuthenticated,isAuthorized} from "../middlewares/auth.js";
import express from "express";
import { trackCommissionStatus } from "../middlewares/trackCommission.js";

const router = express.Router();

router.post("/create",isAuthenticated,isAuthorized('Auctioneer'), trackCommissionStatus, addNewAuctionItem); // Route to create a new auction item

router.get("/allItems",getAllItems);

router.get("/allIems/:id",isAuthenticated, getMyAuctionDetails); // To view the details of a specific auction item

router.get("/myitems",isAuthenticated, isAuthorized('Auctioneer'), getMyAuctionItems)

router.delete("/delete/:id",isAuthenticated, isAuthorized('Auctioneer'),removeFromAuction);

router.put("/item/republish/:id",isAuthenticated, isAuthorized('Auctioneer'), republishItem); // Route to republish an auction item


export default router;   