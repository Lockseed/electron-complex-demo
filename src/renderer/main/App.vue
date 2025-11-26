<template>
  <div id="layout" class="min-h-screen bg-base-100">
    <header class="d-navbar bg-base-200 shadow-lg sticky top-0 z-50">
      <div class="d-navbar-start">
        <div class="d-dropdown lg:hidden">
          <div tabindex="0" role="button" class="d-btn d-btn-ghost d-btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="d-menu d-menu-sm d-dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li><RouterLink :to="{ name: 'EventList' }">Events</RouterLink></li>
            <li><RouterLink :to="{ name: 'DaisyUI' }">DaisyUI</RouterLink></li>
            <li><RouterLink :to="{ name: 'About' }">About</RouterLink></li>
          </ul>
        </div>
        <a class="d-btn d-btn-ghost text-xl">Electron Demo</a>
      </div>
      <div class="d-navbar-center hidden lg:flex">
        <ul class="d-menu d-menu-horizontal px-1">
          <li><RouterLink :to="{ name: 'EventList' }">Events</RouterLink></li>
          <li><RouterLink :to="{ name: 'DaisyUI' }">DaisyUI</RouterLink></li>
          <li><RouterLink :to="{ name: 'About' }">About</RouterLink></li>
        </ul>
      </div>
      <div class="d-navbar-end">
      </div>
    </header>
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.d-navbar a.router-link-exact-active {
  color: oklch(var(--p));
  font-weight: bold;
}

.d-menu a {
  font-weight: 500;
}

.d-menu a.router-link-exact-active {
  background-color: oklch(var(--p));
  color: oklch(var(--pc));
}
</style>