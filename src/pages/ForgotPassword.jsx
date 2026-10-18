import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useLanguage } from "../context/LanguageState";

const inputClass =
  "min-h-12 w-full rounded-md border border-[#E5E7EB] bg-white px-4 text-start text-[#1A1A1A] outline-none transition placeholder:text-gray-400 focus:border-[#03382E] focus:ring-2 focus:ring-[#03382E]/10";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async (isResend = false) => {
    if (!identifier.trim()) {
      toast.error(t("Enter the phone number or email linked to your account."));
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/forgot-password", {
        identifier: identifier.trim(),
      });
      setOtp("");
      setStep(2);
      toast.success(
        t(
          isResend
            ? "A new verification code was sent if the account is eligible."
            : "If an eligible account exists, a verification code was sent.",
        ),
      );
    } catch (error) {
      if (error.response?.data?.code === "GOOGLE_ACCOUNT") {
        toast.error(
          t("Password reset is not available for this account. Please sign in with Google."),
        );
        return;
      }
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          t("Failed to send the verification code."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error(t("Enter the 6-digit verification code."));
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/verify-reset-otp", {
        identifier: identifier.trim(),
        otp,
      });
      setStep(3);
      toast.success(t("Verification code confirmed."));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          t("The verification code is invalid or has expired."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t("Password must be at least 6 characters"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("Passwords do not match"));
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/reset-password", {
        identifier: identifier.trim(),
        otp,
        newPassword,
      });
      toast.success(t("Password has been reset successfully!"));
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          t("The verification code is invalid or has expired."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = [
    t("Enter your account details"),
    t("Verify your WhatsApp code"),
    t("Create a new password"),
  ];
  const StepIcon = step === 1 ? Mail : step === 2 ? ShieldCheck : LockKeyhole;

  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#FBF8F6] px-3 py-10 sm:min-h-[75vh] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-s-28 -top-28 h-72 w-72 rounded-full bg-[#F2E2DD]/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -inset-e-20 h-80 w-80 rounded-full bg-[#E8EDE8]/80 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#EFE6DD] bg-white shadow-[0_24px_70px_-35px_rgba(3,56,46,0.3)]">
        <div className="h-1.5 bg-linear-to-r from-[#C5A368] via-[#E7CDBD] to-[#03382E]" />
        <div className="p-6 sm:p-10">
          <div className="mb-7 flex items-center justify-center gap-2" aria-label={t("Recovery steps")}>
            {[1, 2, 3].map((stepNumber) => (
              <span
                key={stepNumber}
                className={`h-1.5 flex-1 rounded-full ${
                  stepNumber <= step ? "bg-[#03382E]" : "bg-[#EFE6DD]"
                }`}
              />
            ))}
          </div>

          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EFEB] text-[#8C5D4B]">
            {step === 3 ? (
              <CheckCircle2 size={25} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <StepIcon size={25} strokeWidth={1.7} aria-hidden="true" />
            )}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D45]">
            {t("Account recovery")} · {t("Step {number} of 3").replace("{number}", String(step))}
          </p>
          <h1 className="mb-3 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
            {stepTitles[step - 1]}
          </h1>

          {step === 1 && (
            <>
              <p className="mb-7 max-w-md text-sm leading-6 text-gray-500">
                {t("Enter the phone number saved to your account or its email address. We will send a verification code through WhatsApp.")}
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  requestOtp();
                }}
                className="space-y-5"
                noValidate
              >
                <label htmlFor="recovery-identifier" className="mb-2 block text-sm font-semibold text-[#333]">
                  {t("Phone number or email")}
                </label>
                <input
                  id="recovery-identifier"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className={inputClass}
                  placeholder={t("Enter your phone number or email")}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] focus-visible:ring-2 focus-visible:ring-[#C5A368] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t("Sending...") : t("Send verification code via WhatsApp")}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mb-7 max-w-md text-sm leading-6 text-gray-500">
                {t("Enter the 6-digit code sent to the WhatsApp number linked to this account. The code expires in 10 minutes.")}
              </p>
              <form onSubmit={verifyOtp} className="space-y-5" noValidate>
                <label htmlFor="recovery-otp" className="mb-2 block text-sm font-semibold text-[#333]">
                  {t("6-digit verification code")}
                </label>
                <input
                  id="recovery-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`${inputClass} text-center text-xl tracking-[0.5em]`}
                  placeholder="000000"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t("Verifying...") : t("Verify code")}
                </button>
              </form>
              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-gray-500 hover:text-[#03382E]"
                >
                  {t("Change phone or email")}
                </button>
                <button
                  type="button"
                  onClick={() => requestOtp(true)}
                  disabled={isLoading}
                  className="font-semibold text-[#03382E] underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {t("Resend code")}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="mb-7 max-w-md text-sm leading-6 text-gray-500">
                {t("Choose a new password for your account.")}
              </p>
              <form onSubmit={resetPassword} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-[#333]">
                    {t("New Password")}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className={inputClass}
                    placeholder={t("Enter new password")}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#333]">
                    {t("Confirm New Password")}
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={inputClass}
                    placeholder={t("Re-enter your new password")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#03382E] px-5 font-semibold text-white transition hover:bg-[#022D25] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t("Saving...") : t("Save new password")}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-4 w-full text-sm font-medium text-[#03382E] hover:underline"
              >
                {t("Back to verification code")}
              </button>
            </>
          )}

          <div className="mt-7 flex items-start gap-3 border-t border-[#F0EBE7] pt-5 text-start">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A17D45]" aria-hidden="true" />
            <p className="text-xs leading-5 text-gray-500">
              {t("Verification codes expire after 10 minutes. Never share your code with anyone.")}
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
        </div>
      </div>
    </section>
  );
}
