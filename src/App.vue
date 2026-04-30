<template>
  <div id="app-root">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
    <CartDrawer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import CartDrawer from './components/CartDrawer.vue'
</script>
