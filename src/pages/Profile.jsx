import { useState, useRef, useEffect, useMemo } from "react";
import { ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguage } from "../context/LanguageState";

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  useEffect(() => {
    if (!imageFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageFile]);

  // استخراج setValue لملء الخانات برمجياً
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm();

  // هذا الجزء (useEffect) هو السر: سيقوم بملء الخانات تلقائياً بمجرد فتح الصفحة
  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(t("Choose a JPG, PNG, or WEBP image."));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("Image size must not exceed 5 MB."));
      e.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const onSubmit = async (data) => {
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error(t("Your session is missing. Please log in again."));
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();

      // نرسل البيانات الجديدة أو الموجودة بالفعل
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);

      if (data.oldPassword && data.newPassword) {
        formData.append("oldPassword", data.oldPassword);
        formData.append("newPassword", data.newPassword);
      }

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const response = await axiosInstance.put(`/users/${userId}`, formData);

      const updatedUserData =
        response.data.data || response.data.user || response.data;
      updateUser(updatedUserData);
      setImageFile(null);

      toast.success(t("Profile updated successfully!"));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          t("Failed to update profile"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t("Profile Settings")}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-3 border-b border-[#F0EBE7] pb-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#EFE6DD] bg-[#FBF8F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A368]"
              aria-label={t("Change profile photo")}
            >
              <img
                src={
                  imagePreview ||
                  user?.profileImage ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt={t("Profile photo")}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <ImagePlus size={16} aria-hidden="true" />
                {t("Change")}
              </span>
            </button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              ref={fileInputRef}
              onChange={handleImageChange}
              aria-label={t("Choose a profile photo")}
            />
            <p className="text-center text-xs text-gray-500">
              {t("JPG, PNG, or WEBP; up to 5 MB.")}
            </p>
            {imageFile && (
              <p className="text-xs font-medium text-[#28704D]">
                {t("New photo selected. Save changes to update your profile.")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* حقل الاسم */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("Full Name")}
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* حقل الإيميل */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("Email Address")}
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* حقل رقم الهاتف */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t("Phone Number")}
            </label>
            <input
              type="text"
              {...register("phoneNumber")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <hr className="my-6 border-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {t("Change Password (Optional)")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("Current Password")}
              </label>
              <input
                type="password"
                {...register("oldPassword")}
                placeholder={t("Leave blank to keep current")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("New Password")}
              </label>
              <input
                type="password"
                {...register("newPassword")}
                placeholder={t("New password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition disabled:bg-green-300 flex justify-center mt-6"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              t("Save Changes")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
