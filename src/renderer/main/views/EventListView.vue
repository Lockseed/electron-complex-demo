<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import eventService from '@/renderer/apis/eventService';
import EventCard from '../components/EventCard.vue';

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
});

const page = computed(() => props.page);
const totalEvents = ref(0);
const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalEvents.value / 3);
  return page.value < totalPages;
});

// 获取事件列表
const events = ref(null);
function getEvents(page) {
  eventService
    .getEvents(3, page)
    .then((response) => {
      events.value = response.data;
      totalEvents.value = response.headers['x-total-count'];
    })
    .catch((error) => {
      console.error('Error fetching events:', error);
    });
}
onMounted(() => {
  watchEffect(() => {
    getEvents(page.value);
  });
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold text-center mb-8 text-base-content">Events for Good</h1>

    <div class="events flex flex-col gap-6 mb-8 items-center">
      <EventCard v-for="event in events" :key="event.key" :event="event" />
    </div>

    <div class="d-join grid grid-cols-2 max-w-xs mx-auto">
      <RouterLink
        v-if="page !== 1"
        :to="{ name: 'EventList', query: { page: page - 1 } }"
        class="d-join-item d-btn d-btn-outline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Previous
      </RouterLink>
      <button v-else class="d-join-item d-btn d-btn-disabled" disabled>Previous</button>

      <RouterLink
        v-if="hasNextPage"
        :to="{ name: 'EventList', query: { page: page + 1 } }"
        class="d-join-item d-btn d-btn-outline"
      >
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
      <button v-else class="d-join-item d-btn d-btn-disabled" disabled>Next</button>
    </div>
  </div>
</template>
