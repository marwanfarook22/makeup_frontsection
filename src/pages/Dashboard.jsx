import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "users", label: "Users" },
  { id: "orders", label: "Orders" },
];

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "on_the_way", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const blankProduct = {
  name: "",
  description: "",
  price: "",
  salesPrice: "0",
  primaryImageUrl: "",
  imagesList: [],
  quantityOnHand: "0",
  category: "",
  isFeatured: false,
};

const blankUser = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "user",
};

const inputClass =
  "w-full rounded-sm border border-[#D9D1C7] bg-white px-3 py-2 text-[#1A1A1A] focus:border-[#03382E] focus:outline-none";

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-[#03382E]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Panel({ children }) {
  return (
    <div className="rounded-sm border border-[#EFE6DD] bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuthStore();
  const canAccessDashboard = ["admin", "moderator"].includes(user?.role);
  const canManageRoles = user?.role === "moderator";
  const [activeSection, setActiveSection] = useState("overview");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [productForm, setProductForm] = useState(blankProduct);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImageUrl, setAdditionalImageUrl] = useState("");
  const productImageInputRef = useRef(null);
  const additionalImageInputRef = useRef(null);
  const productImagePreviewUrl = useRef("");
  const [editingProductId, setEditingProductId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [userForm, setUserForm] = useState(blankUser);
  const [editingUserId, setEditingUserId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(
    () => () => {
      if (productImagePreviewUrl.current) {
        URL.revokeObjectURL(productImagePreviewUrl.current);
      }
    },
    [],
  );

  const fetchDashboardData = useCallback(
    () =>
      Promise.all([
        axiosInstance.get("/products"),
        axiosInstance.get("/categories"),
        axiosInstance.get("/users"),
        axiosInstance.get("/bills"),
      ]),
    [],
  );

  const loadDashboardData = useCallback(async () => {
    const [productsResponse, categoriesResponse, usersResponse, ordersResponse] =
      await fetchDashboardData();
    setProducts(productsResponse.data.data || []);
    setCategories(categoriesResponse.data.data || []);
    setUsers(usersResponse.data.data || []);
    setOrders(ordersResponse.data.data || []);
  }, [fetchDashboardData]);

  const addAdditionalImageUrl = () => {
    const imageUrl = additionalImageUrl.trim();
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      toast.error(t("Enter a valid image URL."));
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      toast.error(t("Enter a valid image URL."));
      return;
    }
    if (productForm.imagesList.includes(imageUrl)) {
      toast.error(t("This image URL has already been added."));
      return;
    }
    if (productForm.imagesList.length + additionalImageFiles.length >= 10) {
      toast.error(t("You can add up to 10 additional product images."));
      return;
    }

    setProductForm((form) => ({
      ...form,
      imagesList: [...form.imagesList, imageUrl],
    }));
    setAdditionalImageUrl("");
  };

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard) return undefined;

    let isActive = true;

    fetchDashboardData()
      .then(
        ([productsResponse, categoriesResponse, usersResponse, ordersResponse]) => {
          if (!isActive) return;
          setProducts(productsResponse.data.data || []);
          setCategories(categoriesResponse.data.data || []);
          setUsers(usersResponse.data.data || []);
          setOrders(ordersResponse.data.data || []);
        },
      )
      .catch((error) => {
        if (isActive) {
          setLoadError(
            error.response?.data?.message ||
              t("Unable to load dashboard data. Check your account permissions."),
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, canAccessDashboard, fetchDashboardData, t]);

  const counts = useMemo(
    () => ({
      products: products.length,
      categories: categories.length,
      users: users.length,
      orders: orders.length,
    }),
    [products, categories, users, orders],
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canAccessDashboard) return <Navigate to="/" replace />;

  const resetProductForm = () => {
    setProductForm(blankProduct);
    setAdditionalImageUrl("");
    if (productImagePreviewUrl.current) {
      URL.revokeObjectURL(productImagePreviewUrl.current);
      productImagePreviewUrl.current = "";
    }
    setProductImageFile(null);
    setProductImagePreview("");
    setAdditionalImageFiles([]);
    if (productImageInputRef.current) productImageInputRef.current.value = "";
    if (additionalImageInputRef.current) {
      additionalImageInputRef.current.value = "";
    }
    setEditingProductId("");
  };

  const resetUserForm = () => {
    setUserForm(blankUser);
    setEditingUserId("");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("name", productForm.name);
    payload.append("description", productForm.description);
    payload.append("price", productForm.price);
    payload.append("salesPrice", productForm.salesPrice || "0");
    payload.append("quantityOnHand", productForm.quantityOnHand);
    payload.append("category", productForm.category);
    payload.append("isFeatured", String(productForm.isFeatured));
    payload.append("imagesList", JSON.stringify(productForm.imagesList));
    if (productImageFile) {
      payload.append("primaryImage", productImageFile);
    } else if (productForm.primaryImageUrl) {
      payload.append("primaryImageUrl", productForm.primaryImageUrl);
    }
    additionalImageFiles.forEach((file) =>
      payload.append("additionalImages", file),
    );

    try {
      setIsSaving(true);
      if (editingProductId) {
        await axiosInstance.put(`/products/${editingProductId}`, payload);
        toast.success(t("Product updated."));
      } else {
        await axiosInstance.post("/products", payload);
        toast.success(t("Product added."));
      }
      resetProductForm();
      await loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("Unable to save product. Check the details."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const editProduct = (product) => {
    if (productImagePreviewUrl.current) {
      URL.revokeObjectURL(productImagePreviewUrl.current);
      productImagePreviewUrl.current = "";
    }
    setProductImageFile(null);
    setProductImagePreview("");
    setAdditionalImageFiles([]);
    if (productImageInputRef.current) productImageInputRef.current.value = "";
    if (additionalImageInputRef.current) {
      additionalImageInputRef.current.value = "";
    }
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      salesPrice: String(product.salesPrice ?? 0),
      primaryImageUrl: product.primaryImageUrl || "",
      imagesList: product.imagesList || [],
      quantityOnHand: String(product.quantityOnHand ?? 0),
      category: product.category?._id || product.category || "",
      isFeatured: Boolean(product.isFeatured),
    });
    setAdditionalImageUrl("");
    setActiveSection("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(t('Delete product "{name}"?').replace("{name}", product.name))) return;
    try {
      await axiosInstance.delete(`/products/${product._id}`);
      toast.success(t("Product deleted."));
      await loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Unable to delete product."));
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      if (editingCategoryId) {
        await axiosInstance.put(`/categories/${editingCategoryId}`, {
          name: categoryName.trim(),
        });
        toast.success(t("Category updated."));
      } else {
        await axiosInstance.post("/categories", { name: categoryName.trim() });
        toast.success(t("Category added."));
      }
      setCategoryName("");
      setEditingCategoryId("");
      await loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("Unable to save category. Check the name."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (
      !window.confirm(
        t('Delete category "{name}"? Make sure no products are linked to it.').replace("{name}", category.name),
      )
    ) {
      return;
    }
    try {
      await axiosInstance.delete(`/categories/${category._id}`);
      toast.success(t("Category deleted."));
      await loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Unable to delete category."));
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = userForm.email.trim().toLowerCase();
    const existingEmail = users
      .find((account) => account._id === editingUserId)
      ?.email?.toLowerCase();
    if (
      !/^[^\s@]+@gmail\.com$/i.test(normalizedEmail) &&
      normalizedEmail !== existingEmail
    ) {
      toast.error(t("Please use a Gmail address ending in @gmail.com."));
      return;
    }

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      phoneNumber: userForm.phoneNumber.trim(),
    };
    if (canManageRoles) payload.role = userForm.role;

    try {
      setIsSaving(true);
      if (editingUserId) {
        await axiosInstance.put(`/users/${editingUserId}`, payload);
        toast.success(t("User updated."));
      } else {
        payload.password = userForm.password;
        await axiosInstance.post("/users/admin", payload);
        toast.success(t("User added."));
      }
      resetUserForm();
      await loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("Unable to save user. Check the email and phone number."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const editUser = (account) => {
    setEditingUserId(account._id);
    setUserForm({
      name: account.name || "",
      email: account.email || "",
      phoneNumber: account.phoneNumber || "",
      password: "",
      role: account.role || "user",
    });
    setActiveSection("users");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteUser = async (account) => {
    if (
      !window.confirm(
        t("Delete the account for {name}? This action cannot be undone.").replace("{name}", account.name),
      )
    ) {
      return;
    }
    try {
      await axiosInstance.delete(`/users/${account._id}`);
      toast.success(t("User deleted."));
      await loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Unable to delete user."));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axiosInstance.patch(`/bills/${orderId}/status`, { status });
      toast.success(t("Order status updated."));
      await loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Unable to update order status."));
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C5A368]">
            SheGlam
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">
            {t("Dashboard")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("Manage your store, products, customers, and orders.")}
          </p>
        </div>
        <span className="rounded-full bg-[#F5EBE6] px-4 py-2 text-sm font-semibold text-[#03382E]">
          {t("Moderator")}
        </span>
      </div>

      {!isLoading && loadError ? (
        <Panel>
          <p role="alert" className="text-red-700">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-sm bg-[#03382E] px-4 py-2 text-white"
          >
            {t("Retry")}
          </button>
        </Panel>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#03382E] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#EFE6DD] pb-3">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`shrink-0 rounded-sm px-4 py-2 text-sm font-semibold transition ${
                  activeSection === section.id
                    ? "bg-[#03382E] text-white"
                    : "bg-white text-gray-600 hover:bg-[#F5EBE6]"
                }`}
              >
                {t(section.label)}
              </button>
            ))}
          </div>

          {activeSection === "overview" && (
            <div>
              <SectionHeading title={t("Store overview")} />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  [t("Products"), counts.products],
                  [t("Categories"), counts.categories],
                  [t("Users"), counts.users],
                  [t("Orders"), counts.orders],
                ].map(([label, count]) => (
                  <Panel key={label}>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-[#03382E]">
                      {count}
                    </p>
                  </Panel>
                ))}
              </div>
              <Panel>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-[#1A1A1A]">
                      {t("Recent orders")}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("Review orders and update their status in the orders section.")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("orders")}
                    className="bg-[#03382E] px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t("Manage orders")}
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-wrap justify-between gap-2 border-t border-[#EFE6DD] py-3 text-sm"
                    >
                      <span>#{order.billNumber}</span>
                      <span>{order.customerInfo?.name}</span>
                      <span>{Number(order.totalAmount || 0).toFixed(2)} EGP</span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="border-t border-[#EFE6DD] pt-3 text-sm text-gray-500">
                      {t("There are no orders yet.")}
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {activeSection === "products" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_1.2fr]">
              <Panel>
                <SectionHeading
                  title={t(editingProductId ? "Edit product" : "Add product")}
                  subtitle={t("Choose an image from your device to upload to Cloudinary, or enter an image URL.")}
                />
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <Field label={t("Product name")}>
                    <input
                      required
                      className={inputClass}
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm({ ...productForm, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label={t("Description")}>
                    <textarea
                      required
                      rows={3}
                      className={inputClass}
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("Price")}>
                      <input
                        required
                        min="0"
                        step="0.01"
                        type="number"
                        className={inputClass}
                        value={productForm.price}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            price: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label={t("Sale price")}>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        className={inputClass}
                        value={productForm.salesPrice}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            salesPrice: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label={t("Product image from device")}>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required={
                        !editingProductId && !productForm.primaryImageUrl
                      }
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(t("Image size must not exceed 5 MB."));
                          event.target.value = "";
                          return;
                        }
                        if (
                          productImagePreviewUrl.current
                        ) {
                          URL.revokeObjectURL(productImagePreviewUrl.current);
                        }
                        productImagePreviewUrl.current =
                          URL.createObjectURL(file);
                        setProductImagePreview(productImagePreviewUrl.current);
                        setProductImageFile(file);
                        setProductForm({
                          ...productForm,
                          primaryImageUrl: "",
                        });
                      }}
                      className={`${inputClass} file:mr-2 file:cursor-pointer file:border-0 file:bg-[#F5EBE6] file:px-3 file:py-1.5 file:font-semibold file:text-[#03382E]`}
                    />
                    <span className="block text-xs font-normal text-gray-500">
                      {t("JPG, PNG, or WEBP; up to 5 MB.")}
                    </span>
                  </Field>
                  <Field label={t("Or main image URL")}>
                    <input
                      type="url"
                      className={inputClass}
                      value={productForm.primaryImageUrl}
                      onChange={(event) => {
                        if (productImagePreviewUrl.current) {
                          URL.revokeObjectURL(productImagePreviewUrl.current);
                          productImagePreviewUrl.current = "";
                        }
                        setProductImageFile(null);
                        setProductImagePreview("");
                        setAdditionalImageFiles([]);
                        setProductForm({
                          ...productForm,
                          primaryImageUrl: event.target.value,
                        });
                      }}
                    />
                  </Field>
                  {(productImagePreview || productForm.primaryImageUrl) && (
                    <img
                      src={
                        productImagePreview || productForm.primaryImageUrl
                      }
                      alt={t("Product image preview")}
                      className="h-36 w-36 rounded-sm border border-[#EFE6DD] object-cover"
                    />
                  )}
                  <Field label={t("Additional images from device")}>
                    <input
                      ref={additionalImageInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const selectedFiles = Array.from(
                          event.target.files || [],
                        );
                        if (
                          selectedFiles.some(
                            (file) => file.size > 5 * 1024 * 1024,
                          )
                        ) {
                          toast.error(
                            t("Each image must not exceed 5 MB."),
                          );
                          event.target.value = "";
                          return;
                        }
                        if (
                          productForm.imagesList.length +
                            additionalImageFiles.length +
                            selectedFiles.length >
                          10
                        ) {
                          toast.error(
                            t("You can add up to 10 additional product images."),
                          );
                          event.target.value = "";
                          return;
                        }
                        setAdditionalImageFiles((files) => [
                          ...files,
                          ...selectedFiles,
                        ]);
                        event.target.value = "";
                      }}
                      className={`${inputClass} file:mr-2 file:cursor-pointer file:border-0 file:bg-[#F5EBE6] file:px-3 file:py-1.5 file:font-semibold file:text-[#03382E]`}
                    />
                    <span className="block text-xs font-normal text-gray-500">
                      {t("Select multiple images; JPG, PNG, or WEBP, up to 5 MB per image.")}
                    </span>
                  </Field>
                  <Field label={t("Or add an additional image URL")}>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={additionalImageUrl}
                        onChange={(event) =>
                          setAdditionalImageUrl(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addAdditionalImageUrl();
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={addAdditionalImageUrl}
                        disabled={!additionalImageUrl.trim()}
                        className="shrink-0 bg-[#03382E] px-4 py-2 font-semibold text-white disabled:opacity-50"
                      >
                        {t("Add image URL")}
                      </button>
                    </div>
                  </Field>
                  {(productForm.imagesList.length > 0 ||
                    additionalImageFiles.length > 0) && (
                    <div className="flex flex-wrap gap-3">
                      {productForm.imagesList.map((imageUrl, index) => (
                        <div
                          key={imageUrl}
                          className="relative h-20 w-20 overflow-hidden rounded-sm border border-[#EFE6DD]"
                        >
                          <img
                            src={imageUrl}
                            alt={`${t("Additional image")} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm((form) => ({
                                ...form,
                                imagesList: form.imagesList.filter(
                                  (_, imageIndex) => imageIndex !== index,
                                ),
                              }))
                            }
                            aria-label={`${t("Remove additional image")} ${index + 1}`}
                            className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {additionalImageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-sm border border-[#EFE6DD] bg-[#F5EBE6] p-1 text-center text-[10px] text-[#03382E]"
                        >
                          <span className="break-all">{file.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAdditionalImageFiles((files) =>
                                files.filter(
                                  (_, fileIndex) => fileIndex !== index,
                                ),
                              )
                            }
                            aria-label={`${t("Remove file")} ${file.name}`}
                            className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("Stock")}>
                      <input
                        required
                        min="0"
                        step="1"
                        type="number"
                        className={inputClass}
                        value={productForm.quantityOnHand}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            quantityOnHand: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label={t("Category")}>
                      <select
                        required
                        className={inputClass}
                        value={productForm.category}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            category: event.target.value,
                          })
                        }
                      >
                        <option value="">{t("Choose a category")}</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          isFeatured: event.target.checked,
                        })
                      }
                      className="accent-[#03382E]"
                    />
                    {t("Featured product")}
                  </label>
                  <div className="flex gap-2">
                    <button
                      disabled={isSaving || categories.length === 0}
                      className="flex-1 bg-[#03382E] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                      {isSaving
                        ? t("Saving...")
                        : editingProductId
                          ? t("Save changes")
                          : t("Add product")}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="border border-[#D9D1C7] px-4 py-2.5"
                      >
                        {t("Cancel")}
                      </button>
                    )}
                  </div>
                  {categories.length === 0 && (
                    <p className="text-sm text-amber-700">
                      {t("Add a category before creating products.")}
                    </p>
                  )}
                </form>
              </Panel>

              <Panel>
                <SectionHeading title={`${t("Products")} (${products.length})`} />
                <div className="space-y-3">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="flex flex-wrap items-center gap-3 border-b border-[#EFE6DD] pb-3"
                    >
                      <img
                        src={product.primaryImageUrl}
                        alt=""
                        className="h-16 w-14 bg-[#F5EBE6] object-cover"
                      />
                      <div className="min-w-40 flex-1">
                        <h3 className="font-semibold text-[#1A1A1A]">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.category?.name || t("Uncategorized")} ·{" "}
                          {product.quantityOnHand} {t("available")} · {product.price} EGP
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className="text-sm font-semibold text-[#03382E] hover:underline"
                      >
                        {t("Edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                        className="text-sm font-semibold text-red-700 hover:underline"
                      >
                        {t("Delete")}
                      </button>
                    </article>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500">{t("There are no products.")}</p>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {activeSection === "categories" && (
            <div className="grid gap-6 md:grid-cols-[minmax(260px,0.7fr)_1.3fr]">
              <Panel>
                <SectionHeading
                  title={t(editingCategoryId ? "Edit category" : "Add category")}
                />
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <Field label={t("Category name")}>
                    <input
                      required
                      className={inputClass}
                      value={categoryName}
                      onChange={(event) => setCategoryName(event.target.value)}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <button
                      disabled={isSaving}
                      className="flex-1 bg-[#03382E] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                      {editingCategoryId ? t("Save changes") : t("Add category")}
                    </button>
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId("");
                          setCategoryName("");
                        }}
                        className="border border-[#D9D1C7] px-4"
                      >
                        {t("Cancel")}
                      </button>
                    )}
                  </div>
                </form>
              </Panel>
              <Panel>
                <SectionHeading title={`${t("Categories")} (${categories.length})`} />
                <div className="divide-y divide-[#EFE6DD]">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <span className="font-medium text-[#1A1A1A]">
                        {category.name}
                      </span>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category._id);
                            setCategoryName(category.name);
                          }}
                          className="text-sm font-semibold text-[#03382E] hover:underline"
                        >
                          {t("Edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(category)}
                          className="text-sm font-semibold text-red-700 hover:underline"
                        >
                          {t("Delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="py-3 text-sm text-gray-500">
                      {t("There are no categories.")}
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {activeSection === "users" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_1.2fr]">
              <Panel>
                <SectionHeading
                  title={t(editingUserId ? "Edit user" : "Add user")}
                  subtitle={
                    editingUserId
                      ? t("Leave the password unchanged on the user page.")
                      : t("The phone number and email must be unused.")
                  }
                />
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <Field label={t("Name")}>
                    <input
                      required
                      minLength={3}
                      className={inputClass}
                      value={userForm.name}
                      onChange={(event) =>
                        setUserForm({ ...userForm, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label={t("Email Address")}>
                    <input
                      required
                      type="email"
                      className={inputClass}
                      value={userForm.email}
                      onChange={(event) =>
                        setUserForm({ ...userForm, email: event.target.value })
                      }
                    />
                    <p className="mt-1.5 text-xs leading-5 text-gray-500">
                      {t("Use an active Gmail address that you can access.")}
                    </p>
                  </Field>
                  <Field label={t("Phone Number")}>
                    <input
                      required
                      type="tel"
                      className={inputClass}
                      value={userForm.phoneNumber}
                      onChange={(event) =>
                        setUserForm({
                          ...userForm,
                          phoneNumber: event.target.value,
                        })
                      }
                    />
                    <p className="mt-1.5 text-xs leading-5 text-gray-500">
                      {t("Enter the phone number connected to your WhatsApp account.")}
                    </p>
                  </Field>
                  {!editingUserId && (
                    <Field label={t("Password")}>
                      <input
                        required
                        minLength={6}
                        type="password"
                        className={inputClass}
                        value={userForm.password}
                        onChange={(event) =>
                          setUserForm({
                            ...userForm,
                            password: event.target.value,
                          })
                        }
                      />
                    </Field>
                  )}
                  {canManageRoles && (
                    <Field label={t("Role")}>
                      <select
                        className={inputClass}
                        value={userForm.role}
                        onChange={(event) =>
                          setUserForm({ ...userForm, role: event.target.value })
                        }
                      >
                        <option value="user">{t("Customer")}</option>
                        <option value="moderator">{t("Moderator")}</option>
                        <option value="admin">{t("Administrator")}</option>
                      </select>
                    </Field>
                  )}
                  <div className="flex gap-2">
                    <button
                      disabled={isSaving}
                      className="flex-1 bg-[#03382E] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                      {isSaving
                        ? t("Saving...")
                        : editingUserId
                          ? t("Save changes")
                          : t("Add user")}
                    </button>
                    {editingUserId && (
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="border border-[#D9D1C7] px-4"
                      >
                        {t("Cancel")}
                      </button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel>
                <SectionHeading title={`${t("Users")} (${users.length})`} />
                <div className="space-y-3">
                  {users.map((account) => (
                    <article
                      key={account._id}
                      className="flex flex-wrap items-center gap-3 border-b border-[#EFE6DD] pb-3"
                    >
                      <img
                        src={account.profileImage}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-40 flex-1">
                        <h3 className="font-semibold text-[#1A1A1A]">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {account.email} ·{" "}
                          {account.phoneNumber || account.phone || t("لم يُضف بعد")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {account.role}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => editUser(account)}
                        className="text-sm font-semibold text-[#03382E] hover:underline"
                      >
                        {t("Edit")}
                      </button>
                      <button
                        type="button"
                        disabled={account._id === user?._id}
                        onClick={() => deleteUser(account)}
                        className="text-sm font-semibold text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("Delete")}
                      </button>
                    </article>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-gray-500">{t("There are no users.")}</p>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {activeSection === "orders" && (
            <Panel>
              <SectionHeading title={`${t("Manage orders")} (${orders.length})`} />
              <div className="space-y-4">
                {orders.map((order) => (
                  <article
                    key={order._id}
                    className="rounded-sm border border-[#EFE6DD] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">
                          #{order.billNumber} · {order.customerInfo?.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {order.customerInfo?.phone} ·{" "}
                          {order.shippingAddress?.governorate},{" "}
                          {order.shippingAddress?.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#03382E]">
                          {Number(order.totalAmount || 0).toFixed(2)} EGP
                        </p>
                        <label className="mt-2 block text-xs text-gray-500">
                          {t("Order status")}
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus(order._id, event.target.value)
                            }
                            className={`${inputClass} mt-1 min-w-36`}
                          >
                            {orderStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      {(order.items || []).map((item, index) => (
                        <li key={`${order._id}-${item.product || index}`}>
                          {item.name} × {item.quantity} —{" "}
                          {item.price * item.quantity} EGP
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-gray-500">{t("There are no orders.")}</p>
                )}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
