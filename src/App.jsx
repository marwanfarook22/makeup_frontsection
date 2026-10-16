import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProudectDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { useLanguage } from "./context/LanguageState";

const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  const { language } = useLanguage();

  return (
    <CartProvider>
      <Router>
        <div lang={language} dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-grow container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:idOrSlug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route
                path="/dashboard"
                element={
                  <Suspense
                    fallback={
                      <div className="py-20 text-center text-[#03382E]">
                        جارٍ تحميل لوحة التحكم...
                      </div>
                    }
                  >
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
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
