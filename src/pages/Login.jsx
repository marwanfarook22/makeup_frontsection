import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const loginSchema = z.object({
    email: z.string().min(1, t("Email is required")).email(t("Invalid email address")),
    password: z.string().min(6, t("Password must be at least 6 characters")),
  });

  // 2. إعداد React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. دالة إرسال البيانات للباك إند
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // إرسال الطلب للـ API الخاص بك
      const response = await axiosInstance.post("/auth/login", data);
      console.log("Login API Response:", response.data);

      // استخراج التوكن وبيانات المستخدم من الرد (تأكد من مطابقتها لأسماء الحقول في الباك إند)
      const { token, user } = response.data.data || response.data;

      if (!token || !user) {
        throw new Error("Login response did not include a user and token.");
      }

      // حفظ البيانات في Zustand و LocalStorage
      login(user, token);

      toast.success(t("Logged in successfully!"));

      // توجيه المستخدم للصفحة الرئيسية
      navigate("/");
    } catch (error) {
      // إظهار رسالة الخطأ القادمة من الباك إند أو رسالة عامة
      const errorMessage =
        error.response?.data?.message || t("Login failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#1A1A1A] mb-6">
          {t("Login to Your Account")}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* حقل الإيميل */}
          <div>
            <label className="block text-gray-500 text-sm font-bold mb-2">
              {t("Email Address")}
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#C5A368]"
              }`}
              placeholder={t("Enter your email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* حقل الباسورد */}
          <div>
            <label className="block text-gray-500 text-sm font-bold mb-2">
              {t("Password")}
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#C5A368]"
              }`}
              placeholder={t("Enter your password")}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#03382E] hover:bg-[#022D25] text-white font-semibold py-2 px-4 rounded-sm transition disabled:bg-gray-400 flex justify-center"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              t("Login")
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">{t("Don't have an account? ")}</span>
          <Link to="/register" className="font-semibold text-[#03382E] hover:text-[#C5A368] hover:underline">
            {t("Sign up")}
          </Link>
        </div>

        {/* رابط افتراضي لاستعادة كلمة المرور (سنبرمجه لاحقاً) */}
        <div className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-gray-500 hover:text-[#03382E] hover:underline">
            {t("Forgot your password?")}
          </Link>
        </div>
      </div>
    </div>
  );
}
