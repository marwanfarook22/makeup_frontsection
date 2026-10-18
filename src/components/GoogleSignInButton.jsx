import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

export default function GoogleSignInButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const login = useAuthStore((state) => state.login);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  const handleSuccess = async ({ credential }) => {
    if (!credential) {
      toast.error(t("Google sign-in did not return a credential."));
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/google", {
        credential,
      });
      const { token, user } = response.data.data || response.data;
      if (!token || !user) {
        throw new Error("Google sign-in response did not include a user and token.");
      }

      login(user, token);
      toast.success(t("Logged in successfully!"));
      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          t("Google sign-in failed. Please try again."),
      );
    }
  };

  if (!googleClientId) {
    return (
      <p
        role="status"
        className="mt-5 rounded-sm border border-[#EFE6DD] bg-[#FAF8F6] p-4 text-center text-sm text-[#8C5D4B]"
      >
        {t("Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in the frontend environment and restart the app.")}
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-sm border border-[#EFE6DD] bg-[#FAF8F6] p-4">
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-widest text-[#8C5D4B]">
        <span className="h-px flex-1 bg-[#D9D1C7]" />
        <span>{t("OR")}</span>
        <span className="h-px flex-1 bg-[#D9D1C7]" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error(t("Google sign-in failed. Please try again."))}
          theme="outline"
          shape="rectangular"
          size="large"
          text="continue_with"
          width="320"
        />
      </div>
      <p className="mt-3 text-center text-xs text-[#03382E]">
        {t("Secure sign-in with Google")}
      </p>
    </div>
  );
}
