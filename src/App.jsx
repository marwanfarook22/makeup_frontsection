import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { useLanguage } from "./context/LanguageState";
import { useAuthStore } from "./store/useAuthStore";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProudectDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}

function App() {
  const { language } = useLanguage();

  return (
    <CartProvider>
      <Router>
        <div
          lang={language}
          dir={language === "ar" ? "rtl" : "ltr"}
          className="min-h-screen flex flex-col"
        >
          <Navbar />

          <main className="flex-grow container mx-auto p-2 sm:p-4">
            <Suspense
              fallback={
                <div className="py-20 text-center text-[#03382E]">
                  {language === "ar" ? "جارٍ تحميل الصفحة..." : "Loading page..."}
                </div>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/product/:idOrSlug"
                  element={
                    <RequireAuth>
                      <ProductDetails />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <RequireAuth>
                      <Cart />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <RequireAuth>
                      <MyOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<Navigate to="/forgot-password" replace />}
                />
              </Routes>
            </Suspense>
          </main>
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </Router>
    </CartProvider>
  );
}

export default function AppWithLanguage() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
