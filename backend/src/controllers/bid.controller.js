import { isValidObjectId } from "mongoose";
import { Auction } from "../models/auction.model.js";
import { Bid } from "../models/bid.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


const placeBid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const auction = req.auction;
 
  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }

  if (!amount) {
    throw new ApiError(400, "Amount is required");
  }

  if (amount <= auction.currentBid) {
    throw new ApiError(400, "Amount should be greater than Current bid");
  }

  if (amount <= auction.startingBid) {
    throw new ApiError(400, "Amount should be greater than Starting bid");
  }

  const isBid = await Bid.findOne({ auctionItem: id, bidder: req.user._id });

  if (isBid) {
    const updatedBid = await Bid.findByIdAndUpdate(
      isBid._id,
      {
        $set: {
          amount,
        },
      },
      {
        new: true,
      }
    );
    const updatedAuction = await Auction.findByIdAndUpdate(
      id,
      {
        $set: {
          currentBid: amount,
          highestBidder : updatedBid?.bidder
        },
      },
      { new: true }
    );
  } else {
    const newBid = await Bid.create({
      amount,
      bidder: req.user._id,
      auctionItem: id,
    });

    const updatedAuction = await Auction.findByIdAndUpdate(
      id,
      {
        $push : {
            bids : newBid?._id
        },
        $max : {
            currentBid : newBid?.amount
        },
        $set : {
            highestBidder : newBid?.bidder
        }
      },
      { new: true }
    );
  }

  const updatedAuction = await Auction.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(auction._id),
      },
    },
    {
      $lookup: {
        from: "bids",
        localField: "_id",
        foreignField: "auctionItem",
        as: "bids",
      },
    },
    { $unwind: "$bids" }, // Unwind to access bid fields
    {
      $lookup: {
        from: "users",
        localField: "bids.bidder",
        foreignField: "_id",
        as: "bids.bidder",
      },
    },
    {
      $addFields: {
        "bids.bidder": { $arrayElemAt: ["$bids.bidder", 0] },
      },
    },
    {
      $sort: { "bids.amount": -1 }, // Sort after lookup
    },
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        description: { $first: "$description" },
        startTime: { $first: "$startTime" },
        endTime: { $first: "$endTime" },
        startingBid: { $first: "$startingBid" },
        currentBid: { $first: "$currentBid" },
        highestBidder: { $first: "$highestBidder" },
        bids: { $push: "$bids" }, // Restore bids as array
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        startTime: 1,
        endTime: 1,
        startingBid: 1,
        currentBid: 1,
        highestBidder: 1,
        bids: {
          _id: 1,
          amount: 1,
          bidder: {
            _id: 1,
            username: 1,
            email: 1,
            profilePicture: 1,
          },
        },
      },
    },
  ]);
  

  if (!updatedAuction) {
    throw new ApiError(500, "Something wrong while placed the bid");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAuction, "bid placed successfully"));
});

export { placeBid };
