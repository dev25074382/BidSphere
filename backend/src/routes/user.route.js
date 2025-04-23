import { Router } from "express";
import { fetchLeaderboard, getprofile, loginUser, logout, registerUser} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("profilePicture"),
    registerUser
);
router.route("/leaderboard").get(fetchLeaderboard)
router.route("/login").post(loginUser)
router.use(verifyJWT);
router.route("/").get(getprofile)
router.route("/logout").get(logout)





export default router;