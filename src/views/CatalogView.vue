<template>
  <div class="catalog-page">
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-title">
          <span class="hero-emoji">🧁</span>
          Postres Artesanales
        </h2>
        <p class="hero-subtitle">Hechos con amor, entregados con sabor</p>
      </div>
      <div class="hero-decoration"></div>
    </section>

    <section class="catalog-section">
      <div class="catalog-controls" v-if="categories.length > 1">
        <button
          v-for="cat in categories"
          :key="cat"
          class="filter-btn"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando postres...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <span class="empty-icon">🍰</span>
        <p>No hay productos disponibles en este momento</p>
      </div>

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Floating cart button (mobile) -->
    <button
      v-if="cart.itemCount > 0"
      class="floating-cart"
      @click="cart.toggleCart()"
    >
      🛒
      <span class="floating-badge">{{ cart.itemCount }}</span>
      <span class="floating-total">${{ cart.total.toFixed(2) }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'

const cart = useCartStore()
const products = ref([])
const loading = ref(true)
const selectedCategory = ref('Todos')

const categories = computed(() => {
  const cats = [...new Set(products.value.map(p => p.category).filter(Boolean))]
  const hasOffers = products.value.some(p => p.is_offer)
  const baseCats = hasOffers ? ['Todos', '🌟 Ofertas'] : ['Todos']
  return [...baseCats, ...cats]
})

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Todos') return products.value
  if (selectedCategory.value === '🌟 Ofertas') return products.value.filter(p => p.is_offer)
  return products.value.filter(p => p.category === selectedCategory.value)
})

onMounted(async () => {
  await fetchProducts()
})

async function fetchProducts() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    products.value = data || []
  } catch (e) {
    console.error('Error loading products:', e)
    products.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.catalog-page {
  padding-top: 70px;
  min-height: 100vh;
}

.hero {
  position: relative;
  padding: 3rem 1.5rem 2.5rem;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem;
}

.hero-emoji {
  -webkit-text-fill-color: initial;
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--color-text-light);
  font-weight: 400;
  margin: 0;
}

.hero-decoration {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(236,179,200,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.catalog-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.catalog-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.filter-btn {
  padding: 0.5rem 1.2rem;
  border: 2px solid var(--color-border);
  background: white;
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s;
  color: var(--color-text);
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  border-color: transparent;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-text-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.floating-cart {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.85rem 1.4rem;
  cursor: pointer;
  font-size: 1.1rem;
  display: none;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 8px 30px rgba(236,179,200,0.5);
  z-index: 50;
  animation: pop 0.3s ease;
  transition: all 0.3s;
}

.floating-cart:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(236,179,200,0.6);
}

.floating-badge {
  background: white;
  color: var(--color-primary-dark);
  font-size: 0.75rem;
  font-weight: 700;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-total {
  font-weight: 700;
  font-size: 0.9rem;
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .hero-title { font-size: 1.6rem; }
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  .floating-cart { display: flex; }
}
</style>
