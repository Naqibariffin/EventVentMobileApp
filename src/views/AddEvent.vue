<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          Add Events
        </IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="p-6 bg-gray-100">
  <!-- Event Banner Preview -->
  <div class="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-6">
    <h2 class="text-lg font-semibold text-gray-700 mb-2">Banner Preview</h2>
    <div class="flex justify-center">
      <img 
        v-if="event.banner_url" 
        :src="event.banner_url" 
        alt="Event Banner" 
        class="w-full max-h-56 object-cover rounded-lg shadow-md border border-gray-300" 
      />
    </div>
  </div>

  <!-- Upload Banner -->
  <IonItem class="rounded-lg shadow-md bg-white mb-6">
    <IonLabel>Upload Banner</IonLabel>
    <input type="file" @change="uploadBanner" accept="image/*" class="ml-4 text-sm" />
  </IonItem>

  <!-- Event Form -->
  <form @submit.prevent="addEvent" class="mx-auto max-w-lg space-y-5 bg-white p-6 rounded-lg shadow-md">
    <IonItem>
      <IonLabel position="stacked">Event Name</IonLabel>
      <IonInput v-model="event.event_name" class="text-sm" />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Category</IonLabel>
      <IonSelect v-model="event.category"  placeholder="Select Category">
        <IonSelectOption v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </IonSelectOption>
      </IonSelect>
    </IonItem>

    <!-- Location with Google Places API -->
    <IonItem>
      <IonLabel position="stacked">Location</IonLabel>
      <input 
        id="autocomplete" 
        type="text" 
        disabled 
        v-model="event.location" 
        class="ion-input w-full p-2 border border-gray-300 rounded-lg" 
      />
    </IonItem>

    <!-- Google Map -->
    <div ref="mapContainer" id="map" class="w-full h-64 my-4 rounded-lg shadow-md border border-gray-300"></div>

    <IonItem>
      <IonLabel position="stacked">Short Description</IonLabel>
      <IonTextarea v-model="event.short_desc" class="text-sm" />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Long Description</IonLabel>
      <IonTextarea v-model="event.long_desc"  class="text-sm" />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Start Date & Time</IonLabel>
      <IonDatetime v-model="event.start_date" display-format="YYYY-MM-DDTHH:mm" />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">End Date & Time</IonLabel>
      <IonDatetime v-model="event.end_date" display-format="YYYY-MM-DDTHH:mm" />
    </IonItem>

    <IonItem>
      <IonLabel>Enable RSVP</IonLabel>
      <IonToggle v-model="event.enable_rsvp" />
    </IonItem>

    <IonItem v-if="event.enable_rsvp">
      <IonLabel position="stacked">Available Slots</IonLabel>
      <IonInput type="number" v-model.number="event.slots" min="1" class="text-sm" />
    </IonItem>

    <!-- Submit Button -->
    <IonButton expand="full" type="submit" class="mt-4" style="--background: #064e3b; --color: white;">
      Add Event
    </IonButton>
  </form>
  
</IonContent>
<IonToast
  :is-open="showToast"
  :message="toastMessage"
  :duration="3000"
  @didDismiss="showToast = false"
  position="top"
  background-color: white
/>

  </IonPage>
</template>


<script>
import { ref, onMounted } from "vue";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetime, IonToast, IonToggle, IonButton} from '@ionic/vue'
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader } from "@googlemaps/js-api-loader";

export default {
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetime, IonToast, IonToggle, IonButton
  },
  setup() {
    const router = useRouter();

    const categories = ref(["Fitness", "Art", "Music", "Tech", "Education", "Food", "Charity", "Fashion", "Games", "Social", "Others"]);
    const event = ref({
      event_name: "",
      category: "",
      location: "",
      latitude: null,
      longitude: null,
      short_desc: "",
      long_desc: "",
      start_date: "",
      end_date: "",
      enable_rsvp: false,
      slots: 1,
      banner_url: "",
      created_at: serverTimestamp(),
    });

    const showToast = ref(false);
    const toastMessage = ref("");

    const auth = getAuth();
    const currentUser = ref(null);

    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
    });

    const mapContainer = ref(null);
    let map, marker, geocoder;

    onMounted(async () => {
      try {
        const loader = new Loader({ apiKey: "AIzaSyDWxRiZzG2KuG1l4SIjJwvnxDyxNazH3Kk", version: "weekly", libraries: ["places"] });
        const google = await loader.load();
        geocoder = new google.maps.Geocoder();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
            event.value.latitude = userPosition.lat;
            event.value.longitude = userPosition.lng;

            map = new google.maps.Map(mapContainer.value, { zoom: 15, center: userPosition });
            marker = new google.maps.Marker({ position: userPosition, map, draggable: true, title: "Event Location" });

            geocoder.geocode({ location: userPosition }, (results, status) => {
              if (status === "OK" && results[0]) {
                event.value.location = results[0].formatted_address;
              }
            });

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
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    });

    const showCustomToast = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };

    const uploadBanner = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fileRef = storageRef(storage, `event_banners/${file.name}`);
      try {
        const snapshot = await uploadBytes(fileRef, file);
        event.value.banner_url = await getDownloadURL(snapshot.ref);
        showCustomToast("Banner uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        showCustomToast("Failed to upload banner.");
      }
    };

    const addEvent = async (e) => {
      e.preventDefault(); 

      if (!currentUser.value) {
        showCustomToast("You need to be logged in to add an event!");
        return;
      }

      // Validate required fields
      if (
        !event.value.event_name ||
        !event.value.category ||
        !event.value.location ||
        !event.value.short_desc ||
        !event.value.start_date ||
        !event.value.end_date ||
        (event.value.enable_rsvp && !event.value.slots) ||
        !event.value.banner_url
      ) {
        showCustomToast("Please fill in all required fields!");
        return;
      }

      try {
        await addDoc(collection(db, "events"), {
          ...event.value,
          user_id: currentUser.value.uid,
          added_by: currentUser.value.email,
          created_at: serverTimestamp(),
        });

        showCustomToast("Event added successfully!");

        event.value = {
        event_name: "",
        category: "",
        location: "",
        latitude: null,
        longitude: null,
        short_desc: "",
        long_desc: "",
        start_date: "",
        end_date: "",
        enable_rsvp: false,
        slots: 1,
        banner_url: "",
        created_at: serverTimestamp(),
    };


        setTimeout(() => router.push("/home"), 3000);
      } catch (error) {
        console.error("Error adding event:", error);
        showCustomToast("Error adding event. Please try again.");
      }
    };

    return {
      event,
      mapContainer,
      categories,
      uploadBanner,
      addEvent,
      showToast,
      toastMessage,
    };
  },
};
</script>

<style scoped>
form {
  max-width: 500px;
  margin: auto;
}
</style>
