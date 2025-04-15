<template>
  <ion-page>
    <ion-content class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-300 p-4">
      <div class="flex items-center justify-center w-full h-full">
        <!-- Display Profile -->
        <div v-if="user" class="bg-white bg-opacity-80 p-6 rounded-2xl shadow-2xl w-80 text-center backdrop-blur-md transition-transform transform hover:scale-105">
          <img 
            :src="user.photoURL || defaultProfilePic" 
            alt="Profile Picture"
            class="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-blue-300 shadow-lg object-cover transition-all hover:border-purple-400"
          />

          <h2 class="text-2xl font-bold text-gray-700 mb-2 animate-fade-in">
            Welcome, {{ user.displayName || "User" }}
          </h2>
          <p class="text-sm text-gray-500 mb-4">{{ user.email || "No email available" }}</p>

          <p v-if="message" class="text-sm text-green-500 animate-pulse">{{ message }}</p>
          <p v-if="error" class="text-sm text-red-500 animate-pulse">{{ error }}</p>

          <ion-button expand="full" color="primary" class="mt-3" @click="openSettingsModal">
            ⚙ Settings
          </ion-button>

          <ion-button expand="full" color="danger" class="mt-2" @click="logoutUser">
            <i class="fa fa-sign-out mr-2" aria-hidden="true"></i> Logout
          </ion-button>
        <!-- FAQ Button -->
        <p class="text-sm text-gray-600 mt-4">
                Got Any Questions? <router-link to="/faq" class="text-green-700 font-semibold">FAQ</router-link>
        </p>
        </div>
        
        <div v-else class="text-center text-gray-700 text-lg animate-bounce">Loading profile...</div>
      </div>
      

      <!-- Settings Modal -->
<ion-modal :is-open="showSettingsModal" @didDismiss="showSettingsModal = false">
  <div class="bg-white p-6 rounded-2xl shadow-xl w-96 mx-auto mt-20 backdrop-blur-md">
    <h3 class="text-xl font-bold text-center mb-4 text-gray-700">⚙ Update Profile</h3>

    <!-- Profile Picture Preview -->
    <div class="flex flex-col items-center">
      <img 
        :src="previewImage || user?.photoURL || defaultProfilePic" 
        alt="Profile Picture Preview"
        class="w-28 h-28 rounded-full border-4 border-blue-300 shadow-lg object-cover mb-3 hover:border-purple-400 transition-all"
      />
    </div>

    <!-- Change Profile Picture -->
    <label class="block text-gray-600 text-left mb-1 font-semibold">Profile Picture:</label>
    <input 
      type="file" 
      @change="handleProfilePicture" 
      class="w-full text-sm mb-3 border border-gray-300 p-2 rounded cursor-pointer hover:border-purple-400 transition-all"
    />

    <!-- Change Username -->
    <label class="block text-gray-600 text-left mb-1 font-semibold">New Username:</label>
    <input v-model="newUsername" class="w-full border p-2 rounded mb-3 focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Enter new username" />

    <p v-if="updateMessage" class="text-sm text-green-500 animate-pulse">{{ updateMessage }}</p>
    <p v-if="updateError" class="text-sm text-red-500 animate-pulse">{{ updateError }}</p>

    <ion-button expand="full" color="success" @click="updateUserProfile" class="mt-3">
      ✅ Update
    </ion-button>
    
    <ion-button expand="full" color="danger" @click="showSettingsModal = false" class="mt-2">
      ❌ Cancel
    </ion-button>
  </div>
</ion-modal>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  getAuth, signOut, onAuthStateChanged, updateProfile 
} from "firebase/auth";
import { ref, onMounted, watch } from "vue";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { IonModal } from '@ionic/vue';


export default {
  components: {
    IonModal, 
  },
  setup() {
    const auth = getAuth();
    const storage = getStorage();
    const user = ref(null);
    const message = ref("");
    const error = ref("");
    const defaultProfilePic ="https://www.w3schools.com/howto/img_avatar.png";
    const previewImage = ref(null);
    const selectedFile = ref(null);
    const newUsername = ref("");
    const updateMessage = ref("");
    const updateError = ref("");
    const settingsModal = ref(null); // ← modal ref
    const showSettingsModal = ref(false); // ← still useful if you want conditional rendering

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user.value = { ...currentUser };
        }
      });
    });

    watch(user, (newUser) => {
      if (!newUser) return;
      newUsername.value = newUser.displayName || "";
    });

    const handleProfilePicture = (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedFile.value = file;
        previewImage.value = URL.createObjectURL(file);
      }
    };

    const uploadProfilePicture = async () => {
      if (!selectedFile.value) return;

      const storagePath = `profile_pictures/${auth.currentUser.uid}`;
      const fileRef = storageRef(storage, storagePath);

      try {
        await uploadBytes(fileRef, selectedFile.value);
        const downloadURL = await getDownloadURL(fileRef);

        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        user.value.photoURL = downloadURL;
        updateMessage.value = "✅ Profile picture updated successfully!";
      } catch (err) {
        updateError.value = "❌ Failed to update profile picture.";
      }
    };

    const updateUserProfile = async () => {
      updateMessage.value = "";
      updateError.value = "";

      try {
        if (selectedFile.value) {
          await uploadProfilePicture();
        }

        if (newUsername.value) {
          await updateProfile(auth.currentUser, { displayName: newUsername.value });
          user.value.displayName = newUsername.value;
        }

        updateMessage.value = "✅ Profile updated successfully!";
      } catch (err) {
        updateError.value = "❌ Failed to update profile: " + err.message;
      }
    };

    const openSettingsModal = () => {
      showSettingsModal.value = true;
    };

    const closeSettingsModal = () => {
      showSettingsModal.value = false;
    };

    const logoutUser = async () => {
      await signOut(auth);
      window.location.href = "/login";
    };

    return {
      user,
      handleProfilePicture,
      logoutUser,
      message,
      error,
      defaultProfilePic,
      showSettingsModal,
      previewImage,
      newUsername,
      updateUserProfile,
      updateMessage,
      updateError,
      settingsModal,
      openSettingsModal,
      closeSettingsModal,
    };
  },
};
</script>
