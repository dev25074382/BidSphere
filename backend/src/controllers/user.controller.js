import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(process.env.ACCESS_TOKEN_SECRTE);
    console.log(process.env.REFRESH_TOKEN_SECRTE);

    const accessToken = user.generateAccessToken();
    const refereshToken = user.generateRefreshToken();

    user.refreshToken = refereshToken;
    await user.save({ validateBeforeSave: false });

    return { refereshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while generating Access and Referesh Token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    throw new ApiError(400, "Please provide a profile picture");
  }

  const profilePicture = req.file;

  const allowedFormate = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormate.includes(profilePicture.mimetype)) {
    throw new ApiError(400, "Please provide a valid image file");
  }

  const {
    username,
    email,
    password,
    fullName,
    phoneNumber,
    address,
    role,
    bankAccountNumber,
    bankAccountName,
    bankName,
    paypalEmail,
  } = req.body;

  if (!username || !email || !password || !fullName) {
    throw new ApiError(400, "Please provide all required fields");
  }

  if (
    role === "Auctioneer" &&
    !bankAccountNumber &&
    !bankAccountName &&
    !bankName
  ) {
    throw new ApiError(400, "Please provide your bank details");
  }

  if (role === "Auctioneer" && !paypalEmail) {
    throw new ApiError(400, "Please provide your paypal email");
  }

  const isUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUser) {
    throw new ApiError(400, "Username or email already taken");
  }

  const profilePictureLocalPath = profilePicture?.path;

  const profilePictureUrl = await uploadOnCloudinary(profilePictureLocalPath);

  if (!profilePictureUrl) {
    throw new ApiError(500, "Failed to upload profile picture");
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    phoneNumber,
    address,
    role,
    profilePicture: profilePictureUrl.secure_url,
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      paypal: {
        paypalEmail,
      },
    },
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  const { refereshToken, accessToken } = await generateAccessAndRefereshToken(
    createdUser._id
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refereshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, accessToken, refereshToken },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please fill the details");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, " Invalid Credentials");
  }

  const isPasswordVaild = user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new ApiError(400, "Invalid Credentials");
  }

  const { refereshToken, accessToken } = await generateAccessAndRefereshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refereshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refereshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refereshToken,
        },
        "User logged in successfully"
      )
    );
});

const getprofile = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken  = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(400, "Unauthorized access");
  }

  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRTE, async (err, decodedToken) => {
    if(err){
      throw new ApiError(400, "Unauthorized access");
    }

    const user = await User.findById(decodedToken?._id);

    if(!user){
      throw new ApiError(400, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(400, "referesh token is expired or used");
    }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { refereshToken, accessToken } = await generateAccessAndRefereshToken(user._id);

    return res.status(200).cookie("accessToken", accessToken, option).cookie("refreshToken", refereshToken, option).json(new ApiResponse(200, {accessToken, refereshToken}, "Access token refreshed successfully"));  
  }); 
});

const fetchLeaderboard = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        moneySpent : { $gt: 0 }
      }
    },
    {
      $sort : {
        moneySpent : -1
      }
    },
    {
      $limit : 10
    }
  ])

  res.status(200).json(new ApiResponse(200, user, "Leaderboard fetched successfully"));
});



export { registerUser, getprofile, loginUser, logout, fetchLeaderboard };
