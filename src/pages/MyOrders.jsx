import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

const orderStatusLabels = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function MyOrders() {
  const { t, language } = useLanguage();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let isActive = true;
    axiosInstance
      .get("/bills")
      .then((response) => {
        if (isActive) setOrders(response.data.data || []);
      })
      .catch((error) => {
        if (isActive) {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load your previous orders. Please try again later.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  return (
    <section className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C5A368]">
          SheGlam
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">{t("My Orders")}</h1>
      </div>

      <div className="rounded-sm border border-[#EFE6DD] bg-white p-6 shadow-sm">
        {!isAuthenticated ? (
          <p className="text-gray-600">
            {t("Log in to view your previous orders.")}{" "}
            <Link to="/login" className="font-semibold text-[#03382E] underline">
              {t("Login")}
            </Link>
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <span
              className="h-8 w-8 animate-spin rounded-full border-4 border-[#03382E] border-t-transparent"
              aria-label={t("Loading orders")}
            />
          </div>
        ) : errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : orders.length === 0 ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-gray-600">{t("No previous orders.")}</p>
            <Link
              to="/"
              className="inline-block bg-[#03382E] px-5 py-2.5 font-semibold text-white transition hover:bg-black"
            >
              {t("Start shopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-sm border border-[#EFE6DD] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#1A1A1A]">
                      طلب #{order.billNumber}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            language === "ar" ? "ar-EG" : "en-US",
                          )
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "on_the_way"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t(orderStatusLabels[order.status] || order.status)}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {(order.items || []).map((item, index) => (
                    <li key={`${order._id}-${item.product || index}`}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#EFE6DD] pt-3 text-sm">
                  <span className="text-gray-600">
                    {order.shippingAddress?.governorate}
                    {order.shippingAddress?.city
                      ? `، ${order.shippingAddress.city}`
                      : ""}
                  </span>
                  <span className="font-bold text-[#03382E]">
                    {Number(order.totalAmount || 0).toFixed(2)} EGP
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
