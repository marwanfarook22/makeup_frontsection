import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useLanguage } from "../context/LanguageState";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const forgotSchema = z.object({
    email: z.string().min(1, t("Email is required")).email(t("Invalid email address")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // تأكد أن هذا هو مسار الباك إند الصحيح لديك
      await axiosInstance.post("/auth/forgot-password", data);
      setIsSent(true);
      toast.success(t("Password reset link sent to your email!"));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          t("Failed to send reset link"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#1A1A1A] mb-6">
          {t("Reset Password")}
        </h2>

        {isSent ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              {t("If an account with that email exists, we have sent a reset link to it.")}
            </p>
            <p className="text-gray-500 text-sm">
              {t("Please check your inbox and spam folder.")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-gray-500 text-sm mb-4">
              {t("Enter your email address and we will send you a link to reset your password.")}
            </p>
            <div>
              <input
                type="email"
                {...register("email")}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#C5A368]"
                }`}
                placeholder={t("Enter your email address")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
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
                t("Send Reset Link")
              )}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="font-semibold text-[#03382E] hover:text-[#C5A368] hover:underline">
            {t("Back to Login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
