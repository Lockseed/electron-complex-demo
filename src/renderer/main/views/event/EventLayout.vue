<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import eventService from '@/renderer/apis/eventService';

const event = ref(null);
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});
const router = useRouter();

onMounted(() => {
  eventService
    .getEvent(props.id)
    .then((response) => {
      event.value = response.data;
    })
    .catch((error) => {
      console.error('Error fetching event:', error);
    });
});
</script>

<template>
  <div v-if="event" class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-base-content mb-4">{{ event.title }}</h1>

      <div role="tablist" class="d-tabs d-tabs-box bg-base-200">
        <RouterLink
          :to="{ name: 'EventDetails' }"
          role="tab"
          class="d-tab"
          active-class="d-tab-active"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Details
        </RouterLink>
        <RouterLink
          :to="{ name: 'EventEdit' }"
          role="tab"
          class="d-tab"
          active-class="d-tab-active"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </RouterLink>
        <RouterLink
          :to="{ name: 'EventRegister' }"
          role="tab"
          class="d-tab"
          active-class="d-tab-active"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Register
        </RouterLink>
      </div>
    </div>

    <RouterView :event="event" />
  </div>
</template>
