import mongoose from "mongoose"

const bidsSchema = new mongoose.Schema({
    amount : Number,
    bidder : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "User"
        },
        userName : String,
        profileImage : String,
    },
    auctionItem : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "Auction"
    }
});

export const Bid = mongoose.model("Bid",bidsSchema);