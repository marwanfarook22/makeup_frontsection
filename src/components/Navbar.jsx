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
    navigate("/");
  };

  return (
    <nav className="bg-[#03382E] text-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-[0.2em] text-white">
          SheGlam
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-white/90"
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
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="rounded-sm border border-white/40 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
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
              <span className="font-medium text-white/90">
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
                <div className="absolute right-0 z-20 mt-3 min-w-40 rounded-sm border border-[#EFE6DD] bg-white py-1 text-[#1A1A1A] shadow-lg">
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
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-sm transition"
              >
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white font-medium"
              >
                {t("Login")}
              </Link>
              <Link
                to="/register"
                className="bg-white text-[#03382E] hover:bg-[#F5EBE6] px-4 py-2 rounded-sm font-semibold transition"
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
