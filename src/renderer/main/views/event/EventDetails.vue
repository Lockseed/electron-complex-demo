<script setup>
import { computed } from 'vue';
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});
const event = computed(() => props.event);
</script>

<template>
  <div v-if="event">
    <div class="d-card bg-base-200 shadow-lg">
      <div class="d-card-body">
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-base-content/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ event.time }}</span>
          </div>

          <div class="flex items-center gap-2 text-base-content/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ event.date }}</span>
          </div>

          <div class="flex items-center gap-2 text-base-content/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{{ event.location }}</span>
          </div>
        </div>

        <div class="d-divider"></div>

        <div class="text-base-content/80 leading-relaxed">
          {{ event.description }}
        </div>
      </div>
    </div>
  </div>
</template>
