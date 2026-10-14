import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-[#03382E] text-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-[0.2em] text-white">
          FACES
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              {user?.profileImage && (
                <img
                  src={user.profileImage}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-white/90">
                Welcome, {user?.name?.split(" ")[0]}
              </span>

              {user?.role === "Moderator" && (
                <Link
                  to="/dashboard"
                  className="text-white/80 hover:text-[#C5A368] font-semibold"
                >
                  Dashboard
                </Link>
              )}

              <Link to="/profile" className="text-white/80 hover:text-white">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-[#03382E] hover:bg-[#F5EBE6] px-4 py-2 rounded-sm font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
