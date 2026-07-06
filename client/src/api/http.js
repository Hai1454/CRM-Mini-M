import axios from "axios";

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:4000/api`;

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
