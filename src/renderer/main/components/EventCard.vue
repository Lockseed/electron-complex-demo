<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <RouterLink class="event-link text-[#2c3e50]!">
    <div class="event-card p-5 w-[250px] cursor-pointer border-solid border-[#39495c] hover:scale-[1.01] hover:shadow-md">
      <h2>{{ event.title }}</h2>
      <span>@{{ event.time }} on {{ event.date }}</span>
    </div>
  </RouterLink>
</template>