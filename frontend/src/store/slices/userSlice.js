import { server } from "@/const";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    isAuthenticated: false,
    user: {},
    leaderBoard: [],
    error: null,
  },
  reducers: {
    registerRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
    },

    loginRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
    },

    fetchUserRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
    },
    fetchUserSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
    },
    fetchUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
    },

    logoutSuccess(state, action) {
      state.isAuthenticated = false;
      state.user = {};
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
    },
    clearAllErrors(state, action) {
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
      state.leaderBoard = state.leaderBoard;
      state.loading = false;
    },

    fetchLeaderboardRequest(state, action) {
      state.loading = true;
      state.leaderBoard = [];
    },
    fetchLeaderboardSuccess(state, action) {
      state.loading = false;
      
      state.leaderBoard = action.payload;
      console.log(action.payload)
    },
    fetchLeaderboardFailed(state, action) {
      state.loading = false;
      state.leaderBoard = [];
    },
  },
});

export const logout = () => async (dispatch) => {
  try {
    const response = await axios.get(`${server}/users/logout`, {
      withCredentials: true,
    });
    dispatch(userSlice.actions.logoutSuccess());
    toast.success(response.data.message);
  } catch (error) {
    dispatch(userSlice.actions.logoutFailed());
    toast.error(error.response.data.message);
  } finally {
    dispatch(userSlice.actions.clearAllErrors());
  }
};

export const register = (data) => async (dispatch) => {
  dispatch(userSlice.actions.registerRequest());
  try {
    const response = await axios.post(`${server}/users/register`, data, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(userSlice.actions.registerSuccess(response.data));
    toast.success(response.data.message);
  } catch (error) {
    dispatch(userSlice.actions.registerFailed());
    toast.error(error.response.data.message);
  } finally {
    dispatch(userSlice.actions.clearAllErrors());
  }
};

export const login = (data) => async (dispatch) => {
  dispatch(userSlice.actions.loginRequest());
  try {
    const response = await axios.post(`${server}/users/login`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.data);
    dispatch(userSlice.actions.loginSuccess(response.data));
    toast.success(response.data.message);
  } catch (error) {
    dispatch(userSlice.actions.loginFailed());
    toast.error(error.response.data.message);
  } finally {
    dispatch(userSlice.actions.clearAllErrors());
  }
};

export const fetchUser = () => async (dispatch) => {
  dispatch(userSlice.actions.fetchUserRequest());
  try {
    const response = await axios.get(`${server}/users`, {
      withCredentials: true,
    });
    dispatch(userSlice.actions.fetchUserSuccess(response.data));
  } catch (error) {
    dispatch(userSlice.actions.fetchUserFailed());
    console.error(error);
  } finally {
    dispatch(userSlice.actions.clearAllErrors());
  }
};

export const fetchLeaderboard = () => async (dispatch) => {
  dispatch(userSlice.actions.fetchLeaderboardRequest());
  try {
    const response = await axios.get(
      `${server}/users/leaderboard`,
      {
        withCredentials: true,
      }
    );
    console.log(response.data)
    dispatch(
      userSlice.actions.fetchLeaderboardSuccess(response.data.data)
    );
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(userSlice.actions.fetchLeaderboardFailed());
    dispatch(userSlice.actions.clearAllErrors());
    console.error(error);
  }
};
export default userSlice.reducer;
