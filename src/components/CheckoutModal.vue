<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.isCheckoutOpen" class="modal-backdrop" @click="cart.closeCheckout()"></div>
    </Transition>
    <Transition name="modal">
      <div v-if="cart.isCheckoutOpen" class="checkout-modal">
        <div class="modal-header">
          <h2>📋 Confirmar Pedido</h2>
          <button class="close-btn" @click="cart.closeCheckout()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="customer-name">Tu nombre *</label>
            <input id="customer-name" v-model="customerName" type="text" placeholder="Ej: María García" required />
          </div>
          <div class="form-group">
            <label for="customer-phone">Tu teléfono (opcional)</label>
            <input id="customer-phone" v-model="customerPhone" type="tel" placeholder="Ej: 9821234567" />
          </div>
          <div class="order-summary">
            <h3>Resumen</h3>
            <ul>
              <li v-for="item in cart.items" :key="item.id">
                {{ item.quantity }}x {{ item.name }} — ${{ (item.price * item.quantity).toFixed(2) }}
              </li>
            </ul>
            <div class="order-total">Total: ${{ cart.total.toFixed(2) }} MXN</div>
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <button class="whatsapp-btn" @click="sendOrder" :disabled="sending">
            <span v-if="sending">Procesando...</span>
            <span v-else>📲 Enviar por WhatsApp</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { supabase } from '@/lib/supabase'

const cart = useCartStore()
const customerName = ref('')
const customerPhone = ref('')
const error = ref('')
const sending = ref(false)

async function sendOrder() {
  if (!customerName.value.trim()) {
    error.value = 'Por favor ingresa tu nombre'
    return
  }
  error.value = ''
  sending.value = true

  try {
    // Save order and update stock in Supabase
    const orderItems = cart.items.map(i => ({
      product_id: i.id, name: i.name,
      quantity: i.quantity, price: i.price
    }))

    // Update stock for each item
    for (const item of cart.items) {
      const { error: stockErr } = await supabase.rpc('decrement_stock', {
        p_id: item.id, qty: item.quantity
      })
      if (stockErr) {
        // Fallback: direct update
        const { data: prod } = await supabase
          .from('products').select('stock').eq('id', item.id).single()
        if (prod && prod.stock >= item.quantity) {
          await supabase.from('products')
            .update({ stock: prod.stock - item.quantity })
            .eq('id', item.id)
        } else {
          error.value = `Stock insuficiente para ${item.name}`
          sending.value = false
          return
        }
      }
    }

    // Save order record
    await supabase.from('orders').insert({
      customer_name: customerName.value.trim(),
      customer_phone: customerPhone.value.trim(),
      items: JSON.stringify(orderItems),
      total: cart.total,
      status: 'enviado'
    })

    // Open WhatsApp
    const url = cart.generateWhatsAppMessage(
      customerName.value.trim(), customerPhone.value.trim()
    )
    window.location.href = url

    // Clear cart
    cart.clearCart()
    customerName.value = ''
    customerPhone.value = ''
  } catch (e) {
    error.value = 'Error al procesar el pedido. Intenta de nuevo.'
    console.error(e)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:300 }
.checkout-modal { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:24px;width:420px;max-width:92vw;max-height:85vh;overflow-y:auto;z-index:301;box-shadow:0 25px 60px rgba(0,0,0,0.2) }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid var(--color-border) }
.modal-header h2 { font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:600;margin:0 }
.close-btn { background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--color-text-light);padding:0.3rem 0.5rem;border-radius:8px }
.close-btn:hover { background:rgba(0,0,0,0.05) }
.modal-body { padding:1.5rem }
.form-group { margin-bottom:1rem }
.form-group label { display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.4rem;color:var(--color-text) }
.form-group input { width:100%;padding:0.75rem 1rem;border:2px solid var(--color-border);border-radius:12px;font-size:0.9rem;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box }
.form-group input:focus { border-color:var(--color-primary) }
.order-summary { background:rgba(248,232,238,0.3);border-radius:14px;padding:1rem;margin:1rem 0 }
.order-summary h3 { font-size:0.85rem;font-weight:600;margin:0 0 0.5rem;color:var(--color-text-light);text-transform:uppercase;letter-spacing:0.5px }
.order-summary ul { list-style:none;padding:0;margin:0 }
.order-summary li { font-size:0.85rem;padding:0.3rem 0;color:var(--color-text);border-bottom:1px dashed var(--color-border) }
.order-summary li:last-child { border:none }
.order-total { font-weight:700;font-size:1.05rem;margin-top:0.6rem;padding-top:0.6rem;border-top:2px solid var(--color-border);color:var(--color-primary-dark) }
.error-msg { color:#e74c3c;font-size:0.8rem;font-weight:500;margin:0.5rem 0 }
.whatsapp-btn { width:100%;padding:1rem;background:#25D366;color:white;border:none;border-radius:16px;cursor:pointer;font-size:1rem;font-weight:700;transition:all 0.3s }
.whatsapp-btn:hover:not(:disabled) { background:#20bd5a;transform:translateY(-2px);box-shadow:0 8px 25px rgba(37,211,102,0.4) }
.whatsapp-btn:disabled { opacity:0.6;cursor:not-allowed }
.fade-enter-active,.fade-leave-active { transition:opacity 0.3s }
.fade-enter-from,.fade-leave-to { opacity:0 }
.modal-enter-active,.modal-leave-active { transition:all 0.3s ease }
.modal-enter-from,.modal-leave-to { opacity:0;transform:translate(-50%,-50%) scale(0.9) }
</style>
