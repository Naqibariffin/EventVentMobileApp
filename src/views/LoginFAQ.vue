<template>
    <ion-page>
      <ion-content fullscreen class="flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <ion-grid class="h-screen flex items-center justify-center">
          <ion-row class="w-full flex justify-center">
            <ion-col size="12" size-md="8" size-lg="6">
              <div class="bg-white p-8 rounded-2xl shadow-2xl text-gray-800">
                <h2 class="text-3xl font-bold text-black-700 text-center mb-6">Login FAQ</h2>
  
                <ion-accordion-group>

<!-- Section: Account & Login -->
<h3 class="text-xl font-bold text-gray-800 mb-2 mt-4">Account & Login</h3>
<ion-accordion v-for="(faq, index) in accountFaqs" :key="'account-' + index">
  <ion-item slot="header" class="font-semibold">{{ faq.question }}</ion-item>
  <div slot="content" class="p-4 text-gray-600">{{ faq.answer }}</div>
</ion-accordion>

<!-- Section: Events & RSVPs -->
<h3 class="text-xl font-bold text-gray-800 mb-2 mt-6">Events & RSVPs</h3>
<ion-accordion v-for="(faq, index) in eventFaqs" :key="'event-' + index">
  <ion-item slot="header" class="font-semibold">{{ faq.question }}</ion-item>
  <div slot="content" class="p-4 text-gray-600">{{ faq.answer }}</div>
</ion-accordion>

</ion-accordion-group>

                <!-- More Questions? Section -->
                <div class="text-center mt-6 text-gray-700">
                  <p class="text-lg font-semibold">More Questions?</p>
                  <p class="text-sm">Email us at 
                    <a href="mailto:admin@eventvent.com" class="text-green-700 font-semibold hover:underline">admin@eventvent.com</a>
                  </p>
                </div>
  
                <!-- Back Button -->
                <div class="flex justify-center mt-6">
                  <ion-button expand="full" class="text-white font-semibold text-lg py-3 rounded-xl"
                    style="--background: #267a1e ; border: none;"
                    @click="goBack">
                    Back
                  </ion-button>
                </div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </ion-page>
</template>
  
  <script>
  import { IonPage, IonContent, IonItem, IonAccordionGroup, IonAccordion, IonButton } from "@ionic/vue";
  import { useRouter } from "vue-router";
  
  export default {
    components: { IonPage, IonContent, IonItem, IonAccordionGroup, IonAccordion, IonButton },
    setup() {
      const router = useRouter();
  
      const goBack = () => {
    router.back(); // Go to the previous page in history
  };

      return { goBack };
    },
    data() {
  return {
    accountFaqs: [
      {
        question: "I forgot my password. How can I reset it?",
        answer: "You can contact us on support which is admin@eventvent.com and we will reset the password for you.",
      },
      {
        question: "Why am I unable to log in?",
        answer: "Ensure you're entering the correct email and password. If the problem persists, try resetting your password or contacting support.",
      },
      {
        question: "Can I log in using my Google or Facebook account?",
        answer: "Currently, we only support login via email and password. Social login options may be added in future updates.",
      },
      {
        question: "Why I can't add events or open my profile?",
        answer: "You need to register and log in your account to add events or open your profile.",
      },
      {
        question: "How do I create a new account?",
        answer: "Click 'Sign Up' on the login page, fill in your details, and you can log in your account.",
      },
    ],
    eventFaqs: [
      {
        question: "How do I add a new event?",
        answer: "After logging in, navigate to the 'Add Event' page from the main menu. Fill in the event details and submit to publish your event.",
      },
      {
        question: "Can I edit an event after publishing it?",
        answer: "Yes, you can edit your event details anytime before the event date. Go to 'Manage Events' and click on the edit button below to the event you want to update.",
      },
      {
        question: "How do I delete an event I created?",
        answer: "To delete an event, go to 'Manage Events', select the event, and click the delete button. Confirm your action to remove the event permanently.",
      },
      {
        question: "How do I know if my event was successfully added?",
        answer: "After submitting your event, you’ll see a confirmation message. You can also check your event under the 'Manage Events' section.",
      },
      {
        question: "Can I see who RSVP'd to my event?",
        answer: "Yes, you can view the RSVP list for each of your events. Just click on your event and select the 'View RSVPs' tab to see attendee details.",
      },
      {
        question: "How can I view or manage RSVPs for my event?",
        answer: "Go to your 'Manage Events' and select the event you want to manage. You'll see an option to view the RSVP list and manage attendees there.",
      },
    ]
  };
},

  };
  </script>
  