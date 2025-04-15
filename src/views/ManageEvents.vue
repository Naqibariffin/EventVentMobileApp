<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          Manage RSVPs and Events
        </IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="p-4">
      <br>
      <!-- RSVPs Section: Events the user RSVP'd for -->
      <div style="background-color: #074b06; color: white;font-weight:bold;" class="px-6 py-4 rounded-lg mx-6">
        🎟️ Events You Have RSVP'd For
      </div>
      <br>
      <div v-if="loading" class="text-center p-4">Loading RSVPs...</div>
      <div v-else-if="rsvpEvents.length === 0" class="text-center p-4">
        You have not RSVP'd for any events.
      </div>
      <div v-else class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in rsvpEvents" :key="event.eventId" class="event-card bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <img :src="event.banner_url" class="w-full h-48 object-cover rounded-t-xl" v-if="event.banner_url" />
          <div style="background-color: #074b06;" class="p-4">
            <h1 class="text-lg font-bold text-white text-center">{{ event.event_name }}</h1>
            <p class="text-sm text-gray-100 text-center">📅 {{ formatDateTime(event.start_date) }}</p>
            <div class="flex justify-center gap-2 mt-3">
              <IonButton @click="cancelRSVP(event.eventId, event.rsvpId)" style="--background: #b91c1c; --color: white;">Cancel RSVP</IonButton>
              <IonButton @click="openEventDetails(event)" style="--background: #EDE8D0; --color: black;">See More</IonButton>
            </div>
          </div>
        </div>
      </div>
      <br>

      <!-- Manage Events Section: Events created by the user -->
      <div style="background-color: #074b06; color: white;font-weight:bold;" class="px-6 py-4 rounded-lg mx-6">
        📝 Your Created Events
      </div>
      <br>
      <div v-if="loading" class="text-center p-4">Loading Your Events...</div>
      <div v-else-if="userEvents.length === 0" class="text-center p-4">
        You haven't created any events yet.
      </div>
      <div v-else class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in userEvents" :key="event.eventId" class="event-card bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <img :src="event.banner_url" class="w-full h-48 object-cover rounded-t-xl" v-if="event.banner_url" />
          <div style="background-color: #074b06;" class="p-4">
            <h1 class="text-lg font-bold text-white text-center">{{ event.event_name }}</h1>
            <p class="text-sm text-gray-100 text-center">📅 {{ formatDateTime(event.start_date) }}</p>
            <div class="flex justify-center gap-2 mt-3">
              <ion-button @click="editEvent(event)" color="primary">Edit</ion-button>
              <IonButton @click="deleteEvent(event.eventId)" style="--background: #b91c1c; --color: white;">Delete</IonButton>
              <IonButton v-if="event.user_id === user.uid" @click="openRSVPModal(event)" style="--background: #074b1e; --color: white;">View RSVPs</IonButton>
            </div>
          </div>
        </div>
      </div>

      <IonModal :is-open="showModal" @didDismiss="showModal = false">
  <IonHeader>
    <IonToolbar>
      <IonTitle style="font-weight: bold; background-color: #64af6a; color: #162718;">
        Event Details
      </IonTitle>
      <IonButtons slot="end"></IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="p-4">
    <!-- Event Banner with Category -->
    <div class="relative w-full">
      <div class="absolute top-2 left-2 px-4 py-2 rounded-lg text-white font-bold w-auto shadow-md" 
           style="background-color: #074b06;">
        {{ selectedEvent.category }}
      </div>
      <img :src="selectedEvent.banner_url" class="w-full h-56 object-cover rounded-lg" v-if="selectedEvent.banner_url" />
    </div>

    <!-- Event Name -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-center">
      <h2 class="text-2xl font-bold text-black">{{ selectedEvent.event_name }}</h2>
    </div>

    <!-- Short Description -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-left">
      <h2 class="text-lg font-bold text-black">{{ selectedEvent.short_desc }}</h2>
    </div>

    <!-- Long Description -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-left">
      <p class="text-black text-center" style="white-space: pre-line;">{{ selectedEvent.long_desc }}</p>
    </div>

    <!-- Event Details -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-left">
      <p class="text-sm text-black">📍 Location:<br>
        <span class="font-semibold">{{ selectedEvent.location }}</span>
      </p>
      <p class="text-sm text-black mt-2">🕒 Start:<br>
        <span class="font-semibold">{{ formatDateTime(selectedEvent.start_date) }}</span>
      </p>
      <p class="text-sm text-black mt-2">⏳ End:<br>
        <span class="font-semibold">{{ formatDateTime(selectedEvent.end_date) }}</span>
      </p>
    </div>

    <!-- Navigation Buttons -->
    <div class="mt-4 flex gap-2">
      <IonButton expand="block" class="flex-1 text-white" style="--background: #074b06;" 
                 @click="openInMaps(selectedEvent.latitude, selectedEvent.longitude)">
        Open in Google Maps
      </IonButton>
      <IonButton expand="block" class="flex-1 text-white" style="--background: #074b06;" 
                 @click="openInWaze(selectedEvent.latitude, selectedEvent.longitude)">
        Open in Waze
      </IonButton>
    </div>

    <!-- Close Button -->
    <IonButton expand="block" style="--background: #b91c1c; --color: white;" @click="showModal = false" class="mt-4">
      Close
    </IonButton>
  </IonContent>
</IonModal>


<IonModal :is-open="showRSVPModal" @didDismiss="showRSVPModal = false">
  <IonHeader>
    <IonToolbar>
      <IonTitle class="text-lg font-semibold text-gray-900">
        RSVP List for <br>{{ selectedRSVPEvent.event_name }}
      </IonTitle>
      <IonButtons slot="end">
        <IonButton @click="showRSVPModal = false">Close</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>

  <IonContent class="p-6 bg-gray-100">
    <div v-if="selectedRSVPEvent.rsvps && selectedRSVPEvent.rsvps.length > 0" class="space-y-4">
      <IonList class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <IonItem
          v-for="rsvp in selectedRSVPEvent.rsvps"
          :key="rsvp.rsvpId"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm mb-3 border border-gray-300"
        >
          <div class="flex items-center space-x-3">
            <!-- Profile Picture or Default Avatar -->
            <img
              v-if="rsvp.userPhoto"
              :src="rsvp.userPhoto"
              alt="User Profile"
              class="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <div
              v-else
              class="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold"
            >
              {{ rsvp.userName ? rsvp.userName.charAt(0) : "?" }}
            </div>

            <!-- User Info -->
            <IonLabel>
              <h2 class="text-md font-semibold text-gray-800">{{ rsvp.userEmail }}</h2>
            </IonLabel>
          </div>
          
          <!-- Delete Button Aligned Right -->
          <br>
          <IonButton color="danger" class="rounded-lg shadow-md" @click="cancelRSVP(selectedRSVPEvent.eventId, rsvp.rsvpId)">
            Cancel
          </IonButton>
        </IonItem>
      </IonList>
    </div>

    <!-- Empty State Message -->
    <div v-else class="flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <img src="https://cdn-icons-png.flaticon.com/512/4076/4076261.png" alt="No RSVPs" class="w-20 h-20 mb-3 opacity-70">
      <p class="text-gray-500 text-sm">No RSVPs yet. Invite people to join!</p>
    </div>
  </IonContent>
</IonModal>

<IonToast
  :is-open="showToast"
  :message="toastMessage"
  :duration="3000"
  @didDismiss="showToast = false"
  position = "top"
/>
</IonContent>
</IonPage>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonButtons, IonToast } from "@ionic/vue";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, query, where,updateDoc,increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonModal,
    IonButtons,
    IonToast,
  },
  data() {
    return {
      rsvpEvents: [],
      userEvents: [],
      loading: true,
      user: null,
      showModal: false,
      selectedEvent: null,
      showRSVPModal: false,
      selectedRSVPEvent: {},
      toastMessage: '',  // For storing toast message
      showToast: false,  // For controlling toast visibility
    };
  },
  mounted() {
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user;
          await this.fetchRSVPs();
          await this.fetchUserEvents();
        } else {
          this.user = null;
          this.loading = false;
        }
      });
    },
    async fetchRSVPs() {
      if (!this.user) return;
      this.loading = true;
      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const rsvpList = [];
        for (const eventDoc of eventsSnapshot.docs) {
          const eventId = eventDoc.id;
          const rsvpQuery = query(
            collection(db, `events/${eventId}/rsvps`),
            where("user_id", "==", this.user.uid)
          );
          const userRSVPs = await getDocs(rsvpQuery);
          userRSVPs.forEach((docSnap) => {
            rsvpList.push({
              eventId,
              rsvpId: docSnap.id,
              ...eventDoc.data(),
            });
          });
        }
        this.rsvpEvents = rsvpList;
      } catch (error) {
        console.error("Error fetching RSVPs:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchUserEvents() {
      if (!this.user) return;
      this.loading = true;
      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const userCreatedEvents = [];
        eventsSnapshot.forEach((eventDoc) => {
          if (eventDoc.data().user_id === this.user.uid) {
            userCreatedEvents.push({
              eventId: eventDoc.id,
              ...eventDoc.data(),
            });
          }
        });
        this.userEvents = userCreatedEvents;
      } catch (error) {
        console.error("Error fetching user's events:", error);
      } finally {
        this.loading = false;
      }
    },
    editEvent(event) {
      this.$router.push({ name: 'EditEvent', params: { eventId: event.eventId } });
    },
    async deleteEvent(eventId) {
      if (!this.user) return;
      try {
        await deleteDoc(doc(db, "events", eventId));
        this.userEvents = this.userEvents.filter(event => event.eventId !== eventId);
        this.showToastMessage("Event deleted successfully.");
      } catch (error) {
        console.error("Error deleting event:", error);
        this.showToastMessage("Error deleting event.");
      }
    },
    async cancelRSVP(eventId, rsvpId) {
  if (!this.user) return;
  try {
    // Delete the RSVP document
    await deleteDoc(doc(db, `events/${eventId}/rsvps`, rsvpId));

    // Increase the slots by 1
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      slots: increment(1) 
    });

    // Update RSVP list in selectedRSVPEvent if applicable
    if (this.selectedRSVPEvent.eventId === eventId && this.selectedRSVPEvent.rsvps) {
      this.selectedRSVPEvent.rsvps = this.selectedRSVPEvent.rsvps.filter(
        rsvp => rsvp.rsvpId !== rsvpId
      );
    }

    // Update user's RSVP event list
    this.rsvpEvents = this.rsvpEvents.filter(rsvp => rsvp.rsvpId !== rsvpId);

    this.showToastMessage("RSVP cancelled successfully.");
  } catch (error) {
    console.error("Error cancelling RSVP:", error);
    this.showToastMessage("Error cancelling RSVP.");
  }
},


    formatDateTime(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    },
    openEventDetails(event) {
      this.selectedEvent = event;
      this.showModal = true;
    },
    openInMaps(latitude, longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, "_blank");
    },
    openInWaze(latitude, longitude) {
      const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      window.open(url, "_blank");
    },
    async openRSVPModal(event) {
      // Only event creator can view RSVP list
      if (!this.user || event.user_id !== this.user.uid) {
        this.showToastMessage("You are not authorized to view RSVPs for this event.");
        return;
      }
      try {
        const rsvpQuery = query(collection(db, `events/${event.eventId}/rsvps`));
        const rsvpSnapshot = await getDocs(rsvpQuery);
        event.rsvps = [];
        event.showRSVPs = false;
        rsvpSnapshot.forEach((docSnap) => {
          event.rsvps.push({
            rsvpId: docSnap.id,
            userName: docSnap.data().user_name,
            userEmail: docSnap.data().user_email,
          });
        });
        this.selectedRSVPEvent = event;
        this.showRSVPModal = true;
      } catch (error) {
        console.error("Error opening RSVP modal:", error);
        this.showToastMessage("Error opening RSVP modal.");
      }
    },
    toggleRSVPList(event) {
      if (!event.showRSVPs) {
        this.openRSVPModal(event); 
      }
      event.showRSVPs = !event.showRSVPs;
    },
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
    }
  }
};
</script>



<style scoped>
.event-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}
.event-card:hover {
  transform: scale(1.05);
}
</style>
