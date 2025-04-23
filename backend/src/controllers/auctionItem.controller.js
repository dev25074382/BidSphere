import { Auction } from "../models/auction.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { Bid } from "../models/bid.model.js";
import mongoose from "mongoose";

const createAuction = asyncHandler(async (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    throw new ApiError(400, "Please provide an image of the item");
  }

  const image = req.file;

  const allowedFormate = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormate.includes(image.mimetype)) {
    throw new ApiError(400, "Please provide a valid image file");
  }

  const {
    title,
    description,
    startingBid,
    category: category,
    startTime,
    endTime,
    condition,
  } = req.body;


  if (
    !title ||
    !description ||
    !startingBid ||
    !startTime ||
    !endTime ||
    !condition ||
    !category
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  console.log(startTime);

  console.log(new Date(startTime + " GMT+0530"));
  console.log(Date.now());
  if (new Date(startTime + " GMT+0530") < Date.now()) {
    throw new ApiError(400, "Start time should be greater than current time");
  }

  if (new Date(startTime + " GMT+0530") >= new Date(endTime + " GMT+0530")) {
    throw new ApiError(400, "Start time should be less than end time");
  }

  const alreadyOneAuctionActive = await Auction.findOne({
    createdBy: req.user._id,
    endTime: { $gt: new Date() },
  });

  if (alreadyOneAuctionActive) {
    throw new ApiError(
      400,
      "You already have an active auction, please wait until it ends"
    );
  }

  const imageUrl = await uploadOnCloudinary(image?.path);

  if (!imageUrl) {
    throw new ApiError(500, "Something went wrong while uploading image");
  }

  const auction = await Auction.create({
    title,
    description,
    startingBid,
    category: category,
    startTime: new Date(startTime + " GMT+0530"),
    endTime: new Date(endTime + " GMT+0530"),
    condition,
    image: imageUrl?.secure_url,
    createdBy: req.user._id,
  });

  if (!auction) {
    throw new ApiError(500, "Failed to create auction item");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        auction,
        `Auction item created and will start on ${startTime}`
      )
    );
});

const getAllItems = asyncHandler(async (req, res) => {
  const auctions = await Auction.find({ endTime: { $gt: new Date() } })
    .populate("createdBy", "username email")
    .select(
      "title description startingBid catagoery condition image createdAt startTime endTime"
    );

  console.log(auctions);

  if (auctions?.length === 0) {
    throw new ApiError(404, "No auction items found");
  }

  return res.status(200).json(new ApiResponse(200, auctions, "Auction items"));
});

const getMyAuctionItems = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  const items = await Auction.find({ createdBy: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, items, "item fetch successfully"));
});

const removeFromAuction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id formate");
  }
  const auction = await Auction.findById(id);
  if (!auction) {
    throw new ApiError(400, "Auction not found");
  }
  if (auction.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this auction");
  }
  const deleted = await Auction.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(500, "Failed to delete auction");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Auction deleted successfully"));
});

const republishItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id formate");
  }
  const auction = await Auction.findById(id);
  if (!auction) {
    throw new ApiError(400, "Auction not found");
  }
  if (auction.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this auction");
  }

  if (new Date(auction.endTime) > Date.now()) {
    throw new ApiError(400, "Auction is still active");
  }
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime) {
    throw new ApiError(400, "Please provide start and end time");
  }
  if (new Date(startTime + " GMT+0530") < Date.now()) {
    throw new ApiError(400, "Start time should be greater than current time");
  }
  if (new Date(startTime + " GMT+0530") >= new Date(endTime + " GMT+0530")) {
    throw new ApiError(400, "Start time should be less than end time");
  }

  if (auction.highestBidder) {
    const highestBidder = await User.findByIdAndUpdate(
      auction.highestBidder,
      {
        $inc: {
          moneySpent: -auction.currentBid,
          auctionWon: -1,
        },
      },
      { new: true }
    );
  }

  const updated = await Auction.findByIdAndUpdate(
    auction._id,
    {
      $set: {
        startTime: new Date(startTime + " GMT+0530"),
        endTime: new Date(endTime + " GMT+0530"),
        bids: [],
        commissionCalculated: false,
        currentBid: 0,
        highestBidder: null,
      },
    },
    { new: true }
  );

  await Bid.deleteMany({ auctionItem: auction._id });

  if (!updated) {
    throw new ApiError(500, "Failed to update auction");
  }

  const createBy = await User.findByIdAndUpdate(
    updated?.createdBy,
    {
      $set: {
        unpaidCommition: 0,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Auction updated successfully"));
});

const getAuctionDetails = asyncHandler(async (req, res) => {
  console.log("getAuction Details");
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id formate");
  }
  const auctions = await Auction.findById(id);

  if (!auctions) {
    throw new ApiError(400, "Auction not found");
  }

  const bidders = await Auction.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(auctions._id),
      },
    },
    {
      $lookup: {
        from: "bids",
        localField: "_id",
        foreignField: "auctionItem", // Ensure correct foreign field
        as: "bids",
      },
    },
    {
      $unwind: {
        path: "$bids",
        preserveNullAndEmptyArrays: false, // Ensure only auctions with bids are considered
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "bids.bidder",
        foreignField: "_id",
        as: "bidderDetails",
      },
    },
    {
      $unwind: {
        path: "$bidderDetails",
        preserveNullAndEmptyArrays: false, // Ensure only bids with valid bidders are considered
      },
    },
    {
      $project: {
        _id: 0,
        username: "$bidderDetails.username",
        email: "$bidderDetails.email",
        profilePicture: "$bidderDetails.profilePicture",
        amount: "$bids.amount",
      },
    },
    {
      $sort: {
        amount: -1, // Sort by highest bid amount
      },
    },
  ]);
  
  
  


  if (!bidders) {
    throw new ApiError(400, "No bidders found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { bidders, auctions }, "Bidders on this auction")
    );
});

export {
  createAuction,
  getAllItems,
  republishItem,
  removeFromAuction,
  getMyAuctionItems,
  getAuctionDetails,
};
