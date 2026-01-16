import axios from "axios";

const api = axios.create({
  baseURL: "http://10.2.70.34:8000/api/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("svo_access");
    if (token && !config.url.includes("auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 🛑 ON AJOUTE CETTE CONDITION :
      // Si l'URL actuelle contient "reset-password", on ne redirige PAS.
      if (!window.location.pathname.includes("reset-password")) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;