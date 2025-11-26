<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <RouterLink :to="{ name: 'EventDetails', params: { id: event.id } }" class="block w-96">
    <div class="d-card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300">
      <div class="d-card-body">
        <h2 class="d-card-title text-lg truncate">
          {{ event.title }}
        </h2>
        <div class="flex items-center gap-2 text-sm text-base-content/70 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ event.time }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-base-content/70">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ event.date }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>