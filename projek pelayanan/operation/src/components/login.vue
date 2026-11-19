<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import logoPald from '@/assets/logo.png'
import bgPerumda from '@/assets/perumda.jpg'
import authServices from '@/services/auth.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Daftar role yang diizinkan masuk ke aplikasi Operator
const ALLOWED_ROLES = ['OPERATOR']

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email/Username dan Password wajib diisi!'
    return
  }

  isSubmitting.value = true
  try {
    const response = await authServices.login({
      identifier: email.value.trim(),
      password: password.value
    })

    const result = response.data?.data || response.data
    const userRole = (result?.user?.role || '').toUpperCase().trim()

    // Cek apakah role user adalah Operator
    if (!ALLOWED_ROLES.includes(userRole)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      errorMessage.value = `Akses ditolak! Akun dengan role "${result?.user?.role || 'tidak dikenali'}" tidak dapat masuk ke halaman Operator.`
      return
    }

    if (result?.token) {
      localStorage.setItem('token', result.token)
    }
    if (result?.user) {
      localStorage.setItem('user', JSON.stringify(result.user))
    }

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Username/email atau password salah.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#eef2f7] flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
    
    <!-- Container Utama Card (Mobile: Atas-Bawah, Laptop: Kiri-Kanan) -->
    <div class="w-full min-h-screen md:min-h-[560px] md:max-w-5xl bg-white md:rounded-2xl md:shadow-xl overflow-hidden flex flex-col md:flex-row">
      
      <!-- Bagian Gambar (Mobile: Di Atas dengan Wave, Laptop: Di Samping Kiri) -->
      <div class="relative w-full h-64 sm:h-72 md:h-auto md:w-1/2 shrink-0 overflow-hidden bg-[#1e4e8c]">
        <img
          :src="bgPerumda"
          alt="PERUMDA PALD Banjarmasin"
          class="w-full h-full object-cover object-center"
        />
        <!-- Overlay Biru Lembut agar Teks Terbaca -->
        <div class="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-br from-[#0f3568]/75 via-[#184e94]/50 to-transparent"></div>

        <!-- Teks & Branding di Atas Gambar -->
        <div class="absolute inset-0 p-6 md:p-10 flex flex-col justify-between text-white z-10">
          <div class="max-w-xs md:max-w-sm space-y-1.5 md:space-y-2 mt-1 md:mt-4">
            <h2 class="text-base sm:text-lg md:text-2xl font-bold leading-snug drop-shadow-xs">
              Pelayanan Pelanggan
            </h2>
            <p class="text-[11px] sm:text-xs md:text-sm text-white/90 font-normal">
              Sistem Informasi Pengelolaan Air Limbah Domestik Banjarmasin
            </p>
          </div>
        </div>

        <!-- Lengkungan Gelombang Putih Khusus Mobile di Bagian Bawah Gambar -->
        <svg
          class="md:hidden absolute -bottom-px left-0 w-full h-10 text-white"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,40 C360,130 1080,-20 1440,60 L1440,120 L0,120 Z"
          ></path>
        </svg>
      </div>

      <!-- Bagian Form Login (Mobile: Di Bawah Gambar, Laptop: Di Samping Kanan) -->
      <div class="flex-1 bg-white flex flex-col justify-center px-6 sm:px-10 md:px-12 lg:px-16 py-6 md:py-12 relative">
        
        <!-- Aksen Garis Dekorasi Pojok Kanan Atas (Khusus Laptop) -->
        <div class="hidden md:flex gap-1.5 absolute top-0 right-6 opacity-30">
          <span v-for="n in 6" :key="n" class="w-0.5 h-8 bg-[#1e5aa8] -rotate-35"></span>
        </div>

        <div class="w-full max-w-sm mx-auto">
          <!-- Logo + Nama Instansi -->
          <div class="flex items-center justify-center gap-2.5 mb-4 md:mb-6">
            <img :src="logoPald" alt="Logo PERUMDA PALD" class="w-8 h-8 md:w-9 md:h-9 object-contain" />
            <span class="font-bold text-xs md:text-sm text-[#1e4e8c] tracking-wide uppercase">
              PERUMDA PALD BANJARMASIN
            </span>
          </div>

          <!-- Judul & Subjudul -->
          <div class="text-center mb-6 md:mb-7">
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Hai, selamat datang kembali
            </h1>
            <p class="text-[11px] sm:text-xs text-gray-500 mt-1">
              Silakan masuk menggunakan akun Anda
            </p>
          </div>

          <!-- Form Login -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            
            <!-- Pesan Error -->
            <div
              v-if="errorMessage"
              class="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-lg text-center space-y-1"
            >
              <p>{{ errorMessage }}</p>
              <p class="text-[11px] text-red-500">
                Lupa akun atau kendala masuk? Silakan hubungi Admin.
              </p>
            </div>

            <!-- Input Email / Username -->
            <div class="relative flex items-center bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:border-[#1e6bd6] focus-within:ring-2 focus-within:ring-[#1e6bd6]/15 transition">
              <Mail class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                v-model="email"
                type="text"
                placeholder="Email atau Username"
                class="w-full text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            <!-- Input Password -->
            <div class="relative flex items-center bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:border-[#1e6bd6] focus-within:ring-2 focus-within:ring-[#1e6bd6]/15 transition">
              <Lock class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan kata sandi kamu"
                class="w-full text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent pr-6"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <!-- Tombol Masuk -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs sm:text-sm font-semibold py-2.5 md:py-3 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>

  </div>
</template>