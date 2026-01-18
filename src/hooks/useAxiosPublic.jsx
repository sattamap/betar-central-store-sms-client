import axios from "axios";

const axiosPublic = axios.create({
  baseURL: 'https://betar-central-store-sms-server.onrender.com',
  withCredentials: true,
});

//https://betar-central-store-sms-server.onrender.com


// ✅ Global Response Interceptor for Token Expiry https://betar-central-store-sms-server.onrender.com/
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