<script setup>
import { ref, computed, onMounted } from 'vue'
import { User, Mail, AtSign, Shield, Lock, Eye, EyeOff, AlertCircle, X, ChevronLeft } from 'lucide-vue-next'
import Layout from './layout.vue'
import authServices from '@/services/auth.js'

const isSaving = ref(false)
const isEditModalOpen = ref(false)
const isMobileEditPage = ref(false)
const errorMessage = ref('')
const modalErrorMessage = ref('')

// Data Profil yang ditampilkan
const profile = ref({
  namaUser: '',
  username: '',
  email: '',
  role: '',
  createdAt: ''
})

// Data Form Edit
const form = ref({
  namaUser: '',
  username: '',
  email: '',
  oldPassword: '',
  newPassword: ''
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)

// Format Role tanpa tanda "-" maupun "_" (misal: Super_Admin -> Super Admin)
const formattedRole = computed(() => {
  if (!profile.value.role) return 'USER'
  return profile.value.role.replace(/[-_]/g, ' ')
})

// Inisial nama untuk foto/avatar profil
const userInitials = computed(() => {
  const name = (profile.value.namaUser || profile.value.username || 'U').trim()
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Format tanggal bergabung
const formattedCreatedAt = computed(() => {
  if (!profile.value.createdAt) return '-'
  try {
    return new Date(profile.value.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return profile.value.createdAt
  }
})

// Ambil data profil langsung dari localStorage (hasil login)
const loadProfileFromStorage = () => {
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
  profile.value.namaUser = savedUser.namaUser || ''
  profile.value.username = savedUser.username || ''
  profile.value.email = savedUser.email || ''
  profile.value.role = savedUser.role || ''
  profile.value.createdAt = savedUser.createdAt || ''
}

// Buka Form Edit (Mobile -> Halaman Baru, Laptop -> Pop-up Modal)
const openEdit = () => {
  modalErrorMessage.value = ''
  form.value.namaUser = profile.value.namaUser
  form.value.username = profile.value.username
  form.value.email = profile.value.email
  form.value.oldPassword = ''
  form.value.newPassword = ''
  showOldPassword.value = false
  showNewPassword.value = false

  if (window.innerWidth < 768) {
    isMobileEditPage.value = true
  } else {
    isEditModalOpen.value = true
  }
}

// Tutup Form Edit
const closeEdit = () => {
  if (isSaving.value) return
  isEditModalOpen.value = false
  isMobileEditPage.value = false
  modalErrorMessage.value = ''
}

// Simpan perubahan ke PUT /api/auth/profile
const handleUpdateProfile = async () => {
  modalErrorMessage.value = ''
  errorMessage.value = ''

  if (!form.value.namaUser.trim() || !form.value.username.trim() || !form.value.email.trim()) {
    modalErrorMessage.value = 'Nama lengkap, username, dan email wajib diisi!'
    return
  }

  if (form.value.newPassword && !form.value.oldPassword) {
    modalErrorMessage.value = 'Password lama wajib diisi jika ingin mengganti password!'
    return
  }

  if (form.value.oldPassword && !form.value.newPassword) {
    modalErrorMessage.value = 'Password baru wajib diisi!'
    return
  }

  const payload = {
    namaUser: form.value.namaUser.trim(),
    username: form.value.username.trim(),
    email: form.value.email.trim()
  }

  if (form.value.oldPassword && form.value.newPassword) {
    payload.oldPassword = form.value.oldPassword
    payload.newPassword = form.value.newPassword
  }

  isSaving.value = true
  try {
    const response = await authServices.updateProfile(payload)
    const result = response.data?.data || response.data

    if (result?.token) {
      localStorage.setItem('token', result.token)
    }

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const updatedUser = {
      ...savedUser,
      ...(result?.user || {}),
      namaUser: result?.user?.namaUser || payload.namaUser,
      username: result?.user?.username || payload.username,
      email: result?.user?.email || payload.email
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    loadProfileFromStorage()

    isEditModalOpen.value = false
    isMobileEditPage.value = false
  } catch (error) {
    modalErrorMessage.value = error.response?.data?.message || 'Gagal memperbarui profil akun.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProfileFromStorage()
})
</script>

<template>
  <Layout>
    <!-- ==================== HALAMAN EDIT PROFIL KHUSUS MOBILE ==================== -->
    <div v-if="isMobileEditPage" class="md:hidden max-w-5xl mx-auto space-y-5">
      <!-- Header Halaman Baru Mobile -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="closeEdit"
          :disabled="isSaving"
          class="text-gray-800 hover:opacity-70 transition cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft class="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 class="text-lg font-bold text-gray-900">
          Edit Profil
        </h1>
      </div>

      <!-- Card Form Edit Mobile -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          
          <!-- Alert Error -->
          <div
            v-if="modalErrorMessage"
            class="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ modalErrorMessage }}</span>
          </div>

          <!-- Nama Lengkap -->
          <div>
            <label class="block text-xs font-normal mb-1.5">Nama Lengkap</label>
            <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
              <User class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                v-model="form.namaUser"
                type="text"
                placeholder="Masukkan nama lengkap"
                class="w-full text-xs font-light outline-none bg-transparent"
              />
            </div>
          </div>

          <!-- Username -->
          <div>
            <label class="block text-xs font-normal mb-1.5">Username</label>
            <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
              <AtSign class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                v-model="form.username"
                type="text"
                placeholder="Username"
                class="w-full text-xs font-light outline-none bg-transparent"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-normal mb-1.5">Email</label>
            <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
              <Mail class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                v-model="form.email"
                type="email"
                placeholder="Email akun"
                class="w-full text-xs font-light outline-none bg-transparent"
              />
            </div>
          </div>

          <!-- Ubah Kata Sandi (Opsional) -->
          <div class="pt-3 border-t border-gray-100 space-y-4">
            <div>
              <h4 class="text-xs font-semibold">Ubah Kata Sandi (Opsional)</h4>
              <p class="text-[11px] font-light mt-0.5">
                Kosongkan jika tidak ingin mengubah kata sandi
              </p>
            </div>

            <div>
              <label class="block text-xs font-normal mb-1.5">Kata Sandi Lama</label>
              <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                <Lock class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                <input
                  v-model="form.oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  placeholder="Sandi lama"
                  class="w-full text-xs font-light outline-none bg-transparent pr-6"
                />
                <button
                  type="button"
                  @click="showOldPassword = !showOldPassword"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-normal mb-1.5">Kata Sandi Baru</label>
              <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                <Lock class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                <input
                  v-model="form.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Sandi baru"
                  class="w-full text-xs font-light outline-none bg-transparent pr-6"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Tombol Simpan -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isSaving"
              class="w-full inline-flex items-center justify-center bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ==================== HALAMAN UTAMA PROFIL ==================== -->
    <div v-else class="max-w-5xl mx-auto space-y-6">
      
      <!-- Judul Halaman -->
      <div>
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold">
          Profil Akun
        </h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
          Kelola informasi akun dan keamanan kata sandi Anda
        </p>
      </div>

      <!-- Konten Utama: Mobile (Atas-Bawah), Laptop (Foto Kiri - Detail Kanan) -->
      <div class="flex flex-col md:flex-row gap-6 items-start">
        
        <!-- Bagian Kiri (Laptop) / Atas (Mobile): Kartu Foto Profil -->
        <div class="w-full md:w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Banner Atas Kartu -->
          <div class="h-24 bg-app-primary2 relative"></div>

          <div class="px-6 pb-6 text-center -mt-12 relative">
            <!-- Lingkaran Foto / Inisial Profil -->
            <div class="w-24 h-24 rounded-full bg-white p-1.5 shadow-md mx-auto">
              <div class="w-full h-full rounded-full bg-[#1e4e8c] text-white flex items-center justify-center text-2xl font-bold tracking-wide">
                {{ userInitials }}
              </div>
            </div>

            <!-- Nama & Role -->
            <h2 class="mt-3 text-base sm:text-lg break-words">
              {{ profile.namaUser || '-' }}
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              @{{ profile.username || '-' }}
            </p>

            <!-- Badge Role -->
            <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1e4e8c] text-xs font-semibold">
              <Shield class="w-3.5 h-3.5" />
              <span>{{ formattedRole }}</span>
            </div>

            <!-- Info Tambahan -->
            <div class="mt-5 pt-4 border-t border-gray-100 text-left space-y-2.5 text-xs">
              <div class="flex items-center justify-between text-gray-500">
                <span>Email</span>
                <span class="font-medium text-gray-700 truncate max-w-[160px]">{{ profile.email || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-gray-500">
                <span>Terdaftar Sejak</span>
                <span class="font-medium text-gray-700">{{ formattedCreatedAt }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bagian Kanan (Laptop) / Bawah (Mobile): Detail Informasi Profil -->
        <div class="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div class="space-y-5">
            
            <!-- Alert Error -->
            <div
              v-if="errorMessage"
              class="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm px-4 py-3 rounded-xl"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Informasi Dasar -->
            <div>
              <h3 class="text-sm font-semibold mb-3">Informasi Dasar</h3>
              <div class="space-y-4">
                
                <!-- Nama Lengkap -->
                <div>
                  <label class="block text-xs font-normal mb-1.5">Nama Lengkap</label>
                  <div class="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                    <User class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <span class="text-xs sm:text-sm font-light">{{ profile.namaUser || '-' }}</span>
                  </div>
                </div>

                <!-- Username & Email (2 Kolom di Laptop) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-normal mb-1.5">Username</label>
                    <div class="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                      <AtSign class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <span class="text-xs sm:text-sm font-light">{{ profile.username || '-' }}</span>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-normal mb-1.5">Email</label>
                    <div class="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                      <Mail class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <span class="text-xs sm:text-sm font-light">{{ profile.email || '-' }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Tombol Buka Edit Profil -->
            <div class="pt-3 flex justify-end">
              <button
                type="button"
                @click="openEdit"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                <span>Edit Profil</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Pop-up Modal Edit Profil (Khusus Laptop / Desktop) -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header Pop-up -->
          <div class="bg-app-primary2 px-5 py-3.5 flex items-center justify-between">
            <h3 class="text-white font-semibold text-sm">Edit Profil Akun</h3>
            <button
              type="button"
              @click="closeEdit"
              :disabled="isSaving"
              class="text-white/80 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form di dalam Pop-up -->
          <form @submit.prevent="handleUpdateProfile" class="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <!-- Alert Error di Pop-up -->
            <div
              v-if="modalErrorMessage"
              class="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ modalErrorMessage }}</span>
            </div>

            <!-- Nama Lengkap -->
            <div>
              <label class="block text-xs font-normal mb-1.5">Nama Lengkap</label>
              <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                <User class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                <input
                  v-model="form.namaUser"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  class="w-full text-xs sm:text-sm font-light outline-none bg-transparent"
                />
              </div>
            </div>

            <!-- Username & Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-normal mb-1.5">Username</label>
                <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                  <AtSign class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input
                    v-model="form.username"
                    type="text"
                    placeholder="Username"
                    class="w-full text-xs sm:text-sm font-light outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-normal mb-1.5">Email</label>
                <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                  <Mail class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Email akun"
                    class="w-full text-xs sm:text-sm font-light outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Ubah Kata Sandi (Opsional) -->
            <div class="pt-3 border-t border-gray-100">
              <h4 class="text-xs font-semibold">Ubah Kata Sandi (Opsional)</h4>
              <p class="text-[11px] font-light mt-0.5 mb-3">
                Kosongkan jika tidak ingin mengubah kata sandi
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-normal mb-1.5">Kata Sandi Lama</label>
                  <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                    <Lock class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      v-model="form.oldPassword"
                      :type="showOldPassword ? 'text' : 'password'"
                      placeholder="Sandi lama"
                      class="w-full text-xs sm:text-sm font-light outline-none bg-transparent pr-6"
                    />
                    <button
                      type="button"
                      @click="showOldPassword = !showOldPassword"
                      class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-normal mb-1.5">Kata Sandi Baru</label>
                  <div class="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/15 transition">
                    <Lock class="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      v-model="form.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      placeholder="Sandi baru"
                      class="w-full text-xs sm:text-sm font-light outline-none bg-transparent pr-6"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tombol Aksi Pop-up -->
            <div class="pt-2 flex items-center justify-end">
              <button
                type="submit"
                :disabled="isSaving"
                class="inline-flex items-center justify-center bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>
  </Layout>
</template>