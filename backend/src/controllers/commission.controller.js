import { isValidObjectId } from "mongoose";
import { Auction } from "../models/auction.model.js";
import { PaymentProof } from "../models/paymentProof.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const calculateCommission = async (auctionId) => {
  if (!isValidObjectId(auctionId)) {
    throw new ApiError(400, "Invalid Auction id formate");
  }

  const auction = await Auction.findById(auctionId);
  const commissionRate = 0.07;
  const commission = auction.currentBid * commissionRate;

  return commission;
};


const proofOfCommission = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Payment proof screenshot require");
  }

  const proof = req.file;

  const allowedFormate = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormate.includes(proof.mimetype)) {
    throw new ApiError(400, "Please provide a valid image file");
  }

  const { amount, comment } = req.body;
  if (!amount || !comment) {
    throw new ApiError(400, "Amount & comment are required feilds");
  }
  const user = await User.findById(req.user?._id);

  if (user.unpaidCommission === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "You don't have any unpaid commision"));
  }

  if (user.unpaidCommission < amount) {
    throw new ApiError(
      403,
      `The amont exceeds your unpaid commission balance. Please enter an amount up to ${user.unpaidCommission} `
    );
  }

  const proofImgLocalPath = proof?.path;

  const proofImg = await uploadOnCloudinary(proofImgLocalPath);

  if (!proofImg) {
    throw new ApiError(500, "Failed to upload proof image");
  }

  const commissionProof = await PaymentProof.create({
    user: req.user?._id,
    proof: proofImg.secure_url,
    amount,
    comment,
  });

  if (!commissionProof) {
    throw new ApiError(500, "Failed to create commission proof");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        commissionProof,
        "Your proof has been submitted successfully. We will review it and responed to you within 24 hours."
      )
    );
});

export { proofOfCommission, calculateCommission };
