import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

const paymentLabels = {
  cod: "Cash on Delivery",
  instapay: "InstaPay",
  wallet: "E-Wallet",
};

const getItemPrice = (product) =>
  product.salesPrice > 0 && product.salesPrice < product.price
    ? product.salesPrice
    : product.price;

export default function Cart() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const savedPhone = user?.phone || user?.phoneNumber || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    governorate: "",
    city: "",
    detailedAddress: "",
    phone: savedPhone,
    secondaryPhone: "",
    paymentMethod: "cod",
  });

  const subtotal = cartItems.reduce(
    (total, item) => total + getItemPrice(item.product) * item.quantity,
    0,
  );
  const hasUnavailableItems = cartItems.some(
    (item) =>
      !Number.isFinite(item.product.quantityOnHand) ||
      item.product.quantityOnHand < item.quantity,
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error(t("Please log in before confirming your order."));
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error(t("Your shopping cart is empty."));
      return;
    }

    if (hasUnavailableItems) {
      toast.error(t("Please adjust unavailable product quantities before confirming your order."));
      return;
    }

    if (!savedPhone && !formData.phone.trim()) {
      toast.error(t("Please enter your phone number to complete your order."));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/bills", {
        shippingAddress: {
          governorate: formData.governorate.trim(),
          city: formData.city.trim(),
          detailedAddress: formData.detailedAddress.trim(),
        },
        items: cartItems.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        paymentMethod: formData.paymentMethod,
        ...(!savedPhone && { phone: formData.phone.trim() }),
        secondaryPhone: formData.secondaryPhone.trim(),
      });

      const bill = response.data.data;
      if (!bill?.billNumber || !Array.isArray(bill.items)) {
        throw new Error(t("The server returned an incomplete response after creating the order."));
      }

      if (!savedPhone) {
        updateUser({
          ...user,
          phone: formData.phone.trim(),
          phoneNumber: formData.phone.trim(),
        });
      }
      clearCart();
      toast.success(
        t(
          response.data.whatsappNotification?.sent
            ? "Your order {number} was placed and sent to WhatsApp for confirmation."
            : "Your order {number} was placed successfully.",
        ).replace(
          "{number}",
          bill.billNumber,
        ),
      );
      if (!response.data.whatsappNotification?.sent) {
        toast.error(
          response.data.whatsappNotification?.message ||
            t("The order was placed, but its WhatsApp confirmation could not be sent."),
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          t("Unable to place the order. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C5A368]">
          SheGlam
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">
          {t("Shopping cart and checkout")}
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-sm border border-[#EFE6DD] bg-white p-10 text-center shadow-sm">
          <p className="mb-5 text-lg text-gray-600">{t("Your shopping cart is currently empty.")}</p>
          <Link
            to="/"
            className="inline-block bg-[#03382E] px-6 py-3 font-semibold text-white transition hover:bg-black"
          >
            {t("Continue shopping")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4" aria-label={t("Cart items")}>
            {cartItems.map(({ product, quantity }) => {
              const available = Number(product.quantityOnHand) || 0;
              const price = getItemPrice(product);

              return (
                <article
                  key={product._id}
                  className="flex gap-4 border border-[#EFE6DD] bg-white p-4 shadow-sm"
                >
                  <img
                    src={product.primaryImageUrl}
                    alt={product.name}
                    className="h-28 w-24 shrink-0 bg-[#F5EBE6] object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-[#1A1A1A]">
                          {product.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {price} EGP {t("per item")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product._id)}
                        className="h-fit text-sm font-medium text-[#9B2C2C] hover:underline"
                        aria-label={`${t("Remove")} ${product.name}`}
                      >
                        {t("Remove")}
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center border border-[#EFE6DD]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              product._id,
                              Math.max(1, quantity - 1),
                            )
                          }
                          disabled={quantity <= 1}
                          className="px-3 py-1.5 font-bold text-[#03382E] disabled:opacity-40"
                          aria-label={`${t("Decrease quantity")} ${product.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-10 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product._id, quantity + 1)
                          }
                          disabled={quantity >= available}
                          className="px-3 py-1.5 font-bold text-[#03382E] disabled:opacity-40"
                          aria-label={`${t("Increase quantity")} ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-[#03382E]">
                        {(price * quantity).toFixed(2)} EGP
                      </span>
                    </div>
                    {quantity > available && (
                      <p className="mt-2 text-sm text-[#9B2C2C]">
                        {t("Available now:")} {available}. {t("Adjust the quantity to continue.")}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-medium text-gray-500 hover:text-[#9B2C2C]"
            >
              {t("Clear cart")}
            </button>
          </section>

          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-6 border border-[#EFE6DD] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                {t("Delivery information")}
              </h2>
              {isAuthenticated ? (
                <p className="mt-2 text-sm text-gray-600">
                  {user?.name}
                  {savedPhone ? ` · ${savedPhone}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#9B2C2C]">
                  {t("You must log in to complete your order.")}{" "}
                  <Link to="/login" className="font-semibold underline">
                    {t("Login")}
                  </Link>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-gray-700">
                {t("Governorate")}
                <input
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                  autoComplete="address-level1"
                  className="w-full border border-[#D9D1C7] px-3 py-2.5 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                {t("City / Area")}
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  autoComplete="address-level2"
                  className="w-full border border-[#D9D1C7] px-3 py-2.5 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                {t("Detailed address")}
                <textarea
                  name="detailedAddress"
                  value={formData.detailedAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  autoComplete="street-address"
                  className="w-full border border-[#D9D1C7] px-3 py-2.5 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                {t("Phone Number")}
                {savedPhone ? (
                  <p className="border border-[#D9D1C7] bg-[#FAF8F6] px-3 py-2.5 text-[#03382E]">
                    {savedPhone}
                  </p>
                ) : (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className="w-full border border-[#D9D1C7] px-3 py-2.5 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none"
                  />
                )}
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                {t("Additional phone number (optional)")}
                <input
                  type="tel"
                  name="secondaryPhone"
                  value={formData.secondaryPhone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full border border-[#D9D1C7] px-3 py-2.5 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none"
                />
              </label>
            </div>

            <fieldset className="space-y-3">
              <legend className="font-bold text-[#1A1A1A]">{t("Payment method")}</legend>
              {Object.entries(paymentLabels).map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={formData.paymentMethod === value}
                    onChange={handleChange}
                    className="accent-[#03382E]"
                  />
                  {t(label)}
                </label>
              ))}
            </fieldset>

            <div className="border-t border-[#EFE6DD] pt-4">
              <div className="flex justify-between text-lg font-bold text-[#03382E]">
                <span>{t("Total")}</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t("Delivery fee, if any, will be confirmed via WhatsApp.")}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !isAuthenticated ||
                hasUnavailableItems
              }
              className="w-full bg-[#03382E] px-5 py-3.5 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t("Submitting order...") : t("Place order")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}