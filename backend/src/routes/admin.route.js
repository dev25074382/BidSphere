import { Router } from "express";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteAuctionItem,
  deletePaymentproof,
  fetchAllUser,
  getAllPaymentProofs,
  getPaymentDetail,
  monthlyRevenue,
  updateProofStatus,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(isAuthorized("admin"));

router.route("/auctionitem/delete/:id").delete(deleteAuctionItem);

router.route("/paymentproofs/getall").get(getAllPaymentProofs);

router.route("/paymentproof/:id").get(getPaymentDetail);

router.route("/paymentproof/status/update/:id").put(updateProofStatus);

router.route("/paymentproof/delete/:id").delete(deletePaymentproof);

router.route("/user/getall").get(fetchAllUser);
router.route("/monthlyincome").get(monthlyRevenue);

export default router;
