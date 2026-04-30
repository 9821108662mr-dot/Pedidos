<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="navbar-brand">
        <span class="brand-icon">🧁</span>
        <div class="brand-text">
          <h1>Delicias Lody</h1>
          <span class="brand-tagline">Postres Artesanales</span>
        </div>
      </RouterLink>

      <nav class="navbar-links">
        <RouterLink to="/" class="nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Catálogo
        </RouterLink>
        <RouterLink to="/admin" class="nav-link nav-link--admin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Admin
        </RouterLink>
      </nav>

      <button class="cart-toggle" @click="cart.toggleCart()" :class="{ 'has-items': cart.itemCount > 0 }">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span v-if="cart.itemCount > 0" class="cart-badge">{{ cart.itemCount }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(236, 179, 200, 0.3);
  padding: 0 1.5rem;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.brand-icon {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.brand-text h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 0.7rem;
  color: var(--color-text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(236, 179, 200, 0.15);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background: rgba(236, 179, 200, 0.2);
  color: var(--color-primary);
}

.nav-link--admin {
  font-size: 0.8rem;
  opacity: 0.7;
}

.nav-link--admin:hover {
  opacity: 1;
}

.cart-toggle {
  position: relative;
  background: none;
  border: 2px solid var(--color-border);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 14px;
  color: var(--color-text);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}

.cart-toggle.has-items {
  border-color: var(--color-primary);
  background: rgba(236, 179, 200, 0.1);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@media (max-width: 600px) {
  .navbar-links {
    display: none;
  }

  .brand-text h1 {
    font-size: 1.15rem;
  }

  .brand-tagline {
    font-size: 0.6rem;
  }
}
</style>
