<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import eventService from '@/renderer/apis/eventService';
import EventCard from '../components/EventCard.vue';

const props = defineProps(['page']);

const page = computed(() => props.page);
const totalEvents = ref(0);
const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalEvents.value / 3);
  return page.value < totalPages;
});

// 获取事件列表
const events = ref(null);
function getEvents(page) {
  eventService.getEvents(3, page).then((response) => {
    events.value = response.data;
    totalEvents.value = response.headers['x-total-count'];
  }).catch((error) => {
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
  <h1 class="text-3xl font-bold">Events for Good</h1>
  <div class="events flex flex-col items-center">
    <EventCard v-for="event in events" :key="event.key" :event="event" />

    <div class="pagination flex flex-row items-center w-[290px]">
      <RouterLink 
        id="page-prev" 
        class="flex-auto text-left"
        v-if="page !== 1" 
        :to="{name: 'EventList', query: { page: page - 1 }}" 
      >&#60; Previous</RouterLink>
      <RouterLink 
        id="page-next" 
        class="flex-auto text-right"
        v-if="hasNextPage" 
        :to="{name: 'EventList', query: { page: page + 1 }}"
      >Next &#62;</RouterLink>
      
    </div>
  </div>
</template>