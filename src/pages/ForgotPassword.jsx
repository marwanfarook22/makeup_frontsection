import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import * as z from "zod";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useLanguage } from "../context/LanguageState";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const forgotSchema = z.object({
    email: z.string().trim().min(1, t("Email is required")).email(t("Invalid email address")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async ({ email }) => {
    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/forgot-password", { email });
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
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#FBF8F6] px-3 py-10 sm:min-h-[75vh] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -start-28 -top-28 h-72 w-72 rounded-full bg-[#F2E2DD]/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -end-20 h-80 w-80 rounded-full bg-[#E8EDE8]/80 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#EFE6DD] bg-white shadow-[0_24px_70px_-35px_rgba(3,56,46,0.3)]">
        <div className="h-1.5 bg-gradient-to-r from-[#C5A368] via-[#E7CDBD] to-[#03382E]" />
        <div className="p-6 sm:p-10">
          {isSent ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5EF] text-[#03382E]">
                <CheckCircle2 size={30} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D45]">
                {t("Check your inbox")}
              </p>
              <h1 className="mb-3 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
                {t("Your reset link is on its way")}
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">
                {t("If an account with that email exists, we have sent a reset link to it.")}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                {t("Please check your inbox and spam folder.")}
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A368]"
              >
                <ArrowLeft size={17} aria-hidden="true" />
                {t("Back to Login")}
              </Link>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="mt-4 text-sm font-medium text-[#03382E] underline-offset-4 hover:text-[#A17D45] hover:underline"
              >
                {t("Try another email")}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EFEB] text-[#8C5D4B]">
                <Mail size={25} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D45]">
                {t("Account recovery")}
              </p>
              <h1 className="mb-3 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
                {t("Forgot your password?")}
              </h1>
              <p className="mb-7 max-w-md text-sm leading-6 text-gray-500">
                {t("No worries. Enter the email address linked to your account and we’ll send you a secure reset link.")}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold text-[#333]">
                    {t("Email Address")}
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    {...register("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "recovery-email-error" : undefined}
                    className={`min-h-12 w-full rounded-md border bg-white px-4 text-start text-[#1A1A1A] outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-[#E5E7EB] focus:border-[#03382E] focus:ring-[#03382E]/10"
                    }`}
                    placeholder={t("Enter your email")}
                  />
                  {errors.email && (
                    <p id="recovery-email-error" role="alert" className="mt-2 text-xs text-red-600">
                      {errors.email.message}
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
                      {t("Sending...")}
                    </>
                  ) : (
                    t("Send Reset Link")
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 border-t border-[#F0EBE7] pt-5 text-start">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A17D45]" aria-hidden="true" />
                <p className="text-xs leading-5 text-gray-500">
                  {t("For your security, reset links expire after 15 minutes.")}
                </p>
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#03382E] transition hover:text-[#A17D45]"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  {t("Back to Login")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
