import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const registerSchema = z
    .object({
      name: z.string().trim().min(3, t("Name must be at least 3 characters")),
      email: z.string().min(1, t("Email is required")).email(t("Invalid email address")),
      phoneNumber: z.string().trim().min(8, t("Enter a valid phone number")),
      password: z.string().min(6, t("Password must be at least 6 characters")),
      confirmPassword: z.string().min(1, t("Please confirm your password")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords do not match"),
      path: ["confirmPassword"],
    });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const userData = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      };
      const response = await axiosInstance.post("/auth/signUp", userData);
      const { token, user } = response.data.data || response.data;

      if (!token || !user) {
        throw new Error("Registration response did not include a user and token.");
      }

      const safeUser = { ...user };
      delete safeUser.password;
      delete safeUser.passwordResetToken;
      delete safeUser.passwordResetExpires;
      login(safeUser, token);
      toast.success(t("Account created successfully!"));
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          t("Registration failed. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-sm border border-[#E5E7EB] px-3 py-2.5 focus:border-[#03382E] focus:outline-none focus:ring-2 focus:ring-[#C5A368]";

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-10">
      <div className="w-full max-w-md border border-[#EFE6DD] bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#1A1A1A]">
          {t("Create Your Account")}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {t("Join SheGlam to place and track your orders.")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="register-name"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("Full Name")}
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className={inputClassName}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("Email Address")}
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={inputClassName}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-phone"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("Phone Number")}
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              {...register("phoneNumber")}
              className={inputClassName}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("Password")}
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className={inputClassName}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("Confirm Password")}
            </label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={inputClassName}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center bg-[#03382E] px-4 py-3 font-semibold text-white transition hover:bg-[#022D25] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? t("Creating account...") : t("Create Account")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          {t("Already have an account?")}{" "}
          <Link
            to="/login"
            className="font-semibold text-[#03382E] hover:text-[#C5A368] hover:underline"
          >
            {t("Log in")}
          </Link>
        </p>
      </div>
    </div>
  );
}
