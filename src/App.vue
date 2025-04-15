<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
    <Navigation />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import Navigation from '@/components/Navigation.vue';

export default {
  components: { IonApp, IonRouterOutlet, Navigation },
};
</script>