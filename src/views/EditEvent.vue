<template>
  <IonPage>
    <!-- Header -->
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/manage-event" text="Back" />
        </IonButtons>
        <IonTitle>Edit Event</IonTitle>
      </IonToolbar>
    </IonHeader>

    <!-- Content -->
    <IonContent class="p-6 bg-gray-100">
      <div v-if="loading" class="text-center text-gray-600">Loading...</div>

      <div v-else>
        <form @submit.prevent="updateEvent" class="mx-auto max-w-lg space-y-5 bg-white p-6 rounded-lg shadow-md">
          <!-- Event Banner Preview -->
          <div class="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-2">Banner Preview</h2>
            <div class="flex justify-center">
              <img v-if="event.banner_url" :src="event.banner_url" alt="Event Banner"
                class="w-full max-h-56 object-cover rounded-lg shadow-md border border-gray-300" />
            </div>
          </div>

          <!-- Upload Banner -->
          <IonItem class="rounded-lg shadow-md bg-white mb-6">
            <IonLabel>Upload Banner</IonLabel>
            <input type="file" @change="uploadBanner" accept="image/*" class="ml-4 text-sm" />
          </IonItem>

          <!-- Event Name -->
          <IonItem>
            <IonLabel position="stacked">Event Name</IonLabel>
            <IonInput v-model="event.event_name" required class="text-sm" />
          </IonItem>

          <!-- Category -->
          <IonItem>
            <IonLabel position="stacked">Category</IonLabel>
            <IonSelect v-model="event.category" placeholder="Select Category">
              <IonSelectOption v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </IonSelectOption>
            </IonSelect>
          </IonItem>

          <!-- Location Input -->
          <IonItem>
            <IonLabel position="stacked">Location</IonLabel>
            <input id="autocomplete" type="text" v-model="event.location"
            disabled
              class="ion-input w-full p-2 border border-gray-300 rounded-lg" required />
          </IonItem>

          <!-- Google Map -->
          <div ref="mapContainer" id="map" class="w-full h-64 my-4 rounded-lg shadow-md border border-gray-300"></div>

          <!-- Short Description -->
          <IonItem>
            <IonLabel position="stacked">Short Description</IonLabel>
            <IonTextarea v-model="event.short_desc" class="text-sm" />
          </IonItem>

          <!-- Long Description -->
          <IonItem>
            <IonLabel position="stacked">Long Description</IonLabel>
            <IonTextarea v-model="event.long_desc" class="text-sm" />
          </IonItem>

          <!-- Start Date & Time -->
          <IonItem>
            <IonLabel position="stacked">Start Date & Time</IonLabel>
            <IonDatetime v-model="event.start_date" display-format="YYYY-MM-DDTHH:mm" />
          </IonItem>

          <!-- End Date & Time -->
          <IonItem>
            <IonLabel position="stacked">End Date & Time</IonLabel>
            <IonDatetime v-model="event.end_date" display-format="YYYY-MM-DDTHH:mm" />
          </IonItem>

          <!-- RSVP Toggle -->
          <IonItem>
            <IonLabel>Enable RSVP</IonLabel>
            <IonToggle v-model="event.enable_rsvp" />
          </IonItem>

          <!-- Available Slots (Only shown if RSVP is enabled) -->
          <IonItem v-if="event.enable_rsvp">
            <IonLabel position="stacked">Available Slots</IonLabel>
            <IonInput type="number" v-model.number="event.slots" min="1" class="text-sm" />
          </IonItem>

          <!-- Submit Button -->
          <IonButton expand="full" type="submit" class="mt-4" style="--background: #064e3b; --color: white;">
            Update Event
          </IonButton>
        </form>
      </div>
    </IonContent>
  </IonPage>
</template>

<script>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonDatetime, IonToggle, IonButton, IonButtons, IonBackButton
} from '@ionic/vue';

import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { Loader } from "@googlemaps/js-api-loader";

export default {
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetime, IonToggle,
    IonButton, IonButtons, IonBackButton
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const eventId = route.params.eventId;
    const event = ref({});
    const loading = ref(true);
    const categories = ref(["Fitness", "Art", "Music", "Tech", "Education", "Food", "Charity", "Fashion", "Games", "Social", "Others"]);
    const mapContainer = ref(null);
    let map, marker, geocoder;

    const fetchEvent = async () => {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        event.value = eventDoc.data();
      }
      loading.value = false;
    };

    onMounted(async () => {
      await fetchEvent();
      
      const loader = new Loader({
        apiKey: "AIzaSyDWxRiZzG2KuG1l4SIjJwvnxDyxNazH3Kk",
        version: "weekly",
        libraries: ["places"]
      });

      const google = await loader.load();
      geocoder = new google.maps.Geocoder();

      const position = { lat: event.value.latitude || 3.139, lng: event.value.longitude || 101.6869 };
      map = new google.maps.Map(mapContainer.value, { zoom: 15, center: position });
      marker = new google.maps.Marker({ position, map, draggable: true });

      marker.addListener("dragend", () => {
        const newPosition = marker.getPosition();
        event.value.latitude = newPosition.lat();
        event.value.longitude = newPosition.lng();

        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === "OK" && results[0]) {
            event.value.location = results[0].formatted_address;
          }
        });
      });

      const autocomplete = new google.maps.places.Autocomplete(document.getElementById("autocomplete"));
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          event.value.location = place.formatted_address;
          event.value.latitude = place.geometry.location.lat();
          event.value.longitude = place.geometry.location.lng();
          map.setCenter(place.geometry.location);
          marker.setPosition(place.geometry.location);
        }
      });
    });

    const uploadBanner = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!eventId) {
    console.error("Event ID is missing.");
    return;
  }

  try {
    const bannerRef = storageRef(storage, `event_banners/${eventId}_${file.name}`);
    const snapshot = await uploadBytes(bannerRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    event.value.banner_url = downloadURL;

    await updateDoc(doc(db, "events", eventId), {
      banner_url: downloadURL,
    });

  } catch (error) {
    console.error("Error uploading banner:", error);
  }
};

    const updateEvent = async () => {
      await updateDoc(doc(db, 'events', eventId), event.value);
      router.push('/manage-events');
    };

    return { event, loading, updateEvent, mapContainer, categories,uploadBanner };
  }
};
</script>


<style scoped>
.ion-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}
</style>
