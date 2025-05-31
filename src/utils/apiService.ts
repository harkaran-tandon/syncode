import api from './api';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const apiCall = async <T>(
  method: RequestMethod,
  url: string,
  data?: object,
  params?: object
): Promise<T> => {
  try {
    const response = await api({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};