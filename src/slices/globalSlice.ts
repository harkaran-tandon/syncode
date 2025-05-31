import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../utils/apiService';

interface GlobalState {
  userInfo: any;
}

const fetchUserInfo = createAsyncThunk('users/fetchUsers', async () => {
  return await apiCall('GET', '/users');
});

const initialState: GlobalState = {
  userInfo: {},
};

const globalSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

export { fetchUserInfo };

export default globalSlice.reducer;
