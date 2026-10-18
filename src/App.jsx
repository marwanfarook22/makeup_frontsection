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
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProudectDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { useLanguage } from "./context/LanguageState";
import { useAuthStore } from "./store/useAuthStore";

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
                    <Suspense
                      fallback={
                        <div className="py-20 text-center text-[#03382E]">
                          جارٍ تحميل لوحة التحكم...
                        </div>
                      }
                    >
                      <Dashboard />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<Navigate to="/forgot-password" replace />}
              />
            </Routes>
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
