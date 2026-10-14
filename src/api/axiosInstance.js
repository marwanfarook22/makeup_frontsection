import axios from "axios";

// إنشاء نسخة مخصصة مع الرابط الأساسي للباك إند الخاص بك
const axiosInstance = axios.create({
  baseURL: "http://localhost:5500/api/v1",
});

// Interceptor: يعترض أي طلب قبل خروجه لإرفاق التوكن إذا كان موجوداً
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
