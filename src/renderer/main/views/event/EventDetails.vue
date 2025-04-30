<script setup>
import { computed } from 'vue';
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});
const event = computed(() => props.event);

</script>

<template>
  <div v-if="event">
    <p>{{ event.time }} on  {{ event.date }} @ {{ event.location }}</p>
    <p>{{ event.description }}</p>
  </div>
</template>