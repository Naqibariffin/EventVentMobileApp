import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";
import "./style.css"; // Tailwind CSS

// ✅ Ionic Core & Essential CSS
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

// ✅ Optional Ionic Utilities
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

// ✅ Dark Mode Support
import "@ionic/vue/css/palettes/dark.system.css";

// ✅ Firebase Initialization
import "./firebase/firebase";

// ✅ Create Vue App
const app = createApp(App);

// ✅ Register Plugins
app.use(IonicVue);
app.use(router);
app.use(createPinia());

// ✅ Mount App
router.isReady().then(() => {
  app.mount("#app");
});
