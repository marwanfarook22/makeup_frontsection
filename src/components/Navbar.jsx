import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageState";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-[#03382E] px-3 py-3 text-white shadow-sm sm:p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="shrink-0 text-xl font-bold tracking-[0.12em] text-white sm:text-2xl sm:tracking-[0.2em]">
          SheGlam
        </Link>

        {/* Navigation Links */}
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
          {isAuthenticated && (
            <Link
              to="/cart"
              className="flex items-center gap-1.5 text-sm text-white/90 sm:gap-2 sm:text-base"
              aria-label={`${t("Shopping bag")}: ${cartCount} ${t("items")}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14l1 13H4L5 8zm4 0a3 3 0 016 0"
                />
              </svg>
              <span>{t("Bag")} ({cartCount})</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="rounded-sm border border-white/40 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-3 sm:py-2"
            aria-label={`${t("Language:")} ${language === "en" ? t("Arabic") : t("English")}`}
          >
            {language === "en" ? "العربية" : "English"}
          </button>
          {isAuthenticated ? (
            <>
              {user?.profileImage && (
                <img
                  src={user.profileImage}
                  alt={t("Profile")}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="hidden max-w-36 truncate font-medium text-white/90 sm:inline">
                {t("Welcome,")} {user?.name?.split(" ")[0]}
              </span>

              {user?.role === "moderator" && (
                <Link
                  to="/dashboard"
                  className="text-white/80 hover:text-[#C5A368] font-semibold"
                >
                  {t("Dashboard")}
                </Link>
              )}

              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
                  {t("Account")}
                  <span
                    aria-hidden="true"
                    className="text-xs transition-transform group-open:rotate-180"
                  >
                    ▼
                  </span>
                </summary>
                <div className="absolute end-0 z-20 mt-3 min-w-40 rounded-sm border border-[#EFE6DD] bg-white py-1 text-[#1A1A1A] shadow-lg">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-[#F5EBE6]"
                  >
                    {t("Profile")}
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm hover:bg-[#F5EBE6]"
                  >
                    {t("My Orders")}
                  </Link>
                </div>
              </details>
              <button
                onClick={handleLogout}
                className="rounded-sm bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/20 sm:px-4 sm:py-2 sm:text-base"
              >
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-white/80 hover:text-white sm:text-base"
              >
                {t("Login")}
              </Link>
              <Link
                to="/register"
                className="rounded-sm bg-white px-3 py-1.5 text-sm font-semibold text-[#03382E] transition hover:bg-[#F5EBE6] sm:px-4 sm:py-2 sm:text-base"
              >
                {t("Sign Up")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
