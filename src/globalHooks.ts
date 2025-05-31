import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from './utils/apiService';
import { AppDispatch, RootState } from './store';

export const fetchUserInfo = createAsyncThunk('users/fetchUsers', async () => {
  return await apiCall('GET', 'users');
});

const useFetchUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userInfo = useSelector((state: RootState) => state.globalReducer.userInfo);

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  return userInfo;
};

export { useFetchUser };
