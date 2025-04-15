<template>
  <ion-page>
    <ion-content fullscreen class="flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700">
      <ion-grid class="h-screen flex items-center justify-center">
        <ion-row class="w-full flex justify-center">
          <ion-col size="12" size-md="6" size-lg="4" class="flex justify-center">
            <div class="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center">
              <h2 class="text-3xl font-bold text-green-700 mb-6">Welcome Back</h2>

              <ion-item class="w-full mb-4 border-b border-gray-300">
                <ion-label position="floating" class="text-gray-600">Email</ion-label>
                <br>
                <ion-input v-model="email" type="email" class="p-2 w-full"></ion-input>
              </ion-item>

              <ion-item class="w-full mb-4 border-b border-gray-300">
                <ion-label position="floating" class="text-gray-600">Password</ion-label>
                <br>
                <ion-input v-model="password" type="password" class="p-2 w-full"></ion-input>
              </ion-item>

              <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-3">{{ errorMessage }}</p>

              <ion-button expand="full" class="mt-4 text-white font-semibold text-lg py-3 rounded-xl transition duration-300 ease-in-out"
                style="--background: linear-gradient(to right, #0f5c0f, #074b06); border: none;" 
                @click="loginUser" 
                :disabled="loading">
                <span v-if="!loading">Login</span>
                <span v-else>Logging in...</span>
              </ion-button>

              <p class="text-sm text-gray-600 mt-4">
                Don't have an account? <router-link to="/register" class="text-green-700 font-semibold">Sign Up</router-link>
              </p>

              <!-- FAQ Button -->
              <p class="text-sm text-gray-600 mt-4">
                Got Any Questions? <router-link to="/faq" class="text-green-700 font-semibold">FAQ</router-link>
              </p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "../auth/authStore";
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel } from "@ionic/vue";
import { useRouter } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";


export default {
  components: { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel },
  setup() {
    const router = useRouter();

    const goToFAQ = () => {
      router.push("/faq");  
    };

    return { goToFAQ };
  },
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      loading: false,
    };
  },
  methods: {
    async loginUser() {
  this.errorMessage = "";
  if (!this.email || !this.password) {
    this.errorMessage = "Please enter both email and password!";
    return;
  }

  try {
    this.loading = true;

    // Step 1: Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
    const user = userCredential.user;

    // Step 2: Check Firestore 'users' collection for the UID
    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      this.errorMessage = "Access denied. You are not registered as a user.";
      await auth.signOut(); 
      return;
    }

    // Step 3: Proceed if user exists in 'users' collection
    const authStore = useAuthStore();
    authStore.user = user;

    this.$router.push("/my-profile");

  } catch (error) {
    this.handleFirebaseError(error);
  } finally {
    this.loading = false;
  }
},

    handleFirebaseError(error) {
      const errorCode = error.code;

      if (errorCode === "auth/user-not-found") {
        this.errorMessage = "User not found. Please register!";
      } else if (errorCode === "auth/wrong-password") {
        this.errorMessage = "Incorrect password! Please try again.";
      } else if (errorCode === "auth/invalid-email") {
        this.errorMessage = "Invalid email format! Please check the email address.";
      } else if (errorCode === "auth/too-many-requests") {
        this.errorMessage = "Too many login attempts. Please try again later.";
      } else if (errorCode === "auth/network-request-failed") {
        this.errorMessage = "Network error. Please check your internet connection.";
      } else {
        this.errorMessage = "Wrong Password or Username";
      }
    },
  },
};
</script>
