import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    auctionItem : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true,
    }
},{timestamps: true});

export const Bid = mongoose.model('Bid', BidSchema);