<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import superServices from '@/services/superServices.js'

const route = useRoute()
const idPengaduan = route.params.id

const isLoading = ref(false)
const isSubmitting = ref(false)
const apiError = ref('')

// Toast Notification State
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// State Data Form & Detail
const detailPelanggan = ref(null)
const longitude = ref('')
const latitude = ref('')
const dokumenFile = ref(null)
const fotoFile = ref(null)
const fotoPreview = ref('')

// Ref element input
const documentInput = ref(null)
const photoInput = ref(null)

// Computed Safety Helpers (Tanpa menggunakan operator `?.`)
const statusText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.status 
    ? detailPelanggan.value.status.toUpperCase() 
    : ''
})

const namaPelangganText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.pelanggan && detailPelanggan.value.pelanggan.namaPelanggan
    ? detailPelanggan.value.pelanggan.namaPelanggan
    : '-'
})

const alamatPelangganText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.pelanggan && detailPelanggan.value.pelanggan.alamat
    ? detailPelanggan.value.pelanggan.alamat
    : '-'
})

const noKontakPdamText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.pelanggan && detailPelanggan.value.pelanggan.noKontakPdam
    ? detailPelanggan.value.pelanggan.noKontakPdam
    : '-'
})

const noHpPelangganText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.pelanggan && detailPelanggan.value.pelanggan.noHp
    ? detailPelanggan.value.pelanggan.noHp
    : '-'
})

const namaOperatorText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.penangani && detailPelanggan.value.penangani.namaUser
    ? detailPelanggan.value.penangani.namaUser
    : '-'
})

// Status Flags
const isPending = computed(() => statusText.value === 'PENDING')
const isOnProgress = computed(() => statusText.value === 'ON PROGRESS' || statusText.value === 'DIPROSES')
const isSelesai = computed(() => statusText.value === 'SELESAI')

// Input Boleh Diisi Hanya Jika ON PROGRESS
const canEdit = computed(() => isOnProgress.value)

// Fetch Detail Pelanggan dari API
const fetchDetail = async () => {
  isLoading.value = true
  apiError.value = ''
  try {
    // Memanggil detail(id) sesuai dengan method di superServices.js
    const response = await superServices.detail(idPengaduan)
    const data = (response.data && response.data.data) ? response.data.data : response.data
    detailPelanggan.value = data
    
    // Binding field form
    longitude.value = data.longitude || ''
    latitude.value = data.latitude || ''
    
    const baseURL = 'http://localhost:5500'
    let rawPath = data.fotoKeluhan || ''
    if (!rawPath && data.pelanggan) {
      rawPath = data.pelanggan.fotoKeluhan || ''
    }

    if (rawPath) {
      if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
        fotoPreview.value = rawPath
      } else {
        let cleanPath = rawPath.replace(/\\/g, '/')
        if (cleanPath.startsWith('/')) {
          cleanPath = cleanPath.substring(1)
        }
        fotoPreview.value = `${baseURL}/${cleanPath}`
      }
    } else {
      fotoPreview.value = ''
    }
  } catch (error) {
    apiError.value = 'Gagal memuat detail pelanggan.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleImageError = (e) => {
  console.error('Gagal memuat gambar dari URL:', fotoPreview.value)
}

// Computed URL untuk Dokumen Laporan
const dokumenUrl = computed(() => {
  if (dokumenFile.value) {
    return URL.createObjectURL(dokumenFile.value)
  }
  
  const rawPath = detailPelanggan.value ? detailPelanggan.value.dokumenLaporan : ''
  if (!rawPath) return ''

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath
  }

  const baseURL = 'http://localhost:5500'
  let cleanPath = rawPath.replace(/\\/g, '/')
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1)
  }
  return `${baseURL}/${cleanPath}`
})

onMounted(() => {
  if (idPengaduan) {
    fetchDetail()
  }
})

// Format Tanggal (Termasuk Jam & Menit)
const formatTanggal = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Handler Utama untuk Tombol Aksi
const handleAction = async () => {
  if (isPending.value) {
    await terimaKeluhan()
  } else if (isOnProgress.value) {
    await simpanPerubahan()
  }
}

// 1. Fungsi Terima Keluhan
const terimaKeluhan = async () => {
  isSubmitting.value = true
  try {
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const operatorId = loggedUser.idUser || loggedUser.id || '5d48e7a6-919e-4948-b104-b8e1c0155b33'
    
    const payload = {
      status: 'ON PROGRESS',
      operatorId: operatorId
    }

    await superServices.update(idPengaduan, payload)
    showToast('Keluhan berhasil diterima!', 'success')
    await fetchDetail()
  } catch (error) {
    console.error(error)
    showToast('Gagal menerima keluhan.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 2. Fungsi Simpan Perubahan
const simpanPerubahan = async () => {
  if (!longitude.value.trim() || !latitude.value.trim()) {
    showToast('Mohon lengkapi titik koordinat (Longitude & Latitude)!', 'warning')
    return
  }

  const hasDokumen = dokumenFile.value || (detailPelanggan.value && detailPelanggan.value.dokumenLaporan)
  if (!hasDokumen) {
    showToast('Dokumen laporan wajib diupload!', 'warning')
    return
  }

  const hasFoto = fotoFile.value || (detailPelanggan.value && detailPelanggan.value.fotoKeluhan)
  if (!hasFoto) {
    showToast('Foto keluhan wajib diupload!', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    
    formData.append('status', 'SELESAI') 
    formData.append('longitude', longitude.value)
    formData.append('latitude', latitude.value)

    if (dokumenFile.value) {
      formData.append('dokumenLaporan', dokumenFile.value)
    }
    if (fotoFile.value) {
      formData.append('fotoKeluhan', fotoFile.value)
    }

    await superServices.update(idPengaduan, formData)
    showToast('Laporan berhasil diselesaikan!', 'success')
    await fetchDetail()

  } catch (error) {
    console.error('Gagal update pengaduan:', error)
    showToast('Gagal menyimpan perubahan. Periksa server backend.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Upload File Handlers
const triggerDocumentUpload = () => documentInput.value.click()
const triggerPhotoUpload = () => photoInput.value.click()

const handleDocumentChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    dokumenFile.value = file
  }
}

const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    fotoFile.value = file
    fotoPreview.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <layout>
    <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 flex flex-col h-full relative px-2 sm:px-4 md:px-0">
      
      <!-- POPUP / TOAST NOTIFIKASI KECIL -->
      <transition name="fade">
        <div 
          v-if="toast.show" 
          :class="{
            'bg-emerald-600 text-white': toast.type === 'success',
            'bg-red-600 text-white': toast.type === 'error',
            'bg-amber-500 text-white': toast.type === 'warning'
          }"
          class="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 border border-white/20"
        >
          <span>{{ toast.message }}</span>
        </div>
      </transition>

      <!-- Header & Breadcrumb -->
      <div class="flex items-center justify-between">
        <div>
          <!-- Breadcrumb -->
          <nav class="hidden md:flex text-xs font-normal gap-1 mb-1 items-center">
            <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
            <span>&gt;</span>
            <router-link to="/daftar_pelanggan" class="hover:underline">Daftar Pelanggan</router-link>
            <span>&gt;</span>
            <span>Detail Pelanggan</span>
          </nav>

          <!-- Judul -->
          <div class="flex items-center gap-2">
            <button @click="$router.push('/daftar_pelanggan')" class="hover:opacity-75 transition">
              <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]"/>
            </button>
            <h1 class="text-xl md:text-3xl font-bold text-app-text tracking-tight leading-none">
              Detail Pelanggan
            </h1>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 text-center font-normal">
        Memuat detail pelanggan...
      </div>

      <!-- Error State -->
      <div v-else-if="apiError" class="py-12 text-center text-red-500">
        {{ apiError }}
      </div>

      <!-- Detail Content Grid -->
      <div v-else-if="detailPelanggan" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 pt-2">
        
        <!-- Sisi Kiri: Pelanggan & Proses -->
        <div class="space-y-6 md:space-y-8">
          
          <!-- Section Pelanggan -->
          <div class="space-y-3 md:space-y-4">
            <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-1 md:pb-2">
              Pelanggan
            </h2>

            <div class="space-y-2.5 md:space-y-3 text-xs">
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Nama</span>
                <span class="col-span-2 font-light ">{{ namaPelangganText }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Alamat</span>
                <span class="col-span-2 font-light leading-tight">{{ alamatPelangganText }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">No. Kontak PDAM</span>
                <span class="col-span-2 font-light ">{{ noKontakPdamText }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Keluhan</span>
                <span class="col-span-2 font-light">{{ detailPelanggan.keluhan || '-' }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">No. Telp</span>
                <span class="col-span-2 font-light ">{{ noHpPelangganText }}</span>
              </div>
            </div>
          </div>

          <!-- Section Proses -->
          <div class="space-y-3 md:space-y-4 pt-2 md:pt-4">
            <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-1 md:pb-2">
              Proses
            </h2>

            <div class="space-y-2.5 md:space-y-3 text-xs">
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Operator</span>
                <span class="col-span-2 font-light ">{{ namaOperatorText }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Keluhan diterima</span>
                <span class="col-span-2 font-light ">{{ formatTanggal(detailPelanggan.tanggalDiterima || detailPelanggan.createdAt) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Laporan diproses</span>
                <span class="col-span-2 font-light ">{{ formatTanggal(detailPelanggan.tanggalDiproses) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Laporan selesai</span>
                <span class="col-span-2 font-light ">{{ formatTanggal(detailPelanggan.tanggalSelesai) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Sisi Kanan: Upload Dokumen & Form -->
        <div class="space-y-4 md:space-y-6 pt-2 lg:pt-0">
          <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-1 md:pb-2">
            Upload Dokumen
          </h2>

          <div class="space-y-4 md:space-y-5">
            
            <!-- Titik Koordinat -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-app-secondary">Titik Kordinat</label>
              <input 
                v-model="longitude" 
                type="text" 
                placeholder="Longitude" 
                :disabled="!canEdit"
                class="w-full bg-gray-300 md:bg-gray-200 text-xs px-4 py-2.5 rounded-xl outline-none placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed" 
              />
              <input 
                v-model="latitude" 
                type="text" 
                placeholder="Latitude" 
                :disabled="!canEdit"
                class="w-full bg-gray-300 md:bg-gray-200 text-xs px-4 py-2.5 rounded-xl outline-none placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed" 
              />
            </div>

            <!-- Dokumen -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-app-secondary">Dokumen</label>
              
              <!-- Tampilan Link Dokumen -->
              <div class="flex items-center gap-2">
                <a 
                  v-if="dokumenUrl"
                  :href="dokumenUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full bg-gray-200 text-xs px-4 py-2.5 rounded-xl text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center justify-between font-medium transition"
                >
                  <span class="truncate">
                    {{ dokumenFile ? dokumenFile.name : 'Lihat Dokumen' }}
                  </span>
                </a>

                <input 
                  v-else
                  type="text" 
                  value="Tidak ada dokumen" 
                  readonly 
                  disabled
                  class="w-full bg-gray-300 md:bg-gray-200 text-xs px-4 py-2.5 rounded-xl outline-none text-gray-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                />
              </div>

              <input 
                ref="documentInput" 
                type="file" 
                class="hidden" 
                @change="handleDocumentChange"
              />
              
              <button 
                v-if="!isSelesai"
                type="button" 
                @click="triggerDocumentUpload"
                :disabled="!canEdit"
                class="bg-amber-400 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah File
              </button>
            </div>

            <!-- Foto -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-app-secondary">Foto</label>
              <div class="w-full h-44 md:h-40 bg-gray-300 md:bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                <img 
                  v-if="fotoPreview" 
                  :src="fotoPreview" 
                  @error="handleImageError"
                  class="w-full h-full object-cover" 
                />
                <span v-else class="text-xs font-normal text-gray-400">Tidak ada foto</span>
              </div>
              
              <input 
                ref="photoInput" 
                type="file" 
                accept="image/*"
                class="hidden" 
                @change="handlePhotoChange"
              />

              <button 
                v-if="!isSelesai"
                type="button" 
                @click="triggerPhotoUpload"
                :disabled="!canEdit"
                class="bg-amber-400 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah File
              </button>
            </div>

            <!-- Tombol Utama (Terima Keluhan / Simpan Perubahan) -->
            <div class="pt-2" v-if="!isSelesai"> 
              <button 
                type="button" 
                @click="handleAction"
                :disabled="isSubmitting"
                :class="isOnProgress ? 'bg-app-primary hover:opacity-90' : 'bg-emerald-600 hover:opacity-90'"
                class="w-full text-white font-bold text-xs py-3 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <span v-if="isSubmitting">Memproses...</span>
                <span v-else>{{ isPending ? 'Terima keluhan' : 'Simpan perubahan' }}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  </layout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>