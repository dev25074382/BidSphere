import { isValidObjectId } from "mongoose";
import { Auction } from "../models/auction.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PaymentProof } from "../models/paymentProof.model.js";
import { User } from "../models/user.model.js";
import { Commission } from "../models/commission.model.js";

const deleteAuctionItem = asyncHandler(async (req, res) => {
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

const getAllPaymentProofs = asyncHandler(async (req, res) => {
  const paymentProof = await PaymentProof.find();

  return res
    .status(200)
    .json(
      new ApiResponse(200, paymentProof, "Payment proof fetch successfully")
    );
});

const getPaymentDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Please provide valid id");
  }

  const paymentProofDetail = await PaymentProof.findById(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paymentProofDetail,
        "payment details fetch successfully"
      )
    );
});

const updateProofStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, status } = req.body;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Id formate");
  }
  if (!amount || !status) {
    throw new ApiError(400, " please provide amount & Status");
  }

  const proof = await PaymentProof.findById(id);

  if (!proof) {
    throw new ApiError(404, "Payment Proof not found");
  }

  const updatedProof = await PaymentProof.findByIdAndUpdate(
    proof?._id,
    {
      $set: {
        status,
        amount,
      },
    },
    { new: true }
  );

  if (!updatedProof) {
    throw new ApiError(400, "Something went wrong while update the proof");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProof,
        "Payment proof amount and status updated."
      )
    );
});

const deletePaymentproof = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Id fromate");
  }

  const isProof = await PaymentProof.findById(id);

  if (!isProof) {
    throw new ApiError(404, "Payment Proof not found");
  }

  const deleteProof = await PaymentProof.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteProof, "Payment Proof deleted successfully")
    );
});

const fetchAllUser = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        role: "$_id.role",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        year: 1,
        month: 1,
      },
    },
  ]);

  const user = users.filter((u) => u.role === "user");
  const auctioneers = users.filter((u) => u.role === "auctioneer");

  const transformDataToMonthlyArray = (data, totalMonth = 12) => {
    const result = Array(totalMonth).fill(0);

    data.forEach((item) => {
      result[item.month - 1] = item.count;
    });

    return result;
  };

  const userArray = transformDataToMonthlyArray(user);
  const auctioneersArray = transformDataToMonthlyArray(auctioneers);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userArray, auctioneersArray },
        "fetch successfully"
      )
    );
});

const monthlyRevenue = asyncHandler(async (req, res) => {
  const payments = await Commission.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.month": 1, "_id.year": 1 },
    },
  ]);

  const transformDataToMonthlyArray = (payment, totalMonth = 12) => {
    const result = Array(totalMonth).fill(0);

    payment.forEach((payment) => {
      result[payment._id.month - 1] = payment.totalAmount;
    });

    return result;
  };

  const totalMonthlyRevenue = transformDataToMonthlyArray(payments);

  res.status(200).
    json(
      new ApiResponse(
        200,
        totalMonthlyRevenue,
        "Monthly revenue fetch successfully"
      )
    );
});

export {
  deleteAuctionItem,
  getAllPaymentProofs,
  getPaymentDetail,
  updateProofStatus,
  deletePaymentproof,
  fetchAllUser,
  monthlyRevenue
};
