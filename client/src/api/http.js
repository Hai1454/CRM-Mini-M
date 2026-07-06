import axios from "axios";

const sharedApiUrl = "https://profound-elegance-production-2d5e.up.railway.app/api";
const localApiUrl = `${window.location.protocol}//${window.location.hostname}:4000/api`;
const defaultApiUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? sharedApiUrl
  : localApiUrl;

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
