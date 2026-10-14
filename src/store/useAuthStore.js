import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // جلب البيانات من الـ LocalStorage إذا كان المستخدم مسجلاً مسبقاً
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  // دالة تسجيل الدخول
  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  // دالة تسجيل الخروج
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  // دالة لتحديث بيانات المستخدم (سنحتاجها بعد تغيير الصورة أو الاسم)
  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
