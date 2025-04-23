import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { Auction } from "../models/auction.model.js";

export const checkAuctionEndTime = asyncHandler(async (req, _, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Auction ID");
  }

  const auction = await Auction.findById(id);

  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }

  if (new Date(auction.startTime) > Date.now()) {
    throw new ApiError(400, "Auction has not start yet .");
  }

  if (new Date(auction.endTime) < Date.now()) {
    throw new ApiError(400, "Auction is end .");
  }
  req.auction = auction
  next();
});
