import { useAuthStore } from "../auth/authStore";

export const requireAuth = async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthChecked) {
    await authStore.checkAuth();
  }

  authStore.user ? next() : next("/login");
};
