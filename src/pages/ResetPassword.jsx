import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useLanguage } from "../context/LanguageState";

export default function ResetPassword() {
  const { t } = useLanguage();
  const { token } = useParams(); // التقاط التوكن من رابط الصفحة
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const resetSchema = z.object({
    newPassword: z.string().min(6, t("Password must be at least 6 characters")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // إرسال كلمة المرور الجديدة مع التوكن في مسار الـ API
      await axiosInstance.put(`/auth/reset-password/${token}`, {
        newPassword: data.newPassword,
      });

      toast.success(t("Password has been reset successfully!"));
      navigate("/login"); // توجيه لصفحة تسجيل الدخول
    } catch (error) {
      toast.error(error.response?.data?.message || t("Invalid or expired token"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#1A1A1A] mb-6">
          {t("Create New Password")}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-500 text-sm font-bold mb-2">
              {t("New Password")}
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-500 focus:ring-red-200"
                  : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#C5A368]"
              }`}
              placeholder={t("Enter new password")}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#03382E] hover:bg-[#022D25] text-white font-semibold py-2 px-4 rounded-sm transition disabled:bg-gray-400 flex justify-center"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              t("Save New Password")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
