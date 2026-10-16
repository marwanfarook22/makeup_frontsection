import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageState";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.replace("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const languageButton = (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="rounded-sm border border-white/40 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-3 sm:py-2"
      aria-label={`${t("Language:")} ${language === "en" ? t("Arabic") : t("English")}`}
    >
      {language === "en" ? "العربية" : "English"}
    </button>
  );

  return (
    <nav className="bg-[#03382E] px-3 py-3 text-white shadow-sm sm:p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-bold tracking-[0.12em] text-white sm:text-2xl sm:tracking-[0.2em]"
        >
          SheGlam
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
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

          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <>
                {user?.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={t("Profile")}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <span className="max-w-36 truncate font-medium text-white/90">
                  {t("Welcome,")} {user?.name?.split(" ")[0]}
                </span>
                {user?.role === "moderator" && (
                  <Link
                    to="/dashboard"
                    className="font-semibold text-white/80 hover:text-[#C5A368]"
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
                  type="button"
                  onClick={handleLogout}
                  className="rounded-sm bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
                >
                  {t("Logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-white/80 hover:text-white"
                >
                  {t("Login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-sm bg-white px-4 py-2 font-semibold text-[#03382E] transition hover:bg-[#F5EBE6]"
                >
                  {t("Sign Up")}
                </Link>
              </>
            )}
          </div>

          {languageButton}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/40 text-white hover:bg-white/10 md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">
              {isMenuOpen ? t("Close menu") : t("Open menu")}
            </span>
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="flex w-full flex-col border-t border-white/20 pt-2 md:hidden"
          >
            {isAuthenticated ? (
              <>
                <span className="px-3 py-2 text-sm font-medium text-white/70">
                  {t("Welcome,")} {user?.name?.split(" ")[0]}
                </span>
                {user?.role === "moderator" && (
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="rounded px-3 py-2.5 text-white hover:bg-white/10"
                  >
                    {t("Dashboard")}
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="rounded px-3 py-2.5 text-white hover:bg-white/10"
                >
                  {t("Profile")}
                </Link>
                <Link
                  to="/orders"
                  onClick={closeMenu}
                  className="rounded px-3 py-2.5 text-white hover:bg-white/10"
                >
                  {t("My Orders")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded px-3 py-2.5 text-start text-white hover:bg-white/10"
                >
                  {t("Logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded px-3 py-2.5 text-white hover:bg-white/10"
                >
                  {t("Login")}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded px-3 py-2.5 text-white hover:bg-white/10"
                >
                  {t("Sign Up")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
