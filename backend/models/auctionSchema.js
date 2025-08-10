import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    startingBid: Number,
    condition: {
        type: String,
        enum: ["New", "Used", "Refurbished"]
    },
    currentBid: {
        type: Number,
        default: 0
    },
    startTime: String,
    endTime: String,
    image: {
        public_id :{
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bids: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bid"
        },
        userName: String,
        amount: Number,
        profileImage: String
    }],
    heigestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comissionCalculated: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const Auction = mongoose.model("Auction", auctionSchema);
// Exporting the Auction model
// This allows us to use this model in other parts of the application, such as controllers or services, to interact with the auctions collection in the MongoDB database.