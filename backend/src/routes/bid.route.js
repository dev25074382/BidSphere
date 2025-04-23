import { Router } from "express";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
import { placeBid } from "../controllers/bid.controller.js";
import { checkAuctionEndTime } from "../middlewares/checkAuctionTime.middleware.js";

const router = Router()

router.route('/place/:id').post(verifyJWT,isAuthorized("user"),checkAuctionEndTime,placeBid)


export default router