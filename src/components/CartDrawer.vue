<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.isOpen" class="cart-backdrop" @click="cart.toggleCart()"></div>
    </Transition>

    <Transition name="slide">
      <aside v-if="cart.isOpen" class="cart-drawer">
        <div class="cart-header">
          <h2>🛒 Mi Pedido</h2>
          <button class="close-btn" @click="cart.toggleCart()">✕</button>
        </div>

        <div v-if="cart.items.length === 0" class="cart-empty">
          <span class="empty-icon">🛒</span>
          <p>Tu carrito está vacío</p>
          <span class="empty-hint">Agrega postres del catálogo</span>
        </div>

        <div v-else class="cart-content">
          <ul class="cart-items">
            <li v-for="item in cart.items" :key="item.id" class="cart-item">
              <img :src="item.image_url || defaultImage" :alt="item.name" class="item-image" />
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="item-controls">
                <button class="qty-btn" @click="cart.updateQuantity(item.id, item.quantity - 1)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="cart.updateQuantity(item.id, item.quantity + 1)" :disabled="item.quantity >= item.stock">+</button>
              </div>
              <button class="remove-btn" @click="cart.removeItem(item.id)">🗑️</button>
            </li>
          </ul>

          <div class="cart-summary">
            <div class="summary-row">
              <span>Productos</span>
              <span>{{ cart.itemCount }} artículos</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span>{{ cart.acceptDelivery ? '$30.00' : '$0.00' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>${{ cart.total.toFixed(2) }} MXN</span>
            </div>
          </div>

          <div class="delivery-notice">
            <label class="checkbox-label">
              <input type="checkbox" v-model="cart.acceptDelivery" />
              <span>Acepto el costo extra de $30 MXN por servicio a domicilio</span>
            </label>
          </div>

          <button class="checkout-btn" @click="cart.openCheckout()" :disabled="!cart.acceptDelivery">
            📲 Pedir por WhatsApp
          </button>
        </div>
      </aside>
    </Transition>

    <CheckoutModal />
  </Teleport>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import CheckoutModal from './CheckoutModal.vue'

const cart = useCartStore()

const defaultImage = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23f8e8ee" width="200" height="200"/><text x="100" y="110" text-anchor="middle" font-size="60">🧁</text></svg>'
)
</script>

<style scoped>
.cart-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.cart-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 380px; max-width: 90vw;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  z-index: 201;
  display: flex; flex-direction: column;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
}

.cart-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.cart-header h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem; font-weight: 600; margin: 0;
}

.close-btn {
  background: none; border: none; cursor: pointer;
  font-size: 1.2rem; color: var(--color-text-light);
  padding: 0.4rem; border-radius: 10px;
  transition: all 0.2s;
}

.close-btn:hover { background: rgba(0,0,0,0.05); }

.cart-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem;
  color: var(--color-text-light);
}

.empty-icon { font-size: 3rem; opacity: 0.5; }
.cart-empty p { font-weight: 600; margin: 0; }
.empty-hint { font-size: 0.8rem; opacity: 0.7; }

.cart-content {
  display: flex; flex-direction: column;
  flex: 1; overflow: hidden;
}

.cart-items {
  list-style: none; padding: 0.75rem 1rem; margin: 0;
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 0.75rem;
}

.cart-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 232, 238, 0.3);
  border-radius: 14px;
  transition: all 0.2s;
}

.cart-item:hover { background: rgba(248, 232, 238, 0.5); }

.item-image {
  width: 50px; height: 50px;
  border-radius: 10px; object-fit: cover; flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }

.item-info h4 {
  font-size: 0.85rem; font-weight: 600; margin: 0 0 0.15rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.item-price {
  font-size: 0.8rem; font-weight: 600;
  color: var(--color-primary-dark);
}

.item-controls {
  display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;
}

.qty-btn {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid var(--color-border); background: white;
  cursor: pointer; font-size: 1rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.qty-value { font-weight: 600; font-size: 0.85rem; min-width: 1.5rem; text-align: center; }

.remove-btn {
  background: none; border: none; cursor: pointer;
  padding: 0.3rem; border-radius: 8px; flex-shrink: 0;
  transition: all 0.2s; font-size: 0.9rem;
}

.remove-btn:hover { background: rgba(231, 76, 60, 0.1); }

.cart-summary {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex; flex-direction: column; gap: 0.5rem;
}

.summary-row {
  display: flex; justify-content: space-between;
  font-size: 0.85rem; color: var(--color-text-light);
}

.summary-row.total {
  font-size: 1.1rem; font-weight: 700;
  color: var(--color-text);
  padding-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
}

.delivery-notice {
  margin: 0 1.5rem 1rem;
  padding: 0.8rem;
  background: rgba(248, 232, 238, 0.4);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  line-height: 1.3;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 0.1rem;
  accent-color: var(--color-primary);
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.checkout-btn {
  margin: 0 1.5rem 1.5rem; padding: 1rem;
  background: #25D366; color: white; border: none;
  border-radius: 16px; cursor: pointer;
  font-size: 1rem; font-weight: 700;
  transition: all 0.3s ease;
}

.checkout-btn:hover:not(:disabled) {
  background: #20bd5a;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #a0a0a0;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
