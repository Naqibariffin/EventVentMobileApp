<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          Nearby Events
        </IonTitle>
      </IonToolbar>
    </IonHeader>

    
    <IonContent class="p-4">
      <!-- Display User's Location -->
      <div style="background-color: #074b06; color: white;" class="p-3 rounded-md mb-4 flex flex-wrap justify-center gap-2">
        📍 Your location: 
        <br>
        {{ userLocationName }}
      </div>

      <ion-searchbar
  v-model="searchQuery"
  placeholder="Search by event name or category"
  @ionInput="onSearchInput"/>
  
 <!-- Filters Section -->
<div style="background-color: #EDE8D0;" class="p-3 rounded-md mb-4 flex flex-wrap justify-center gap-2">
  <!-- Category Filter -->
  <select v-model="selectedCategory" @change="applyFilters" style="background-color: #074b06; color: white;" class="p-3 rounded border">
    <option value="">All Categories</option>
    <option v-for="category in categories" :key="category" :value="category">
      {{ category }}
    </option>
  </select>

  <!-- Distance Filter -->
  <select v-model="selectedDistance" @change="applyFilters" style="background-color: #074b06; color: white;" class="p-3 rounded border">
    <option value="70">Within 70 km</option>
    <option value="35">Within 35 km</option>
    <option value="10">Within 10 km</option>
  </select>

  <!-- RSVP Filter -->
  <select v-model="selectedRSVP" @change="applyFilters" style="background-color: #074b06; color: white;" class="p-3 rounded border ">
    <option value="">All Events</option>
    <option value="true">Only RSVP</option>
  </select>
</div>

<div v-if="filteredEvents.length > 0" class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div v-for="event in filteredEvents" :key="event.id" class="event-card bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
    <img :src="event.banner_url" alt="Event Banner" class="w-full h-48 object-cover">
    <div style="background-color: #074b06;" class="p-4">
      <h1 class="text-lg font-bold text-white text-center">{{ event.event_name }}</h1>
      <p class="text-sm text-gray-100 text-center">{{ event.short_desc }}</p>
      <div class="text-left">
        <p class="text-sm text-gray-200 mt-1">Location: <br>{{ event.location }}</p>
        <p class="text-sm text-gray-200 mt-1">Date: <br>{{ formatDateTime(event.start_date) }} until {{ formatDateTime(event.end_date) }}</p>
        <p class="text-sm text-gray-200 mt-1">Distance: <br>{{ event.distance.toFixed(2) }} km away</p>
      </div>
      <IonButton expand="block" @click="openEvent(event)" class="mt-3" style="--background: #EDE8D0; --color: black;">
        See More
      </IonButton>
    </div>
  </div>
</div>

<div v-if="pastEvents.length > 0">
  <br>
  <div class="bg-[#074b06] text-white px-6 py-4 rounded-lg mx-6">
    <h2 class="text-xl font-bold">Past Events</h2>
  </div>

  <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="event in pastEvents" :key="event.id" class="event-card bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
      <img :src="event.banner_url" alt="Event Banner" class="w-full h-48 object-cover grayscale">
      <div style="background-color: #074b06;" class="p-4">
        <h1 class="text-lg font-bold text-white text-center">{{ event.event_name }}</h1>
        <p class="text-sm text-gray-100 text-center">{{ event.short_desc }}</p>
        <div class="text-left">
          <p class="text-sm text-gray-200 mt-1">Location: <br>{{ event.location }}</p>
          <p class="text-sm text-gray-200 mt-1">Date:<br> {{ formatDateTime(event.start_date) }} until {{ formatDateTime(event.end_date) }}</p>
          <p class="text-sm text-gray-200 mt-1">Distance: <br>{{ event.distance.toFixed(2) }} km away</p>
        </div>
      </div>
    </div>
  </div>
</div>

<IonModal :is-open="showModal" @didDismiss="showModal = false">
  <IonHeader>
    <IonToolbar>
      <IonTitle style="font-weight: bold; background-color: #64af6a; color: #162718;">Event Details</IonTitle>
      <IonButtons slot="end"></IonButtons>
    </IonToolbar>
  </IonHeader>

  <IonContent class="p-4">
    <!-- Event Container (Relative for Positioning) -->
    <div class="relative w-full">
      <!-- Event Category (Top-Left Over Banner) -->
      <div class="absolute top-2 left-2 px-4 py-2 rounded-lg text-white font-bold shadow-md" style="background-color: #074b06;">
        {{ selectedEvent.category }}
      </div>
      
      <!-- Event Banner -->
      <img :src="selectedEvent.banner_url" class="w-full h-56 object-cover rounded-lg" v-if="selectedEvent.banner_url" />
    </div>

    <!-- Event Name -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-center">
      <h2 class="text-2xl font-bold text-black">{{ selectedEvent.event_name }}</h2>
    </div>

    <!-- Short Description -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-center">
      <p class="text-lg font-semibold text-black">{{ selectedEvent.short_desc }}</p>
    </div>

    <!-- Long Description -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-center">
      <p class="text-black" style="white-space: pre-line;">{{ selectedEvent.long_desc }}</p>
    </div>

    <!-- Event Info -->
    <div class="bg-white p-4 mt-4 rounded-xl shadow-md text-left">
      <p class="text-sm text-black">📍 Location:<br> <span class="font-bold">{{ selectedEvent.location }}</span></p>
      <p class="text-sm text-black mt-2">🕒 Start:<br> <span class="font-bold">{{ formatDateTime(selectedEvent.start_date) }}</span></p>
      <p class="text-sm text-black mt-2">⏳ End:<br> <span class="font-bold">{{ formatDateTime(selectedEvent.end_date) }}</span></p>
      <p v-if="selectedEvent.enable_rsvp" class="text-sm text-black mt-2">🎟️ Limited For:<br> <span class="font-semibold">{{ selectedEvent.slots }} People Only</span></p>
    </div>

    <!-- RSVP Button (If Enabled) -->
    <IonButton 
      class="mt-4 text-white" 
      style="--background: #074b06;" 
      v-if="selectedEvent.enable_rsvp" 
      @click="handleRSVP(selectedEvent)">
      RSVP Now
    </IonButton>

    <!-- Navigation Buttons -->
    <div class="mt-4 flex gap-2">
      <IonButton 
        expand="block" 
        class="flex-1 text-white" 
        style="--background: #074b06;" 
        @click="openInMaps(selectedEvent.latitude, selectedEvent.longitude)">
        Open in Google Maps
      </IonButton>
      
      <IonButton 
        expand="block" 
        class="flex-1 text-white" 
        style="--background: #074b06;" 
        @click="openInWaze(selectedEvent.latitude, selectedEvent.longitude)">
        Open in Waze
      </IonButton>
    </div>

    <!-- Close Button -->
    <IonButton 
      expand="block" 
      style="--background: #b91c1c; --color: white;" 
      @click="showModal = false" 
      class="mt-4">
      Close
    </IonButton>
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons,IonToast } from "@ionic/vue";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs,updateDoc, addDoc, query, where, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonModal,
    IonButtons,
    IonToast,
  },

  data() {
  return {
    events: [],
    nearbyEvents: [],
    pastEvents: [],
    filteredEvents: [],
    categories: [],
    selectedCategory: "",
    selectedDistance: "70",
    selectedRSVP: "",
    selectedEvent: {},
    showModal: false,
    loading: true,
    user: null,
    userLocation: { lat: null, lng: null },
    userLocationName: "Detecting location...",
    toastMessage: "",
    showToast: false, 
    searchQuery: "",
  };
},


  async mounted() {
    this.getUserLocation();
    this.checkAuth();
  },

  methods: {
    showToastMessage(message) {
  this.toastMessage = message;
  this.showToast = true;
},

filterEvents() {
  const query = this.searchQuery.toLowerCase();

  this.filteredEvents = this.nearbyEvents.filter(event => {
    const matchesCategory = !this.selectedCategory || event.category === this.selectedCategory;
    const matchesRSVP = !this.selectedRSVP || event.enable_rsvp === (this.selectedRSVP === "true");
    const matchesDistance = event.distance <= parseFloat(this.selectedDistance);
    const matchesSearch = event.event_name.toLowerCase().includes(query) || event.category.toLowerCase().includes(query);

    return matchesCategory && matchesRSVP && matchesDistance && matchesSearch;
  });
},

onSearchInput(event) {
  this.searchQuery = event.target.value;
  this.filterEvents();
},



    
    async getUserLocation() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            this.userLocation.lat = position.coords.latitude;
            this.userLocation.lng = position.coords.longitude;
            await this.getLocationName(this.userLocation.lat, this.userLocation.lng);
            await this.fetchEvents();
          },
          (error) => {
            console.error("Error getting location:", error);
            this.loading = false;
            this.userLocationName = "Unable to detect location";
          }
        );
      } else {
        console.error("Geolocation not supported by this browser.");
        this.loading = false;
        this.userLocationName = "Location not supported";
      }
    },

    async getLocationName(lat, lng) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        this.userLocationName = data.display_name || "Unknown Location";
      } catch (error) {
        console.error("Error fetching location name:", error);
        this.userLocationName = "Unknown Location";
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

    async fetchEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    this.events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    this.categories = [...new Set(this.events.map(event => event.category))];

    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const upcomingEvents = [];
    const pastEvents = [];

    for (const event of this.events) {
      const eventEndDate = new Date(event.end_date);
      event.distance = this.calculateDistance(
        this.userLocation.lat, this.userLocation.lng, 
        event.latitude, event.longitude
      );

      // ✅ Exclude events 70km and above
      if (event.distance >= 70) {
        continue;
      }

      if (eventEndDate >= today) {
        upcomingEvents.push(event);
      } else {
        if (eventEndDate < oneMonthAgo) {
          await this.deleteExpiredEvent(event.id);
        } else {
          pastEvents.push(event);
        }
      }
    }

    this.nearbyEvents = upcomingEvents.sort((a, b) => a.distance - b.distance);
    this.pastEvents = pastEvents.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

    this.applyFilters();
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    this.loading = false;
  }
},

    async deleteExpiredEvent(eventId) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        console.log(`Deleted expired event: ${eventId}`);
      } catch (error) {
        console.error(`Error deleting expired event ${eventId}:`, error);
      }
    },

    applyFilters() {
  this.filterEvents();
},


    checkAuth() {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
      });
    },

    openEvent(event) {
      this.selectedEvent = event;
      this.showModal = true;
    },

    openInMaps(lat, lng) {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(mapsUrl, "_blank");
    },

    openInWaze(lat, lng) {
      const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      window.open(wazeUrl, "_blank");
    },

    async handleRSVP(event) {
  if (!this.user) {
    this.$router.push("/login");
    return;
  }

  try {
    // Check if there are available slots
    if (event.slots <= 0) {
      this.showToastMessage("❌ No available slots for this event.");
      return;
    }

    const rsvpRef = doc(db, `events/${event.id}/rsvps`, this.user.uid);
    const userRSVPQuery = query(collection(db, `events/${event.id}/rsvps`), where("user_id", "==", this.user.uid));
    const querySnapshot = await getDocs(userRSVPQuery);

    if (!querySnapshot.empty) {
      this.showToastMessage("❌ You have already RSVP'd for this event!");
      return;
    }

    // Update the RSVP collection with the user information
    await setDoc(rsvpRef, {
      user_id: this.user.uid,
      user_email: this.user.email,
      event_name: event.event_name,
      event_date: event.start_date,
      timestamp: serverTimestamp(),
    });

    // Decrease the slots by 1
    const eventRef = doc(db, "events", event.id);
    await updateDoc(eventRef, {
      slots: event.slots - 1
    });

    this.showToastMessage("✅ RSVP successful! You have reserved a slot for this event.");
  } catch (error) {
    console.error("Error RSVP'ing:", error);
  }
},

    calculateDistance(lat1, lon1, lat2, lon2) {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
  },
};
</script>

<style scoped>
.event-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.event-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
</style>