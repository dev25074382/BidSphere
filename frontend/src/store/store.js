import { configureStore } from "@reduxjs/toolkit";
import  useReducer from "./slices/userSlice.js";
import commissionReducer from './slices/commissionSlice.js'
import auctionReducer from './slices/auctionSlice.js'
import bidReducer from './slices/bidSlice.js'

export const store = configureStore({
    reducer : {
        user : useReducer,
        commission : commissionReducer,
        auction : auctionReducer,
        bid : bidReducer,
    }
})