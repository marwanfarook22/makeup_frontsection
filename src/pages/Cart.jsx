import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuthStore } from "../store/useAuthStore";

const ADMIN_PHONE = "201020483849";

const paymentLabels = {
  cod: "الدفع عند الاستلام (Cash on Delivery)",
  instapay: "إنستا باي (InstaPay)",
  wallet: "محفظة إلكترونية (E-Wallet)",
};

const getItemPrice = (product) =>
  product.salesPrice > 0 && product.salesPrice < product.price
    ? product.salesPrice
    : product.price;

function sendOrderToWhatsApp(bill) {
  const itemsList = bill.items
    .map(
      (item, index) =>
        `${index + 1}. *${item.name}* (الكمية: ${item.quantity}) - ${
          item.price * item.quantity
        } EGP`,
    )
    .join("\n");

  const message = `مرحباً، أود تأكيد طلبي الجديد من المتجر 🛍️

*رقم الطلب:* #${bill.billNumber}
*الاسم:* ${bill.customerInfo.name}
*رقم الهاتف:* ${bill.customerInfo.phone}${
    bill.customerInfo.secondaryPhone
      ? `\n*رقم إضافي:* ${bill.customerInfo.secondaryPhone}`
      : ""
  }

*📍 عنوان التوصيل:*
${bill.shippingAddress.governorate} - ${bill.shippingAddress.city}
${bill.shippingAddress.detailedAddress}

*📦 المنتجات المطلوبة:*
${itemsList}

*💳 طريقة الدفع:* ${paymentLabels[bill.paymentMethod]}
*💰 الإجمالي المطلوب:* *${bill.totalAmount} EGP*`;

  return `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
}

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    governorate: "",
    city: "",
    detailedAddress: "",
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
      toast.error("يرجى تسجيل الدخول قبل تأكيد الطلب.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("سلة التسوق فارغة.");
      return;
    }

    if (hasUnavailableItems) {
      toast.error("يرجى تعديل كميات المنتجات غير المتوفرة قبل تأكيد الطلب.");
      return;
    }

    if (!user?.phoneNumber) {
      toast.error("يرجى إضافة رقم هاتف إلى حسابك قبل تأكيد الطلب.");
      return;
    }

    const whatsappWindow = window.open("about:blank", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
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
        secondaryPhone: formData.secondaryPhone.trim(),
      });

      const bill = response.data.data;
      if (!bill?.billNumber || !Array.isArray(bill.items)) {
        throw new Error("استُلم رد غير مكتمل من الخادم بعد إنشاء الطلب.");
      }

      clearCart();
      const whatsappUrl = sendOrderToWhatsApp(bill);
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank");
      }
      toast.success(`تم تسجيل طلبك رقم ${bill.billNumber} بنجاح.`);
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "تعذر تسجيل الطلب. يرجى المحاولة مرة أخرى.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C5A368]">
          FACES
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">
          سلة التسوق وإتمام الطلب
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-sm border border-[#EFE6DD] bg-white p-10 text-center shadow-sm">
          <p className="mb-5 text-lg text-gray-600">سلة التسوق فارغة حالياً.</p>
          <Link
            to="/"
            className="inline-block bg-[#03382E] px-6 py-3 font-semibold text-white transition hover:bg-black"
          >
            متابعة التسوق
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4" aria-label="منتجات السلة">
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
                          {price} EGP للقطعة
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product._id)}
                        className="h-fit text-sm font-medium text-[#9B2C2C] hover:underline"
                        aria-label={`حذف ${product.name} من السلة`}
                      >
                        حذف
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
                          aria-label={`تقليل كمية ${product.name}`}
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
                          aria-label={`زيادة كمية ${product.name}`}
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
                        المتاح حالياً: {available}. عدّل الكمية للمتابعة.
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
              إفراغ السلة
            </button>
          </section>

          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-6 border border-[#EFE6DD] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                بيانات التوصيل
              </h2>
              {isAuthenticated ? (
                <p className="mt-2 text-sm text-gray-600">
                  {user?.name} · {user?.phoneNumber}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#9B2C2C]">
                  يجب تسجيل الدخول لإتمام الطلب.{" "}
                  <Link to="/login" className="font-semibold underline">
                    تسجيل الدخول
                  </Link>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-gray-700">
                المحافظة
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
                المدينة / المنطقة
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
                العنوان بالتفصيل
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
                رقم هاتف إضافي (اختياري)
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
              <legend className="font-bold text-[#1A1A1A]">طريقة الدفع</legend>
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
                  {label}
                </label>
              ))}
            </fieldset>

            <div className="border-t border-[#EFE6DD] pt-4">
              <div className="flex justify-between text-lg font-bold text-[#03382E]">
                <span>الإجمالي</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                تكلفة التوصيل، إن وجدت، يتم تأكيدها عبر واتساب.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !isAuthenticated ||
                hasUnavailableItems ||
                !user?.phoneNumber
              }
              className="w-full bg-[#03382E] px-5 py-3.5 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "جارٍ تسجيل الطلب..." : "تأكيد الطلب عبر واتساب"}
            </button>
            {isAuthenticated && !user?.phoneNumber && (
              <p className="text-sm text-[#9B2C2C]">
                أضف رقم هاتفك من{" "}
                <Link to="/profile" className="font-semibold underline">
                  صفحة الملف الشخصي
                </Link>{" "}
                قبل تأكيد الطلب.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}