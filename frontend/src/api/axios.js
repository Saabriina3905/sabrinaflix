import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://sabrinaflix.onrender.com/api"
    : "http://172.20.10.5:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.defaults.withCredentials = true;
// Handle errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.userMessage = "Cannot reach the server. Backend is offline.";
    }
    return Promise.reject(err);
  }
);

export default API;
