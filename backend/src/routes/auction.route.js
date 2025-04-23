import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
import { createAuction, getAllItems, getAuctionDetails, getMyAuctionItems, removeFromAuction, republishItem } from '../controllers/auctionItem.controller.js';
import { trackCommissionStatus } from "../middlewares/commission.middleware.js";


const router = Router();


router.route('/').get(getAllItems)

router.use(verifyJWT);
router.route('/create-auction').post(
    isAuthorized("auctioneer"),
    trackCommissionStatus,
    upload.single('image'),
    createAuction
)

router.route('/:id').get(getAuctionDetails)
router.route('/delete/:id').delete(isAuthorized("auctioneer"),removeFromAuction)
router.route('/item/republish/:id').put(isAuthorized("auctioneer"),republishItem)
router.route('/items/my-items').get(isAuthorized("auctioneer"),getMyAuctionItems)



export default router;                                                                                  