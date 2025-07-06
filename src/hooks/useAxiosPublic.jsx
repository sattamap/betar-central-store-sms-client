import axios from "axios";

const axiosPublic = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

// ✅ Global Response Interceptor for Token Expiry
axiosPublic.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.data?.message === 'TokenExpired') {
      alert('Session expired. Logging out.');
      // Optional: Call your logout function here if available
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(err);
  }
);

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;