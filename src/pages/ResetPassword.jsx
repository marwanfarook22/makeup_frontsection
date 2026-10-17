import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useLanguage } from "../context/LanguageState";

export default function ResetPassword() {
  const { t } = useLanguage();
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const resetSchema = z
    .object({
      newPassword: z.string().min(6, t("Password must be at least 6 characters")),
      confirmPassword: z.string().min(1, t("Please confirm your password")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("Passwords do not match"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    mode: "onTouched",
  });
  const newPassword = useWatch({ control, name: "newPassword", defaultValue: "" });

  const onSubmit = async ({ newPassword: password }) => {
    try {
      setIsLoading(true);
      await axiosInstance.put(`/auth/reset-password/${token}`, {
        newPassword: password,
      });
      setIsReset(true);
      toast.success(t("Password has been reset successfully!"));
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("Invalid or expired token"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordInputClass = (hasError) =>
    `min-h-12 w-full rounded-md border bg-white px-4 text-start text-[#1A1A1A] outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#03382E]/10"
    }`;

  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#FBF8F6] px-3 py-10 sm:min-h-[75vh] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -start-28 -top-28 h-72 w-72 rounded-full bg-[#F2E2DD]/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -end-20 h-80 w-80 rounded-full bg-[#E8EDE8]/80 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#EFE6DD] bg-white shadow-[0_24px_70px_-35px_rgba(3,56,46,0.3)]">
        <div className="h-1.5 bg-gradient-to-r from-[#C5A368] via-[#E7CDBD] to-[#03382E]" />
        <div className="p-6 sm:p-10">
          {isReset ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5EF] text-[#03382E]">
                <CheckCircle2 size={30} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D45]">
                {t("All set")}
              </p>
              <h1 className="mb-3 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
                {t("Your password has been updated")}
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">
                {t("Use your new password the next time you sign in.")}
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A368]"
              >
                {t("Continue to Login")}
                <ArrowLeft size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EFEB] text-[#8C5D4B]">
                <LockKeyhole size={25} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D45]">
                {t("Account recovery")}
              </p>
              <h1 className="mb-3 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
                {t("Create a new password")}
              </h1>
              <p className="mb-7 max-w-md text-sm leading-6 text-gray-500">
                {t("Choose a password you haven’t used before. It must be at least 6 characters.")}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-[#333]">
                    {t("New Password")}
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("newPassword")}
                      aria-invalid={Boolean(errors.newPassword)}
                      aria-describedby={errors.newPassword ? "new-password-error" : "password-hint"}
                      className={`${passwordInputClass(Boolean(errors.newPassword))} pe-12`}
                      placeholder={t("Enter new password")}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                      className="absolute inset-y-0 end-0 inline-flex w-12 items-center justify-center text-gray-400 transition hover:text-[#03382E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A368]"
                      aria-label={isPasswordVisible ? t("Hide password") : t("Show password")}
                      aria-pressed={isPasswordVisible}
                    >
                      {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword ? (
                    <p id="new-password-error" role="alert" className="mt-2 text-xs text-red-600">
                      {errors.newPassword.message}
                    </p>
                  ) : (
                    <p id="password-hint" className="mt-2 text-xs text-gray-500">
                      {t("Use at least 6 characters.")}
                    </p>
                  )}
                  <p className={`mt-2 text-xs ${newPassword.length >= 6 ? "text-[#28704D]" : "text-gray-400"}`}>
                    {newPassword.length >= 6 ? "✓ " : "○ "}
                    {t("At least 6 characters")}
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#333]">
                    {t("Confirm New Password")}
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={isConfirmVisible ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                      className={`${passwordInputClass(Boolean(errors.confirmPassword))} pe-12`}
                      placeholder={t("Re-enter your new password")}
                    />
                    <button
                      type="button"
                      onClick={() => setIsConfirmVisible((visible) => !visible)}
                      className="absolute inset-y-0 end-0 inline-flex w-12 items-center justify-center text-gray-400 transition hover:text-[#03382E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A368]"
                      aria-label={isConfirmVisible ? t("Hide password") : t("Show password")}
                      aria-pressed={isConfirmVisible}
                    >
                      {isConfirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" role="alert" className="mt-2 text-xs text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A368] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t("Saving...")}
                    </>
                  ) : (
                    t("Save New Password")
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 border-t border-[#F0EBE7] pt-5 text-start">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A17D45]" aria-hidden="true" />
                <p className="text-xs leading-5 text-gray-500">
                  {t("Your reset link is private and expires after 15 minutes.")}
                </p>
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#03382E] transition hover:text-[#A17D45]"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  {t("Request a new reset link")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
