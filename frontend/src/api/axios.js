import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://sabrinaflix.onrender.com/api"
    : "http://172.20.10.5:5000/api",
});

// AUTO ADD TOKEN TO EVERY REQUEST
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
