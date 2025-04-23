import cron from "node-cron";
import { Auction } from "../models/auction.model.js";
import { User } from "../models/user.model.js";
import { Bid } from "../models/bid.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateCommission } from "../controllers/commission.controller.js";
import { sendEmail } from "../utils/sendMail.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();

    const endedAuctions = await Auction.find({
      endTime: { $lt: now },
      commissionCalculated: false,
    });

    for (const auction of endedAuctionCron) {
      try {
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;
        const highestBidder = await Bid.findOne({
          auctionItem: auction._id,
          amount: auction.currentBid,
        });

        const auctioneer = await User.findByIdAndUpdate(
          auction.createdBy,
          {
            $set: {
              unpaidCommission: amount.currentBid,
            },
          },
          { new: true }
        );

        if (highestBidder) {
          auction.highestBidder = highestBidder.bidder;
          await auction.save();
          const bidder = await User.findByIdAndUpdate(
            highestBidder.bidder,
            {
              $inc: {
                moneySpent: highestBidder.amount,
                auctionWon: 1,
              },
            },
            { new: true }
          );

          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc: {
                unpaidCommission: commissionAmount,
              },
            },
            { new: true }
          );

          const subject = `Congratulations! You won the auction for ${auction.title}`;
          const message = `Dear ${bidder.username}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n2.  **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nBidSphere Team`;
          console.log("Sending email to highest bidder")
          sendEmail({email : bidder.email,subject,message })
          console.log("successfully  email sent  to highest bidder")
        }else{
            await auction.save()
        }
      } catch (error) {
        throw new ApiError(400,error.message||"Some error in ended auction cron")
      }
    }
  });
};
