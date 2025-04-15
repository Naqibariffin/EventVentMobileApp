<template>
  <ion-tabs>
    <ion-router-outlet></ion-router-outlet>

    <ion-tab-bar slot="bottom" class="custom-tab-bar">
      <ion-tab-button tab="home" href="/home">
        <ion-icon :icon="compass" />
        <ion-label>Discover</ion-label>
      </ion-tab-button>

      <!-- Conditionally redirect Add Events to Login if not authenticated -->
      <ion-tab-button tab="add" :href="addEventLink">
        <ion-icon :icon="addCircle" />
        <ion-label>Add Events</ion-label>
      </ion-tab-button>

      <!-- Show Manage Events tab only if user is logged in -->
      <ion-tab-button v-if="authStore.user" tab="manage-events" href="/manage-events">
      <ion-icon :icon="settings" />
      <ion-label>Manage Events</ion-label>
      </ion-tab-button>

      <!-- Conditionally redirect Profile to Login if not authenticated -->
      <ion-tab-button tab="profile" :href="profileLink">
        <ion-icon :icon="person" />
        <ion-label>Profile</ion-label>
      </ion-tab-button>
      
    </ion-tab-bar>
  </ion-tabs>
</template>

<script>
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/vue";
import { compass, person, addCircle, settings } from "ionicons/icons";
import { useAuthStore } from "../auth/authStore";
import { computed } from "vue";

export default {
  components: { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel },
  setup() {
    const authStore = useAuthStore();

    // ✅ Ensure computed properties return valid values
    const addEventLink = computed(() => (authStore.user ? "/add-event" : "/login"));
    const profileLink = computed(() => (authStore.user ? "/my-profile" : "/login")); // ✅ Fixed

    return {
      compass,
      person,
      addCircle,
      settings,
      addEventLink,
      profileLink,
      authStore,
    };
  },
};
</script>

<style scoped>
.custom-tab-bar {
  --background: #64af6a;
  --border-top: 1px solid #000000;
}

ion-tab-button {
  --color: #38613b;
  --color-selected: #162718;
}
</style>
