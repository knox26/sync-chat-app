import axios from "axios";
import { HOST } from "../../utils/constants";

// Create an Axios instance
export const apiClient = axios.create({
  baseURL: HOST,
});

// Function to get the token (replace with your actual implementation)
const getToken = () => {
  return localStorage.getItem("jwtToken"); // Example: Retrieve token from localStorage
};

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
