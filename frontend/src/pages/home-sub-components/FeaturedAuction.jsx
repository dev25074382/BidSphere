import Card from "@/custom-components/Card";
import Spinner from "@/custom-components/Spinner";
import React from "react";
import { useSelector } from "react-redux";

const FeaturedAuctions = () => {
  const { allAuctions, loading } = useSelector((state) => state.auction);

  return (
    <section className="my-8">
      <h3 className="text-[#111] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl">
        Featured Auctions
      </h3>

      {/* Show loader when data is being fetched */}
      {loading ? (
        <Spinner/>
      ) : allAuctions.length === 0 ? (
        <p className="text-lg text-gray-500">No auctions available.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {allAuctions.slice(0, 8).map((element) => (
            <Card
              title={element.title}
              imgSrc={element.image}
              startTime={element.startTime}
              endTime={element.endTime}
              startingBid={element.startingBid}
              id={element._id}
              key={element._id}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedAuctions;
