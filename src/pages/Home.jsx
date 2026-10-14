import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";

// 1. مكون كارت المنتج المستقل (لإدارة حركة الصور المنفصلة لكل منتج)
const ProductCard = ({ product, variant = "grid" }) => {
  const allImages = [product.primaryImageUrl, ...(product.imagesList || [])];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // الرابط المؤدي لصفحة تفاصيل المنتج (باستخدام الـ slug أو الـ _id)
  const productUrl = `/product/${product.slug || product._id}`;

  useEffect(() => {
    let interval;
    if (isHovered && allImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImgIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 900);
    }

    return () => clearInterval(interval);
  }, [isHovered, allImages.length]);

  // تصميم كارت السلايدر (المنتجات المميزة)
  if (variant === "slider") {
    return (
      <Link
        to={productUrl}
        onMouseEnter={() => {
          setIsHovered(true);
          if (allImages.length > 1) {
            setCurrentImgIndex(1 % allImages.length);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setCurrentImgIndex(0);
        }}
        className="min-w-[280px] sm:min-w-[320px] h-[220px] snap-center relative rounded-sm overflow-hidden shadow-sm flex-shrink-0 group cursor-pointer block"
      >
        <img
          src={allImages[currentImgIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

        <span className="absolute top-4 left-4 bg-[#F5EBE6] text-[#1A1A1A] text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-sm z-10">
          ⭐ Featured
        </span>

        <div className="absolute bottom-0 left-0 p-5 w-full pointer-events-none">
          <h3 className="text-xl font-bold text-white mb-1 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            {product.salesPrice > 0 && product.salesPrice < product.price ? (
              <>
                <span className="text-lg font-bold text-[#E63946]">
                  ${product.salesPrice}
                </span>
                <span className="text-sm text-gray-300 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-white">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // تصميم الكارت العادي (شبكة المنتجات)
  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        if (allImages.length > 1) {
          setCurrentImgIndex(1 % allImages.length);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImgIndex(0);
      }}
      className="bg-white rounded-sm shadow-sm border border-[#EFE6DD] overflow-hidden hover:shadow-md transition duration-300 flex flex-col relative"
    >
      {product.isFeatured && (
        <span className="absolute top-3 left-3 z-10 bg-[#F5EBE6] text-[#1A1A1A] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm pointer-events-none">
          ⭐ Featured
        </span>
      )}

      {product.salesPrice > 0 && product.salesPrice < product.price && (
        <span className="absolute top-3 right-3 z-10 bg-[#E63946] text-white text-xs font-semibold px-2 py-1 rounded-sm pointer-events-none">
          Sale
        </span>
      )}

      {/* الضغط على الصورة ينقل لصفحة تفاصيل المنتج */}
      <Link
        to={productUrl}
        className="relative h-52 bg-white flex items-center justify-center overflow-hidden block"
      >
        <img
          src={allImages[currentImgIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
        />

        {isHovered && allImages.length > 1 && (
          <div className="absolute bottom-2 flex gap-1 z-10">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full ${
                  idx === currentImgIndex ? "bg-[#C5A368] w-3" : "bg-gray-300"
                } transition-all duration-300`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          {product.category?.name}
        </span>

        {/* الضغط على اسم المنتج ينقل لصفحة تفاصيل المنتج */}
        <Link to={productUrl}>
          <h3 className="text-md font-bold text-[#1A1A1A] hover:text-[#03382E] transition mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#EFE6DD]">
          <div>
            {product.salesPrice > 0 && product.salesPrice < product.price ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#E63946]">
                  ${product.salesPrice}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#1A1A1A]">
                ${product.price}
              </span>
            )}
          </div>

          <button
            type="button"
            className="bg-white border border-[#EFE6DD] text-[#1A1A1A] hover:bg-[#03382E] hover:text-white p-2.5 rounded-sm transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/categories"),
        ]);

        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category?._id === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query.trim() === "" ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(
    (product) => product.isFeatured === true,
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white p-4 rounded-sm shadow-sm border border-[#EFE6DD]">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Search</h3>
              <input
                type="text"
                placeholder="ابحث هنا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-[#E5E7EB] placeholder:text-gray-500 focus:outline-none focus:border-[#03382E] focus:ring-2 focus:ring-[#C5A368] text-sm text-[#1A1A1A] bg-white"
                dir="auto"
              />
            </div>

            <div className="bg-white p-4 rounded-sm shadow-sm border border-[#EFE6DD] hidden md:block">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 border-b border-[#EFE6DD] pb-2">
                Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full text-left px-4 py-2.5 rounded-sm transition font-medium text-sm ${
                      selectedCategory === "All"
                        ? "bg-[#03382E] text-white"
                        : "text-gray-500 hover:bg-[#F5EBE6]"
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`w-full text-left px-4 py-2.5 rounded-sm transition font-medium text-sm ${
                        selectedCategory === cat._id
                          ? "bg-[#03382E] text-white"
                          : "text-gray-500 hover:bg-[#F5EBE6]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                  selectedCategory === "All"
                    ? "bg-[#03382E] text-white"
                    : "bg-white border border-[#EFE6DD] text-gray-500"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedCategory === cat._id
                      ? "bg-[#03382E] text-white"
                      : "bg-white border border-[#EFE6DD] text-gray-500"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          {featuredProducts.length > 0 &&
            searchQuery === "" &&
            selectedCategory === "All" && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                  <span>🔥</span> Top Featured
                </h2>
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      variant="slider"
                    />
                  ))}
                </div>
              </div>
            )}

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
              {selectedCategory === "All"
                ? "All Products"
                : categories.find(
                    (category) => category._id === selectedCategory,
                  )?.name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredProducts.length} items)
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin h-10 w-10 border-4 border-[#03382E] border-t-transparent rounded-full"></span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[#EFE6DD] rounded-sm">
              <p className="text-xl text-gray-500">
                لا توجد منتجات مطابقة لبحثك.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
