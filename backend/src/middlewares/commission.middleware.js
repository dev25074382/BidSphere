import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const trackCommissionStatus = asyncHandler(async (req, _, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (user?.unpaidCommition > 0) {
    throw new ApiError(403, "You have unpaid commission");
  }
  next();
});
