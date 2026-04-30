<template>
  <div class="product-card" :class="{ 'out-of-stock': product.stock <= 0 }">
    <div class="card-image-wrapper">
      <img 
        :src="product.image_url || defaultImage" 
        :alt="product.name" 
        class="card-image"
        loading="lazy"
      />
      <div v-if="product.stock <= 0" class="stock-overlay">
        <span>Agotado</span>
      </div>
      <div v-else-if="product.stock <= 3" class="stock-warning">
        <span>¡Últimos {{ product.stock }}!</span>
      </div>
      <div v-if="product.category" class="card-category">{{ product.category }}</div>
    </div>
    
    <div class="card-body">
      <h3 class="card-name">{{ product.name }}</h3>
      <p v-if="product.description" class="card-description">{{ product.description }}</p>
      
      <div class="card-footer">
        <div class="card-price">
          <span class="price-symbol">$</span>
          <span class="price-amount">{{ product.price.toFixed(2) }}</span>
          <span class="price-currency">MXN</span>
        </div>
        
        <button 
          v-if="product.stock > 0"
          class="add-btn"
          @click="addToCart"
          :class="{ 'added': justAdded }"
        >
          <svg v-if="!justAdded" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{{ justAdded ? '¡Listo!' : 'Agregar' }}</span>
        </button>
        <div v-else class="sold-out-badge">Agotado</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cart = useCartStore()
const justAdded = ref(false)

const defaultImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23f8e8ee" width="200" height="200"/><text x="100" y="110" text-anchor="middle" font-size="60">🧁</text></svg>')

function addToCart() {
  cart.addItem(props.product)
  justAdded.value = true
  setTimeout(() => {
    justAdded.value = false
  }, 1200)
}
</script>

<style scoped>
.product-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(236, 179, 200, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(236, 179, 200, 0.25);
  border-color: rgba(236, 179, 200, 0.4);
}

.product-card.out-of-stock {
  opacity: 0.6;
  filter: grayscale(0.3);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .card-image {
  transform: scale(1.08);
}

.stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-overlay span {
  background: rgba(255, 255, 255, 0.9);
  color: #e74c3c;
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stock-warning {
  position: absolute;
  top: 12px;
  right: 12px;
}

.stock-warning span {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.card-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.4rem;
  line-height: 1.3;
}

.card-description {
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin: 0 0 1rem;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.price-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.price-currency {
  font-size: 0.65rem;
  color: var(--color-text-light);
  font-weight: 500;
  margin-left: 2px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(236, 179, 200, 0.5);
}

.add-btn:active {
  transform: scale(0.97);
}

.add-btn.added {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.sold-out-badge {
  padding: 0.55rem 1rem;
  background: #f1f1f1;
  color: #999;
  border-radius: 14px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
