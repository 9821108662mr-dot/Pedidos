import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const isOpen = ref(false)
  const isCheckoutOpen = ref(false)

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  function addItem(product) {
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      if (existing.quantity < product.stock) {
        existing.quantity++
      }
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: 1
      })
    }
    isOpen.value = true
  }

  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId)
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else if (quantity <= item.stock) {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
    isOpen.value = false
    isCheckoutOpen.value = false
  }

  function toggleCart() {
    isOpen.value = !isOpen.value
  }

  function openCheckout() {
    isCheckoutOpen.value = true
  }

  function closeCheckout() {
    isCheckoutOpen.value = false
  }

  function generateWhatsAppMessage(customerName, customerPhone) {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+529821798993'
    
    let message = `🧁 *Nuevo Pedido — Delicias Lody*\n\n`
    message += `👤 *Cliente:* ${customerName}\n`
    if (customerPhone) {
      message += `📱 *Tel:* ${customerPhone}\n`
    }
    message += `\n📋 *Productos:*\n`
    
    items.value.forEach(item => {
      message += `• ${item.quantity}x ${item.name} — $${(item.price * item.quantity).toFixed(2)}\n`
    })
    
    message += `\n💰 *Total: $${total.value.toFixed(2)} MXN*\n`
    
    const now = new Date()
    const dateStr = now.toLocaleDateString('es-MX', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
    message += `📅 ${dateStr}`
    
    const encodedMessage = encodeURIComponent(message)
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
  }

  return {
    items,
    isOpen,
    isCheckoutOpen,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCheckout,
    closeCheckout,
    generateWhatsAppMessage
  }
})
