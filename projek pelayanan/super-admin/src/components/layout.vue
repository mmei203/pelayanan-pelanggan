<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Tv2, Users, History, UserCircle, UserCog, LogOut, ChevronRight, Menu } from 'lucide-vue-next'
import logoPald from '@/assets/logo.png'
import authServices from '@/services/auth.js'

const router = useRouter()
const isSidebarOpen = ref(false)
const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Fungsi menutup sidebar jika menu diklik
const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Buka popup konfirmasi logout
const openLogoutModal = () => {
  closeSidebar()
  isLogoutModalOpen.value = true
}

// Tutup popup konfirmasi logout
const closeLogoutModal = () => {
  if (isLoggingOut.value) return
  isLogoutModalOpen.value = false
}

// Fungsi Logout terhubung dengan auth.js
const confirmLogout = async () => {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    if (typeof authServices.logout === 'function') {
      await authServices.logout()
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    isLoggingOut.value = false
    isLogoutModalOpen.value = false
    router.push('/')
  }
}
</script>

<template>
  <div class="h-screen w-screen bg-app-bg flex flex-col font-sans overflow-hidden">
    
    <header class="bg-app-primary2 text-white px-6 py-3.5 flex items-center justify-between shadow-md shrink-0 z-20 relative">
      
      <!-- Logo + Teks di Sebelah Kiri khusus Mobile (md:hidden) -->
      <div class="flex items-center gap-2 md:hidden">
        <img :src="logoPald" alt="PERUMDA PALD" class="h-8 w-auto object-contain" />
        <div class="flex flex-col leading-tight">
          <span class="font-bold text-xs ">PERUMDA PALD</span>
          <span class="font-bold text-xs">BANJARMASIN</span>
        </div>
      </div>

      <!-- Tombol Hamburger Menu -->
      <button 
        @click="toggleSidebar" 
        class="text-white hover:bg-black/20 p-1.5 rounded-lg transition focus:outline-none cursor-pointer ml-auto md:ml-0"
        aria-label="Toggle Navigation"
      >
        <Menu class="w-6 h-6" />
      </button>

      <!-- Logo + Teks di Sebelah Kanan khusus Laptop/Desktop (hidden md:flex) -->
      <div class="hidden md:flex items-center gap-2.5 ml-auto">
        <img :src="logoPald" alt="PERUMDA PALD" class="h-9 w-auto object-contain" />
        <div class="flex flex-col leading-tight">
          <span class="font-bold text-sm ">PERUMDA PALD</span>
          <span class="font-bold text-xs">BANJARMASIN</span>
        </div>
      </div>

      <!-- Navigasi Atas khusus Mobile (Dropdown saat tombol Menu ditekan) -->
      <transition
        enter-active-class="transition-all duration-300 ease-in-out"
        leave-active-class="transition-all duration-200 ease-in-out"
        enter-from-class="-translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-full opacity-0"
      >
        <div 
          v-if="isSidebarOpen" 
          class="md:hidden absolute top-full left-0 w-full bg-white text-gray-900 shadow-xl border-b border-gray-200 py-4 px-6 z-20"
        >
          <nav class="space-y-1">
            <router-link 
              to="/dashboard" 
              @click="closeSidebar"
              active-class="bg-app-bg text-gray-900 font-semibold rounded-xl"
              class="flex items-center justify-between px-4 py-3 text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <Tv2 class="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>

            <router-link 
              to="/daftar_pelanggan" 
              @click="closeSidebar"
              active-class="bg-app-bg text-gray-900 font-semibold rounded-xl"
              class="flex items-center justify-between px-4 py-3 text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <Users class="w-4 h-4" />
                <span>Daftar Pelanggan</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>

            <router-link 
              to="/history" 
              @click="closeSidebar"
              active-class="bg-app-bg text-gray-900 font-semibold rounded-xl"
              class="flex items-center justify-between px-4 py-3 text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <History class="w-4 h-4" />
                <span>History</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>

            <router-link 
              to="/users" 
              @click="closeSidebar"
              active-class="bg-app-bg text-gray-900 font-semibold rounded-xl"
              class="flex items-center justify-between px-4 py-3 text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <UserCog class="w-4 h-4" />
                <span>Users</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>

            <router-link 
              to="/profile" 
              @click="closeSidebar"
              active-class="bg-app-bg text-gray-900 font-semibold rounded-xl"
              class="flex items-center justify-between px-4 py-3 text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <UserCircle class="w-4 h-4" />
                <span>Profil</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>
          </nav>

          <div class="pt-3 mt-2 border-t border-gray-100 px-4">
            <button @click="openLogoutModal" type="button" class="flex items-center justify-end gap-2.5 text-red-500 font-normal text-xs w-full cursor-pointer">
              <LogOut class="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </transition>
    </header>

    <!-- Main Container Bawah Header -->
    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- Overlay latar belakang hitam khusus mobile saat menu terbuka -->
      <div 
        v-if="isSidebarOpen" 
        @click="closeSidebar" 
        class="md:hidden fixed inset-0 bg-black/30 z-10"
      ></div>

      <!-- Sidebar Navigasi (Hanya muncul di Laptop / Layar md ke atas) -->
      <transition 
        enter-active-class="transition-all duration-300 ease-in-out"
        leave-active-class="transition-all duration-200 ease-in-out"
        enter-from-class="-ml-55 opacity-0"
        enter-to-class="ml-0 opacity-100"
        leave-from-class="ml-0 opacity-100"
        leave-to-class="-ml-55 opacity-0"
      >
        <aside 
          v-if="isSidebarOpen" 
          class="hidden md:flex w-55 bg-white border-r border-gray-300 pt-6 pb-6 flex-col justify-between shrink-0 overflow-y-auto"
        >
          <!-- Top Menu Items -->
          <nav class="space-y-2 pr-0 pl-3">
            
            <!-- Dashboard -->
            <router-link 
              to="/dashboard" 
              active-class="bg-app-bg text-gray-900 shadow-sm rounded-l-full font-normal"
              class="flex items-center justify-between px-4 py-3 transition-all group"
            >
              <div class="flex items-center gap-3">
                <Tv2 class="w-4 h-4" />
                <span class="text-xs font-normal">Dashboard</span>
              </div>
              <ChevronRight class="w-4 h-4" />
            </router-link>

            <!-- Daftar Pelanggan -->
            <router-link 
              to="/daftar_pelanggan" 
              active-class="bg-app-bg text-gray-900 shadow-sm rounded-l-full font-normal"
              class="flex items-center justify-between px-4 py-3 transition-all group"
            >
              <div class="flex items-center gap-3">
                <Users class="w-4 h-4" />
                <span class="text-xs font-normal">Daftar Pelanggan</span>
              </div>
              <ChevronRight class="w-4 h-4" />
            </router-link>

            <!-- History -->
            <router-link 
              to="/history" 
              active-class="bg-app-bg text-gray-900 shadow-sm rounded-l-full font-normal"
              class="flex items-center justify-between px-4 py-3 transition-all group"
            >
              <div class="flex items-center gap-3">
                <History class="w-4 h-4" />
                <span class="text-xs font-normal">History</span>
              </div>
              <ChevronRight class="w-4 h-4" />
            </router-link>

            <!-- Users -->
            <router-link 
              to="/users" 
              active-class="bg-app-bg text-gray-900 shadow-sm rounded-l-full font-normal"
              class="flex items-center justify-between px-4 py-3 transition-all group"
            >
              <div class="flex items-center gap-3">
                <UserCog class="w-4 h-4" />
                <span class="text-xs font-normal">Users</span>
              </div>
              <ChevronRight class="w-4 h-4" />
            </router-link>

            <!-- Profil -->
            <router-link 
              to="/profile" 
              active-class="bg-app-bg text-gray-900 shadow-sm rounded-l-full font-normal"
              class="flex items-center justify-between px-4 py-3 transition-all group"
            >
              <div class="flex items-center gap-3">
                <UserCircle class="w-4 h-4" />
                <span class="text-xs font-normal">Profil</span>
              </div>
              <ChevronRight class="w-4 h-4" />
            </router-link>

          </nav>

          <!-- Bottom Menu: Log Out -->
          <div class="px-2">
            <button @click="openLogoutModal" type="button" class="flex items-center justify-end gap-2.5 text-red-500 font-normal text-sm hover:opacity-80 transition w-full cursor-pointer">
              <LogOut class="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

        </aside>
      </transition>

      <main class="flex-1 p-4 md:p-8 overflow-y-auto">
        <slot></slot>
      </main>
    </div>

    <!-- Popup Konfirmasi Logout -->
    <Teleport to="body">
      <div 
        v-if="isLogoutModalOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden">
          <div class="bg-app-primary2 px-5 py-3">
            <h3 class="text-white font-semibold text-sm">Konfirmasi Keluar</h3>
          </div>

          <div class="p-5 space-y-4">
            <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun ini?
            </p>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button 
                type="button" 
                @click="closeLogoutModal" 
                :disabled="isLoggingOut"
                class="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button" 
                @click="confirmLogout" 
                :disabled="isLoggingOut"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
              >
                {{ isLoggingOut ? 'Keluar...' : 'Ya, Keluar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>