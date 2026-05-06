<template>
  <div class="admin-page">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span>🧁</span>
        <h2>Admin</h2>
      </div>
      <nav class="sidebar-nav">
        <button :class="{active: tab==='products'}" @click="tab='products'">📦 Productos</button>
        <button :class="{active: tab==='orders'}" @click="tab='orders'">📋 Pedidos</button>
        <button :class="{active: tab==='add'}" @click="openAddForm">➕ Agregar</button>
      </nav>
      <button class="logout-btn" @click="logout">🚪 Salir</button>
    </aside>

    <main class="admin-main">
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-icon">📦</span>
          <div><div class="stat-value">{{ products.length }}</div><div class="stat-label">Productos</div></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⚠️</span>
          <div><div class="stat-value">{{ lowStockCount }}</div><div class="stat-label">Stock bajo</div></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📋</span>
          <div><div class="stat-value">{{ orders.length }}</div><div class="stat-label">Pedidos</div></div>
        </div>
      </div>

      <!-- Add/Edit Product Form -->
      <div v-if="tab==='add'" class="form-section">
        <h3>{{ editingProduct ? 'Editar Producto' : 'Agregar Producto' }}</h3>
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.name" required placeholder="Ej: Pastel de Chocolate" />
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <input v-model="form.category" placeholder="Ej: Pasteles" />
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_offer" />
              <span>🌟 Marcar como "Oferta del día"</span>
            </label>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="2" placeholder="Descripción del postre..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio (MXN) *</label>
              <input v-model.number="form.price" type="number" min="0" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Stock *</label>
              <input v-model.number="form.stock" type="number" min="0" required />
            </div>
          </div>
          <div class="form-group">
            <label>URL de imagen</label>
            <input v-model="form.image_url" type="url" placeholder="https://..." />
            <small>Sube tu imagen a Supabase Storage y pega la URL aquí</small>
          </div>
          <div class="form-group">
            <label>Imagen (subir archivo)</label>
            <input type="file" accept="image/*" @change="handleFileUpload" ref="fileInput" />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Producto' }}
            </button>
            <button type="button" class="cancel-btn" @click="resetForm">Cancelar</button>
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
        </form>
      </div>

      <!-- Products Table -->
      <div v-if="tab==='products'" class="table-section">
        <h3>📦 Productos</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id" :class="{'low-stock': p.stock <= 3 && p.stock > 0, 'no-stock': p.stock <= 0}">
                <td><img :src="p.image_url || defaultImg" class="table-img" /></td>
                <td class="product-name">{{ p.name }}</td>
                <td>{{ p.category || '—' }}</td>
                <td>${{ p.price.toFixed(2) }}</td>
                <td><span class="stock-pill" :class="stockClass(p.stock)">{{ p.stock }}</span></td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn edit" @click="editProduct(p)">✏️</button>
                    <button class="action-btn delete" @click="deleteProduct(p.id)">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length===0"><td colspan="6" class="empty-row">No hay productos</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Orders Table -->
      <div v-if="tab==='orders'" class="table-section">
        <h3>📋 Pedidos</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id">
                <td>{{ formatDate(o.created_at) }}</td>
                <td>{{ o.customer_name }}</td>
                <td class="order-items">
                  <span v-for="item in parseItems(o.items)" :key="item.name" class="order-item-pill">
                    {{ item.quantity }}x {{ item.name }}
                  </span>
                </td>
                <td class="order-total">${{ o.total.toFixed(2) }}</td>
                <td><span class="status-pill" :class="o.status">{{ o.status }}</span></td>
              </tr>
              <tr v-if="orders.length===0"><td colspan="5" class="empty-row">No hay pedidos</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const tab = ref('products')
const products = ref([])
const orders = ref([])
const editingProduct = ref(null)
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')
const fileInput = ref(null)

const form = ref({ name:'', description:'', price:0, stock:0, category:'', image_url:'', is_offer:false })

const defaultImg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23f8e8ee" width="80" height="80" rx="8"/><text x="40" y="48" text-anchor="middle" font-size="28">🧁</text></svg>')

const lowStockCount = computed(() => products.value.filter(p => p.stock <= 3 && p.stock > 0).length)

function stockClass(stock) {
  if (stock <= 0) return 'out'
  if (stock <= 3) return 'low'
  return 'ok'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function parseItems(items) {
  try { return typeof items === 'string' ? JSON.parse(items) : items }
  catch { return [] }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchOrders()])
})

async function fetchProducts() {
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  products.value = data || []
}

async function fetchOrders() {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  orders.value = data || []
}

function openAddForm() {
  editingProduct.value = null
  form.value = { name:'', description:'', price:0, stock:0, category:'', image_url:'', is_offer:false }
  formError.value = ''
  formSuccess.value = ''
  tab.value = 'add'
}

function editProduct(p) {
  editingProduct.value = p.id
  form.value = { name:p.name, description:p.description||'', price:p.price, stock:p.stock, category:p.category||'', image_url:p.image_url||'', is_offer:p.is_offer||false }
  tab.value = 'add'
}

function resetForm() {
  editingProduct.value = null
  form.value = { name:'', description:'', price:0, stock:0, category:'', image_url:'', is_offer:false }
  tab.value = 'products'
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from('product-images').upload(fileName, file)
  if (error) { formError.value = 'Error al subir imagen'; return }
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
  form.value.image_url = urlData.publicUrl
  formSuccess.value = 'Imagen subida ✓'
}

async function saveProduct() {
  saving.value = true
  formError.value = ''
  formSuccess.value = ''
  try {
    const payload = { 
      name: form.value.name, description: form.value.description,
      price: form.value.price, stock: form.value.stock,
      category: form.value.category, image_url: form.value.image_url,
      is_offer: form.value.is_offer,
      active: true
    }
    if (editingProduct.value) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.value)
      if (error) throw error
      formSuccess.value = 'Producto actualizado ✓'
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) throw error
      formSuccess.value = 'Producto creado ✓'
    }
    await fetchProducts()
    setTimeout(() => { resetForm() }, 1000)
  } catch (e) {
    formError.value = 'Error: ' + e.message
  } finally {
    saving.value = false
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return
  await supabase.from('products').delete().eq('id', id)
  await fetchProducts()
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/admin')
}
</script>

<style scoped>
.admin-page { display:flex;min-height:100vh;padding-top:70px }
.admin-sidebar { width:220px;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-right:1px solid var(--color-border);padding:1.5rem 1rem;display:flex;flex-direction:column;position:fixed;top:70px;bottom:0;left:0;z-index:50 }
.sidebar-brand { display:flex;align-items:center;gap:0.5rem;margin-bottom:2rem }
.sidebar-brand span { font-size:1.5rem }
.sidebar-brand h2 { font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;margin:0;color:var(--color-primary-dark) }
.sidebar-nav { display:flex;flex-direction:column;gap:0.4rem;flex:1 }
.sidebar-nav button { background:none;border:none;padding:0.7rem 1rem;border-radius:12px;cursor:pointer;font-size:0.85rem;font-weight:500;text-align:left;transition:all 0.2s;color:var(--color-text) }
.sidebar-nav button:hover { background:rgba(236,179,200,0.1) }
.sidebar-nav button.active { background:linear-gradient(135deg,var(--color-primary),var(--color-accent));color:white }
.logout-btn { background:none;border:1px solid var(--color-border);padding:0.6rem;border-radius:10px;cursor:pointer;font-size:0.8rem;transition:all 0.2s;color:var(--color-text-light) }
.logout-btn:hover { border-color:#e74c3c;color:#e74c3c }
.admin-main { flex:1;margin-left:220px;padding:2rem }
.stats-row { display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem }
.stat-card { background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border:1px solid var(--color-border);border-radius:16px;padding:1.2rem;display:flex;align-items:center;gap:1rem }
.stat-icon { font-size:1.8rem }
.stat-value { font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:700;color:var(--color-text) }
.stat-label { font-size:0.75rem;color:var(--color-text-light);font-weight:500 }
.form-section,.table-section { background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border:1px solid var(--color-border);border-radius:20px;padding:1.5rem;margin-bottom:1.5rem }
.form-section h3,.table-section h3 { font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:600;margin:0 0 1.25rem }
.product-form { display:flex;flex-direction:column;gap:1rem }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:1rem }
.form-group label { display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.3rem;color:var(--color-text) }
.form-group input,.form-group textarea { width:100%;padding:0.65rem 0.9rem;border:2px solid var(--color-border);border-radius:10px;font-size:0.85rem;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box }
.form-group input:focus,.form-group textarea:focus { border-color:var(--color-primary) }
.form-group small { font-size:0.7rem;color:var(--color-text-light);margin-top:0.2rem;display:block }
.checkbox-group { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.checkbox-label { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: var(--color-primary-dark); background: rgba(236,179,200,0.15); padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid rgba(236,179,200,0.3); transition: all 0.2s; }
.checkbox-label:hover { background: rgba(236,179,200,0.25); }
.checkbox-label input { width: auto !important; margin: 0; cursor: pointer; }
.form-actions { display:flex;gap:0.75rem }
.save-btn { padding:0.7rem 1.5rem;background:linear-gradient(135deg,var(--color-primary),var(--color-accent));color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;transition:all 0.3s }
.save-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 6px 20px rgba(236,179,200,0.4) }
.save-btn:disabled { opacity:0.6 }
.cancel-btn { padding:0.7rem 1.5rem;background:none;border:2px solid var(--color-border);border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;color:var(--color-text-light);transition:all 0.2s }
.cancel-btn:hover { border-color:var(--color-text) }
.error-msg { color:#e74c3c;font-size:0.8rem;margin:0 }
.success-msg { color:#27ae60;font-size:0.8rem;margin:0 }
.table-wrapper { overflow-x:auto }
table { width:100%;border-collapse:collapse;font-size:0.85rem }
th { text-align:left;padding:0.75rem;font-weight:600;font-size:0.75rem;color:var(--color-text-light);text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid var(--color-border) }
td { padding:0.65rem 0.75rem;border-bottom:1px solid var(--color-border);vertical-align:middle }
tr:hover { background:rgba(248,232,238,0.2) }
.table-img { width:40px;height:40px;border-radius:8px;object-fit:cover }
.product-name { font-weight:600 }
.stock-pill { padding:0.2rem 0.6rem;border-radius:20px;font-weight:600;font-size:0.75rem }
.stock-pill.ok { background:#d4edda;color:#155724 }
.stock-pill.low { background:#fff3cd;color:#856404 }
.stock-pill.out { background:#f8d7da;color:#721c24 }
.actions-cell { display:flex;gap:0.3rem }
.action-btn { background:none;border:none;cursor:pointer;padding:0.3rem;border-radius:6px;transition:background 0.2s }
.action-btn:hover { background:rgba(0,0,0,0.05) }
.order-items { display:flex;flex-wrap:wrap;gap:0.3rem }
.order-item-pill { background:rgba(248,232,238,0.5);padding:0.15rem 0.5rem;border-radius:8px;font-size:0.75rem }
.order-total { font-weight:700;color:var(--color-primary-dark) }
.status-pill { padding:0.2rem 0.6rem;border-radius:20px;font-size:0.7rem;font-weight:600;text-transform:capitalize }
.status-pill.enviado { background:#d4edda;color:#155724 }
.status-pill.completado { background:#cce5ff;color:#004085 }
.status-pill.cancelado { background:#f8d7da;color:#721c24 }
.empty-row { text-align:center;color:var(--color-text-light);padding:2rem!important }
tr.low-stock { background:rgba(255,243,205,0.3) }
tr.no-stock { background:rgba(248,215,218,0.2) }
@media (max-width:768px) {
  .admin-sidebar { width:100%;position:relative;top:0;flex-direction:row;align-items:center;padding:0.75rem;gap:0.5rem;border-right:none;border-bottom:1px solid var(--color-border) }
  .admin-page { flex-direction:column }
  .admin-main { margin-left:0 }
  .sidebar-brand { margin:0 }
  .sidebar-nav { flex-direction:row;flex:1;justify-content:center }
  .form-row { grid-template-columns:1fr }
}
</style>
