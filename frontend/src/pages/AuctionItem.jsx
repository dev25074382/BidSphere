import Spinner from "@/custom-components/Spinner";
import { getAuctionDetail } from "@/store/slices/auctionSlice";
import { placeBid } from "@/store/slices/bidSlice";
import React, { useEffect, useState } from "react";
import { FaGreaterThan } from "react-icons/fa";
import { RiAuctionFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

const AuctionItem = () => {
  const { id } = useParams();
  const { loading, auctionDetail, auctionBidders } = useSelector(
    (state) => state.auction
  );
  const { isAuthenticated } = useSelector((state) => state.user);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const [amount, setAmount] = useState(0);
  const handleBid = () => {
    const formData = new FormData();
    formData.append("amount", amount);
    dispatch(placeBid(id, formData));
    dispatch(getAuctionDetail(id));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/");
    }
    if (id) {
      dispatch(getAuctionDetail(id));
    }
  }, [isAuthenticated]);
  return (
    <>
      <section className="w-full ml-0 m-0 h-fit px-5 pt-20 lg:pl-[320px] flex flex-col">
        <div className="text-[16px] flex flex-wrap gap-2 items-center">
          <Link
            to="/"
            className="font-semibold transition-all duration-300 hover:text-[#D6482B]"
          >
            Home
          </Link>
          <FaGreaterThan className="text-stone-400" />
          <Link
            to={"/auctions"}
            className="font-semibold transition-all duration-300 hover:text-[#D6482B]"
          >
            Auctions
          </Link>
          <FaGreaterThan className="text-stone-400" />
          <p className="text-stone-600">{auctionDetail.title}</p>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="flex gap-4 flex-col lg:flex-row">
            <div className="flex-1 flex flex-col gap-6 bg-gray-50 p-5 rounded-lg shadow-md">
              {/* Image & Details Section */}
              <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                {/* Auction Item Image */}
                <div className="bg-white w-full lg:w-40 lg:h-40 flex justify-center items-center p-5 rounded-lg shadow-sm border">
                  <img
                    src={auctionDetail.image}
                    alt={auctionDetail.title}
                    className="w-auto h-auto max-h-32 object-cover"
                  />
                </div>

                {/* Auction Item Details */}
                <div className="flex flex-col gap-2 lg:gap-4">
                  <h3 className="text-[#111] font-semibold text-xl min-[480px]:text-2xl md:text-3xl lg:text-4xl">
                    {auctionDetail.title}
                  </h3>
                  <p className="text-lg md:text-xl font-medium">
                    <span className="text-gray-700 font-semibold">
                      Condition:
                    </span>{" "}
                    <span className="text-[#D6482B] font-bold">
                      {auctionDetail.condition}
                    </span>
                  </p>
                  <p className="text-lg md:text-xl font-medium">
                    <span className="text-gray-700 font-semibold">
                      Minimum Bid:
                    </span>{" "}
                    <span className="text-[#D6482B] font-bold">
                      Rs. {auctionDetail.startingBid}
                    </span>
                  </p>
                </div>
              </div>

              {/* Auction Item Description */}
              <div>
                <p className="text-xl font-bold text-gray-800">
                  📌 Auction Item Description
                </p>
                <hr className="my-3 border-t-2 border-gray-300" />
                {auctionDetail.description &&
                  auctionDetail.description
                    .split(". ")
                    .map((element, index) => (
                      <li
                        key={index}
                        className="text-lg text-gray-700 my-2 leading-relaxed"
                      >
                        {element}
                      </li>
                    ))}
              </div>
            </div>

            <div className="flex-1">
  <div className="flex-1">
    <header className="bg-stone-200 py-4 text-xl sm:text-2xl font-semibold px-4 text-center rounded-t-lg">
      🏆 BIDS
    </header>

    <div className="bg-white p-4 min-h-fit lg:min-h-[650px] rounded-b-lg shadow-md">
      {auctionBidders &&
      new Date(auctionDetail.startTime) < Date.now() &&
      new Date(auctionDetail.endTime) > Date.now() ? (
        auctionBidders.length > 0 ? (
          <div className="space-y-4 py-4">
            {auctionBidders.map((element, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm transition hover:shadow-md"
              >
                {/* Profile Image + Name + Email */}
                <div className="flex items-center gap-4">
                  <img
                    src={element.profilePicture}
                    alt={element.username}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-gray-300 shadow-sm"
                  />

                  <div className="text-center sm:text-left">
                    <p className="text-lg font-semibold text-gray-900">
                      {element.username}
                    </p>
                    <p className="text-sm text-gray-500">{element.email}</p>
                  </div>
                </div>

                {/* Bid Amount */}
                <p className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-md shadow-sm">
                  ₹{element.amount}
                </p>

                {/* Position */}
                <p
                  className={`text-lg font-semibold ${
                    index === 0
                      ? "text-green-600 bg-green-100 px-3 py-1 rounded-md"
                      : index === 1
                      ? "text-blue-600 bg-blue-100 px-3 py-1 rounded-md"
                      : index === 2
                      ? "text-yellow-600 bg-yellow-100 px-3 py-1 rounded-md"
                      : "text-gray-600"
                  }`}
                >
                  {index === 0
                    ? "🥇 1st"
                    : index === 1
                    ? "🥈 2nd"
                    : index === 2
                    ? "🥉 3rd"
                    : `${index + 1}th`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No bids for this auction</p>
        )
      ) : Date.now() < new Date(auctionDetail.startTime) ? (
        <img
          src="/notStarted.png"
          alt="not-started"
          className="w-full max-h-[650px] object-cover rounded-lg shadow-md"
        />
      ) : (
        <img
          src="/auctionEnded.png"
          alt="ended"
          className="w-full max-h-[650px] object-cover rounded-lg shadow-md"
        />
      )}
    </div>
  </div>

  {/* Bid Input Section */}
  <div className="bg-[#D6482B] py-4 px-4 flex flex-col sm:flex-row items-center justify-between rounded-lg shadow-md mt-4 gap-4 sm:gap-0">
    {Date.now() >= new Date(auctionDetail.startTime) &&
    Date.now() <= new Date(auctionDetail.endTime) ? (
      <>
        {/* Input & Label */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <p className="text-white text-lg md:text-xl font-semibold text-center sm:text-left">
            💰 Place Your Bid
          </p>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full sm:w-40 bg-white text-black text-lg md:text-xl p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#222] text-center"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          className="p-3 md:p-4 text-white bg-black rounded-full transition-all duration-300 hover:bg-[#222] flex items-center justify-center shadow-md w-full sm:w-auto"
          onClick={handleBid}
        >
          <RiAuctionFill className="text-2xl md:text-3xl" />
        </button>
      </>
    ) : new Date(auctionDetail.startTime) > Date.now() ? (
      <p className="text-white font-semibold text-lg md:text-xl text-center w-full">
        🚀 Auction has not started yet!
      </p>
    ) : (
      <p className="text-white font-semibold text-lg md:text-xl text-center w-full">
        ⏳ Auction has ended!
      </p>
    )}
  </div>
</div>

          </div>
        )}
      </section>
    </>
  );
};

export default AuctionItem;
