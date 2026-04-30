<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="login-icon">🔐</span>
        <h2>Panel Admin</h2>
        <p>Delicias Lody</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="admin-email">Email</label>
          <input id="admin-email" v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label for="admin-password">Contraseña</label>
          <input id="admin-password" v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (authError) throw authError
    router.push('/admin/dashboard')
  } catch (e) {
    error.value = 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#fdf2f8,#fce7f3,#f3e8ff) }
.login-card { background:rgba(255,255,255,0.85);backdrop-filter:blur(20px);border:1px solid rgba(236,179,200,0.2);border-radius:24px;padding:2.5rem;width:400px;max-width:100%;box-shadow:0 20px 60px rgba(236,179,200,0.2) }
.login-header { text-align:center;margin-bottom:2rem }
.login-icon { font-size:2.5rem;display:block;margin-bottom:0.75rem }
.login-header h2 { font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:700;margin:0 0 0.25rem;color:var(--color-text) }
.login-header p { color:var(--color-text-light);font-size:0.85rem;margin:0 }
.login-form { display:flex;flex-direction:column;gap:1rem }
.form-group label { display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.4rem;color:var(--color-text) }
.form-group input { width:100%;padding:0.75rem 1rem;border:2px solid var(--color-border);border-radius:12px;font-size:0.9rem;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box }
.form-group input:focus { border-color:var(--color-primary) }
.error-msg { color:#e74c3c;font-size:0.8rem;margin:0;text-align:center }
.login-btn { padding:0.85rem;background:linear-gradient(135deg,var(--color-primary),var(--color-accent));color:white;border:none;border-radius:14px;cursor:pointer;font-size:0.95rem;font-weight:700;transition:all 0.3s }
.login-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 25px rgba(236,179,200,0.5) }
.login-btn:disabled { opacity:0.6;cursor:not-allowed }
</style>
