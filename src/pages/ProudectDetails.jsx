import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // حالات (States) نموذج إضافة التعليق والتقييم الجديد
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/products/${idOrSlug}`);
        const productData = response.data.data;
        setProduct(productData);
        setActiveImage(productData.primaryImageUrl);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load product details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug]);

  // حساب المتوسط الجديد محلياً لتحديث النجوم فوراً عند الإضافة أو الحذف
  const calculateAverageRating = (commentsList) => {
    if (!commentsList || commentsList.length === 0) return 0;
    const total = commentsList.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );
    return Math.round((total / commentsList.length) * 10) / 10;
  };

  // دالة إرسال التعليق والتقييم للباك إند
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return toast.error("يرجى كتابة نص التعليق أولاً");
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(
        `/products/${product._id}/comments`,
        {
          text: commentText.trim(),
          rating,
        },
      );

      const addedComment = response.data.data;
      const updatedComments = [addedComment, ...(product.comments || [])];

      setProduct((prev) => ({
        ...prev,
        comments: updatedComments,
        averageRating: calculateAverageRating(updatedComments),
      }));

      setCommentText("");
      setRating(5);
      toast.success("تمت إضافة تقييمك بنجاح!");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً لإضافة تقييم");
      } else {
        toast.error(
          error.response?.data?.message || "حدث خطأ أثناء إضافة التعليق",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة حذف التعليق
  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/products/comments/${commentId}`);
      const updatedComments = (product.comments || []).filter(
        (c) => c._id !== commentId,
      );

      setProduct((prev) => ({
        ...prev,
        comments: updatedComments,
        averageRating: calculateAverageRating(updatedComments),
      }));

      toast.success("تم حذف التعليق بنجاح");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "غير مصرح لك بحذف هذا التعليق",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="animate-spin h-12 w-12 border-4 border-[#03382E] border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
          المنتج غير موجود
        </h2>
        <Link
          to="/"
          className="inline-block bg-[#03382E] text-white px-6 py-2.5 rounded-sm font-medium hover:bg-black transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  // دمج الصورة الأساسية مع قائمة الصور بدون تكرار الرابط
  const allImages = Array.from(
    new Set(
      [product.primaryImageUrl, ...(product.imagesList || [])].filter(Boolean),
    ),
  );

  const hasDiscount =
    product.salesPrice > 0 && product.salesPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.salesPrice) / product.price) * 100)
    : 0;

  // دالة مساعدة لرسم النجوم
  const renderStars = (starValue) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.round(starValue) ? "text-[#C5A368]" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* شريط المسار (Breadcrumbs) */}
      <nav className="text-sm text-[#6B7280] mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-[#03382E] transition">
          Home
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="text-[#6B7280]">{product.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-[#1A1A1A] font-medium truncate">
          {product.name}
        </span>
      </nav>

      {/* القسم العلوي: معرض الصور وتفاصيل المنتج */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-[#EFE6DD]">
        {/* 1. معرض الصور (7 أعمدة على الشاشات الكبيرة) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* قائمة الصور المصغرة (Thumbnails) - تتغير الصورة بمجرد الوقوف بالماوس */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0 md:pr-1 scrollbar-hide">
            {allImages.map((imgUrl, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveImage(imgUrl)}
                onClick={() => setActiveImage(imgUrl)}
                className={`w-20 h-20 flex-shrink-0 border cursor-pointer overflow-hidden transition-all duration-200 ${
                  activeImage === imgUrl
                    ? "border-2 border-[#03382E] shadow-sm scale-105"
                    : "border-[#EFE6DD] opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* الصورة الرئيسية الكبيرة */}
          <div className="relative flex-grow bg-[#FAF8F6] border border-[#EFE6DD] h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden">
            {product.isFeatured && (
              <span className="absolute top-4 left-4 z-10 bg-[#F5EBE6] text-[#1A1A1A] text-xs font-bold px-3 py-1.5 tracking-wider uppercase">
                ⭐ Featured
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-4 right-4 z-10 bg-[#E63946] text-white text-xs font-bold px-3 py-1.5 uppercase">
                -{discountPercentage}% Sale
              </span>
            )}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain bg-white transition-all duration-300"
            />
          </div>
        </div>

        {/* 2. معلومات المنتج والشراء (5 أعمدة على الشاشات الكبيرة) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* القسم */}
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
            {product.category?.name || "Uncategorized"}
          </span>

          {/* اسم المنتج */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
            {product.name}
          </h1>

          {/* التقييم وعدد المبيعات */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {renderStars(product.averageRating || 0)}
              <span className="text-sm text-[#1A1A1A] font-medium ml-1">
                ({Number(product.averageRating || 0).toFixed(1)})
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-[#6B7280]">
              {product.comments?.length || 0} Reviews
            </span>
            {product.sold > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-[#03382E] font-medium">
                  {product.sold} Sold
                </span>
              </>
            )}
          </div>

          {/* السعر */}
          <div className="mb-6 pb-6 border-b border-[#EFE6DD]">
            {hasDiscount ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#E63946]">
                  {product.salesPrice} EGP
                </span>
                <span className="text-lg text-[#6B7280] line-through">
                  {product.price} EGP
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {product.price} EGP
              </span>
            )}
          </div>

          {/* الوصف */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Description
            </h3>
            <p
              className="text-[#6B7280] leading-relaxed text-sm sm:text-base"
              dir="auto"
            >
              {product.description}
            </p>
          </div>

          {/* حالة المخزون */}
          <div className="mb-6">
            {product.quantityOnHand > 0 ? (
              <div className="flex items-center gap-2 text-sm text-[#03382E] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#03382E]"></span>
                متوفر في المخزون ({product.quantityOnHand} قطعة متاحة)
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-[#E63946] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]"></span>
                نفذت الكمية (Out of Stock)
              </div>
            )}
          </div>

          {/* تحديد الكمية وزر الإضافة للسلة */}
          {product.quantityOnHand > 0 && (
            <div className="flex items-center gap-4 mt-auto pt-4">
              {/* عداد الكمية */}
              <div className="flex items-center border border-[#EFE6DD]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-[#1A1A1A] hover:bg-[#F5EBE6] transition font-bold"
                >
                  -
                </button>
                <span className="px-5 py-3 text-[#1A1A1A] font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.quantityOnHand, q + 1))
                  }
                  className="px-4 py-3 text-[#1A1A1A] hover:bg-[#F5EBE6] transition font-bold"
                >
                  +
                </button>
              </div>

              {/* زر الإضافة للسلة */}
              <button
                type="button"
                onClick={() => {
                  addToCart(product, quantity);
                  toast.success(`Added ${quantity} item(s) to bag!`);
                }}
                className="flex-grow bg-[#03382E] hover:bg-black text-white font-bold py-3.5 px-6 transition duration-300 uppercase tracking-wider text-sm"
              >
                Add to Bag
              </button>
            </div>
          )}
        </div>
      </div>

      {/* القسم السفلي: التعليقات والمراجعات (Reviews & Comments) */}
      <div className="pt-12">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">
          Customer Reviews ({product.comments?.length || 0})
        </h2>

        {/* فورم إضافة تعليق وتقييم جديد */}
        <div className="mb-10 p-6 border border-[#EFE6DD] bg-[#FAF8F6]">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
            أضف تقييمك وتعليقك
          </h3>
          <form onSubmit={handleAddComment} className="space-y-4">
            {/* اختيار النجوم */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                تقييمك للمنتج:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-[#C5A368]"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-xs font-semibold text-[#6B7280] ml-2">
                  ({rating} / 5)
                </span>
              </div>
            </div>

            {/* مربع كتابة النص */}
            <div>
              <textarea
                rows="3"
                placeholder="اكتب رأيك وتجربتك مع المنتج هنا..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border border-[#EFE6DD] bg-white text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#03382E] focus:ring-1 focus:ring-[#C5A368] rounded-sm"
                dir="auto"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#03382E] hover:bg-black disabled:opacity-50 text-white font-bold py-2.5 px-8 transition duration-300 uppercase tracking-wider text-xs rounded-sm"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </form>
        </div>

        {/* عرض التعليقات الحالية */}
        {product.comments && product.comments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.comments.map((comment, idx) => (
              <div
                key={comment._id || idx}
                className="p-6 border border-[#EFE6DD] bg-white flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        comment.user?.profileImage ||
                        "https://via.placeholder.com/40"
                      }
                      alt={comment.user?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-[#EFE6DD]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A1A]">
                        {comment.user?.name || "Anonymous Customer"}
                      </h4>
                      <span className="text-xs text-[#6B7280]">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {renderStars(comment.rating || 5)}
                    </div>
                    {comment._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment._id)}
                        title="حذف التعليق"
                        className="text-gray-400 hover:text-[#E63946] transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <p
                  className="text-[#1A1A1A] text-sm leading-relaxed mt-2"
                  dir="auto"
                >
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 border border-[#EFE6DD] bg-[#FAF8F6] text-center">
            <p className="text-[#6B7280] text-sm">
              لا توجد تعليقات على هذا المنتج حتى الآن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
