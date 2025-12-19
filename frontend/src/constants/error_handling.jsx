import { toast } from 'react-toastify';

export const httpErrorHandle = ({ response, onSuccess }) => {
  switch (response?.status) {
    case 200:
      onSuccess();
      break;

    case 400:
      toast.error(response.data.msg || 'Bad Request');
      break;

    case 401:
      toast.error('Unauthorized - Please login again');
      // Có thể thêm logic để logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;

    case 403:
      toast.error('Forbidden - You do not have permission');
      break;

    case 404:
      toast.error('Resource not found');
      break;

    case 500:
      toast.error(response.data.error || 'Internal Server Error');
      break;

    default:
      toast.error('Something went wrong');
      break;
  }
};

// Axios interceptor để xử lý lỗi tự động
export const setupAxiosInterceptors = (api) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        httpErrorHandle({
          response: error.response,
          onSuccess: () => {} // Empty function since it's an error
        });
      } else if (error.request) {
        toast.error('No response from server');
      } else {
        toast.error('Error setting up request');
      }
      return Promise.reject(error);
    }
  );
};