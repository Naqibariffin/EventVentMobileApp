// authStore.js
import { defineStore } from "pinia";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const auth = getAuth();
  const user = ref(null);


  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser;
    } else {
      user.value = null;
    }
  });

  return { user };
});
