import { server } from "@/const";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const commissionSlice =  createSlice({
    name : "commission",
    initialState : {
        loading : false
    },
    reducers : {
        postCommissionProofOfRequest(state,action){
            state.loading = true
        },
        postCommissionProofOfSuccess(state,action){
            state.loading = false
        },
        postCommissionProofOfFailed(state,action){
            state.loading = false
        },
    }
})


export const postCommissionProof = (data) => async (dispatch)=>{
    dispatch(commissionSlice.actions.postCommissionProofOfRequest());
    try {
        const response = await axios.post(
          `${server}/commission/proof`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        dispatch(commissionSlice.actions.postCommissionProofOfSuccess());
        toast.success(response.data.message);
      } catch (error) {
        dispatch(commissionSlice.actions.postCommissionProofOfFailed());
        toast.error(error.response.data.message);
      }

}

export default commissionSlice.reducer;