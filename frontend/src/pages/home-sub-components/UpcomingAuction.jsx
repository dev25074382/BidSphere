import React from "react";
import { RiAuctionFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const UpcomingAuctions = () => {
  const { allAuctions } = useSelector((state) => state.auction);

  const today = new Date();
  const todayString = today.toDateString();

  const auctionsStartingToday = allAuctions.filter((item) => {
    const auctionDate = new Date(item.startTime);
    return auctionDate.toDateString() === todayString;
  });

  return (
    <>
      <section className="my-8">
      <h3 className="text-[#111] text-xl font-semibold mb-4 min-[480px]:text-2xl md:text-3xl lg:text-4xl tracking-wide">
        Auctions For Today
      </h3>

      <div className="flex flex-wrap gap-6">
        {/* Highlight Box */}
        <div className="bg-[#161613] w-full p-4 lg:p-6 rounded-lg flex flex-col justify-between shadow-lg">
          <span className="rounded-full bg-[#fdba88] text-white w-fit p-3">
            <RiAuctionFill size={24} />
          </span>
          <div>
            <h3 className="text-[#fdba88] text-2xl font-semibold">Auctions</h3>
            <h3 className="text-white text-2xl font-semibold">Today</h3>
          </div>
        </div>

        {/* Auction Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {auctionsStartingToday.slice(0, 6).map((element) => (
            <Link
              to={`/auction/item/${element._id}`}
              key={element._id}
              className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <img
                  src={element.image}
                  alt={element.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <p className="text-[#111] text-lg font-medium">{element.title}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-stone-600 font-semibold">Starting Bid:</p>
                <p className="text-[#fdba88] font-semibold">Rs. {element.startingBid}</p>
              </div>

              <div>
                <p className="text-stone-600 font-bold">Starting Time:</p>
                <p className="text-black text-sm">{element.startTime}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default UpcomingAuctions;