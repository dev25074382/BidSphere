import React, { useState,useEffect } from "react";
import { RiAuctionFill } from "react-icons/ri";
import { MdLeaderboard, MdDashboard } from "react-icons/md";
import { SiGooglesearchconsole } from "react-icons/si";
import { BsFillInfoSquareFill } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdCloseCircleOutline, IoIosCreate } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/userSlice";
import { Link } from "react-router-dom";

const SideDrawer = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch(logout);



  const handleLogout = () => {  
    dispatch(logout());
  };

  return (
    <>
      <div
        onClick={() => setShow(!show)}
        className="fixed right-5 top-5 bg-[#D6482B] text-white text-3xl p-2 rounded-md hover:bg-[#b8381e] lg:hidden "
      >
        <GiHamburgerMenu />
      </div>

      <div
        className={`w-full sm:w-72 bg-[#f6f4f0] h-full fixed top-0 ${
          show ? "left-0" : "left-[-100%]"
        } transition-all duration-100 p-4 flex flex-col justify-between lg:left-0 border-r-2 border-stone-500`}
      >
        <div className="relative">
          <Link to={"/"}>
            <h4 className="text-2xl font-semibold mb-4">
              Bid<span className="text-[#d6482b]">Sphere</span>
            </h4>
          </Link>

          <ul className="flex flex-col gap-3">
            <li>
              <Link
                to={"/auctions"}
                className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
              >
                <RiAuctionFill /> Auction
              </Link>
            </li>

            <li>
              <Link
                to={"/leaderboard"}
                className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
              >
                <MdLeaderboard /> Leaderboard
              </Link>
            </li>
            {console.log(isAuthenticated)}
            {console.log(user)}
            {console.log(user?.role)}

            {isAuthenticated && user && user.role === "auctioneer" && (
              <>
                <li>
                  <Link
                    to={"/sumbit-commission"}
                    className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
                  >
                    <FaFileInvoiceDollar /> Submit Commission
                  </Link>
                </li>

                <li>
                  <Link
                    to={"/create-auction"}
                    className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
                  >
                    <IoIosCreate /> Create Auction
                  </Link>
                </li>

                <li>
                  <Link
                    to={"/view-my-auction"}
                    className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
                  >
                    <FaEye /> My Auction
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && user && user.role === "admin" && (
              <>
                <li>
                  <Link
                    to={"/dashboard"}
                    className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
                  >
                    <MdDashboard /> Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!isAuthenticated ? (
            <>
              <div className="my-4 flex gap-2">
                <Link
                  to={"/sign-up"}
                  className="bg-[#d6482b] text-white py-1 px-3  hover:bg-[#682720] font-semibold text-xl hover:transition-all hover:duration-150 flex items-center rounded-md "
                >
                  Sign Up
                </Link>
                <Link
                  to={"/login"}
                  className="text-[#d6482b] bg-transparent border-[#682720] border-2  hover:text-[#682720] hover:transition-all hover:duration-150 font-bold text-xl px-3 py-1 flex items-center rounded-md"
                >
                  Login
                </Link>
              </div>
            </>
          ) : (
            <div className="my-4 flex gap-4 w-fit " onClick={handleLogout}>
              <button className="bg-[#d6482b] text-white py-1 px-3  hover:bg-[#de534c] font-semibold text-xl hover:transition-all hover:duration-150 flex items-center rounded-md ">
                Logout
              </button>
            </div>
          )}
          <hr className="mb-4 border-t-[#d6482b]" />

          <ul className="flex flex-col gap-3">
            <li>
              <Link
                to={"/how-it-works"}
                className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
              >
                <SiGooglesearchconsole /> How it works
              </Link>
            </li>

            <li>
              <Link
                to={"/about-us"}
                className="flex text-xl font-semibold gap-2 items-center hover:text-[#d6482b] hover:transition-all hover:duration-150"
              >
                <BsFillInfoSquareFill /> About us
              </Link>
            </li>
          </ul>

          <IoMdCloseCircleOutline
            onClick={() => setShow((show) => !show)}
            className="absolute top-0 right-4 text-3xl sm:hidden"
          />
        </div>

        <div>
          <div className="flex gap-2 items-center mb-2">
            <Link
              to={"/"}
              className="bg-white text-stone-500 p-2 text-xl rounded-sm hover:text-blue-700"
            >
              <FaFacebook />
            </Link>
            <Link
              to={"/"}
              className="bg-white text-stone-500 p-2 text-xl rounded-sm hover:text-pink-500"
            >
              <RiInstagramFill />
            </Link>
          </div>
          <Link
            to={"/contact"}
            className=" text-stone-500 font-semibold hover:text-[#d6482b] hover:transition-all hover:duration-200"
          >
            Contact Us
          </Link>
          <p className="text-stone-500">&copy; BidSphare, LLC.</p>
          <p className="text-stone-500">
            Degined by{" "}
            <Link
              to={"/"}
              className=" text-stone-500 font-semibold hover:text-[#d6482b] hover:transition-all hover:duration-200"
            >
              Hemil
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
