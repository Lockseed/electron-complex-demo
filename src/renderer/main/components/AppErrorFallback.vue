<script setup>
defineProps({
  title: {
    type: String,
    default: 'Something went wrong',
  },
  message: {
    type: String,
    default:
      'The page ran into an unexpected problem. Try refreshing this window. If the issue keeps happening, please contact support.',
  },
  detail: {
    type: String,
    default: '',
  },
});

defineEmits(['reload']);
</script>

<template>
  <section
    class="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-10"
    role="alert"
    aria-live="assertive"
  >
    <div class="d-card w-full border border-error/30 bg-base-200 shadow-xl">
      <div class="d-card-body gap-5">
        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-error">Renderer Error</p>
          <h1 class="text-3xl font-bold text-base-content">{{ title }}</h1>
          <p class="text-base text-base-content/75">
            {{ message }}
          </p>
        </div>

        <div class="d-card-actions items-center justify-between gap-3">
          <button class="d-btn d-btn-error" type="button" @click="$emit('reload')">
            Reload window
          </button>
          <span class="text-sm text-base-content/60"
            >The error has been written to the renderer log.</span
          >
        </div>

        <details v-if="detail" class="rounded-box bg-base-100 p-4 text-sm text-base-content/70">
          <summary class="cursor-pointer font-semibold text-base-content">
            Technical details
          </summary>
          <pre class="mt-3 whitespace-pre-wrap break-words">{{ detail }}</pre>
        </details>
      </div>
    </div>
  </section>
</template>
