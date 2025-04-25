<template>
  <div id="layout" class="text-center">
    <header>
      <nav class="p-8">
        <RouterLink :to="{ name: 'EventList' }">Events</RouterLink>
        <RouterLink :to="{ name: 'About' }">About</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style>
#layout {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

nav a {
  font-weight: bold;
  color: var(--color-text);
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>