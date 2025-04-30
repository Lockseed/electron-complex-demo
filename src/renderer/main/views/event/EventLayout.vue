<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import eventService from '@/renderer/apis/eventService';

const event = ref(null);
const props = defineProps({
  id: {
    required: true,
  }
});
const router = useRouter();

onMounted(() => {
  eventService.getEvent(props.id).then((response) => {
    event.value = response.data;
  }).catch((error) => {
    console.error('Error fetching event:', error);
  });
});
</script>

<template>
  <div v-if="event">
    <h1>{{ event.title }}</h1>
    <RouterLink :to="{ name: 'EventDetails' }">Details</RouterLink> |
    <RouterLink :to="{ name: 'EventEdit' }">Edit</RouterLink> |
    <RouterLink :to="{ name: 'EventRegister' }">Register</RouterLink>
    <RouterView :event="event" />
  </div>
</template>