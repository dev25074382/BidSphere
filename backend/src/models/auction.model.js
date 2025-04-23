import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startingBid: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    currentBid: {
        type: Number,
        required: true,
        default: 0,
    },
    condition: {
        type: String,
        enum : ['New', 'Used'],
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bids : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
    }],
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    commissionCalculated: {
        type: Boolean,
        default: false,
    }
},{timestamps: true});


export const Auction = mongoose.model('Auction', auctionSchema);