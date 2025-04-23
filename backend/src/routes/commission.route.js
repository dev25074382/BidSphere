import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, isAuthorized } from "../middlewares/auth.middleware.js";
import { proofOfCommission } from "../controllers/commission.controller.js";

const router = Router();

router
  .route("/proof")
  .post(
    verifyJWT,
    isAuthorized("auctioneer"),
    upload.single("proof"),
    proofOfCommission
  );

export default router;
