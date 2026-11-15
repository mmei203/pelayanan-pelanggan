<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Printer } from 'lucide-vue-next'
import superServices from '@/services/superServices.js'
import logoPald from '@/assets/logo.png'

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

// Fungsi Cetak / Print Menggunakan Service superServices
const handlePrint = async () => {
  if (!idPengaduan) {
    showToast('ID Pengaduan tidak ditemukan.', 'error')
    return
  }

  try {
    // Memanggil method print(id) dari superServices.js
    const response = await superServices.print(idPengaduan)
    
    // Memproses blob data PDF dari server
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileURL = URL.createObjectURL(blob)
    window.open(fileURL, '_blank')
  } catch (error) {
    console.error('Gagal mencetak dokumen:', error)
    showToast('Gagal mengunduh formulir cetak.', 'error')
  }
}

// Computed Safety Helpers
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

// Helper Teks & Mapping Saluran Keluhan Backend -> Display Teks
const saluranKeluhanRaw = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.saluranKeluhan
    ? detailPelanggan.value.saluranKeluhan
    : ''
})

const saluranKeluhanText = computed(() => {
  const val = saluranKeluhanRaw.value
  if (val === 'Datang_Ketempat' || val.toLowerCase().includes('datang')) return 'Datang Langsung'
  if (val === 'Telepon' || val.toLowerCase().includes('telepon') || val.toLowerCase().includes('telp')) return 'Via Telepon'
  if (val === 'Whatsapp' || val.toLowerCase().includes('whatsapp') || val.toLowerCase().includes('temuan') || val.toLowerCase().includes('lapangan')) return 'Temuan Lapangan'
  return val || '-'
})

// Helper Teks & Mapping Sumber Aduan Backend -> Display Teks
const sumberAduanRaw = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.sumberAduan
    ? detailPelanggan.value.sumberAduan
    : ''
})

const sumberAduanText = computed(() => {
  const val = sumberAduanRaw.value
  if (val === 'Non_Pelanggan' || val.toLowerCase().includes('non')) return 'Non Pelanggan'
  if (val === 'Pelanggan' || val.toLowerCase().includes('pelanggan')) return 'Pelanggan'
  return val || '-'
})

const namaOperatorText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.penangani && detailPelanggan.value.penangani.namaUser
    ? detailPelanggan.value.penangani.namaUser
    : '-'
})

const PenerimaText = computed(() => {
  return detailPelanggan.value && detailPelanggan.value.penerima && detailPelanggan.value.penerima.namaUser
    ? detailPelanggan.value.penerima.namaUser
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
          class="no-print fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 border border-white/20"
        >
          <span>{{ toast.message }}</span>
        </div>
      </transition>

      <!-- Header & Breadcrumb -->
      <div class="flex items-center justify-between no-print">
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

        <!-- Tombol Print di Pojok Kanan Atas -->
        <button 
          @click="handlePrint"
          type="button"
          class="bg-app-primary hover:opacity-90 text-white text-xs md:text-sm font-semibold px-3 py-2 md:px-4 md:py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Printer class="w-4 h-4 stroke-[2]" />
          <span>Cetak</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 text-center font-normal no-print">
        Memuat detail pelanggan...
      </div>

      <!-- Error State -->
      <div v-else-if="apiError" class="py-12 text-center text-red-500 no-print">
        {{ apiError }}
      </div>

      <!-- Detail Content Grid (Tampilan Web Biasa) -->
      <div v-else-if="detailPelanggan" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 pt-2 no-print">
        
        <!-- Sisi Kiri: Pelanggan & Proses -->
        <div class="space-y-6 md:space-y-8">
          
          <!-- Section Pelanggan -->
          <div class="space-y-3 md:space-y-4">
            <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-1 md:pb-2">
              Pelanggan
            </h2>

            <div class="space-y-2.5 md:space-y-3 text-xs">
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Saluran Keluhan</span>
                <span class="col-span-2 font-light">{{ saluranKeluhanText }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-start">
                <span class="font-semibold text-app-secondary">Sumber Aduan</span>
                <span class="col-span-2 font-light">{{ sumberAduanText }}</span>
              </div>
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

      <!-- =================================================================== -->
      <!-- TEMPLATE FORMULIR RESMI KHUSUS PRINT (MUNCUL SAAT CETAK / PRINT)   -->
      <!-- =================================================================== -->
      <div v-if="detailPelanggan" class="print-only font-serif text-black p-4 text-xs">
        
        <!-- KOP SURAT PERUMDA PALD -->
        <div class="border-b-2 border-black pb-2 mb-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="logoPald" alt="Logo PERUMDA PALD" class="w-16 h-auto" />
            <div>
              <h2 class="font-bold text-sm tracking-wide uppercase">PEMERINTAH KOTA BANJARMASIN</h2>
              <h3 class="font-bold text-xs uppercase">PERUSAHAAN UMUM DAERAH</h3>
              <h1 class="font-bold text-sm tracking-wider uppercase">PENGELOLA AIR LIMBAH DOMESTIK BANJARMASIN</h1>
              <h1 class="font-bold text-sm tracking-wider uppercase">( PERUMDA PALD )</h1>
              <p class="text-[10px] leading-tight">
                Jl. Pasar Pagi No. 89 RT. 01 Telp. (0511) 3271940 Fax. (0511) 3252883 Banjarmasin 70241<br/>
                website: www.perumdapaldbanjarmasin.com e-mail: perumdapaldbanjarmasin@gmail.com
              </p>
            </div>
          </div>
        </div>

        <!-- JUDUL FORMULIR -->
        <div class="text-center my-3">
          <h2 class="font-bold text-sm underline tracking-wide uppercase">FORMULIR ADUAN PELANGGAN</h2>
        </div>

        <!-- NOMOR & TANGGAL LAPORAN -->
        <div class="flex justify-between items-start mb-3 border p-2 border-black">
          <div>
            <p><strong>Tanggal Lapor:</strong> {{ formatTanggal(detailPelanggan.tanggalDiterima || detailPelanggan.createdAt) }}</p>
            <p><strong>Status Pengaduan:</strong> {{ statusText }}</p>
          </div>
          <div class="text-right">
            <p><strong>No. Pengaduan:</strong> {{ detailPelanggan.idPengaduan ? detailPelanggan.idPengaduan.substring(0, 8).toUpperCase() : '-' }}</p>
          </div>
        </div>

        <!-- SALURAN KELUHAN (KIRI) DAN SUMBER ADUAN (KANAN) SEJAJAR -->
        <div class="mb-4 grid grid-cols-2 gap-4 border p-2 border-black">
          
          <!-- SALURAN KELUHAN (SEBELAH KIRI) -->
          <div>
            <p class="font-bold mb-1">Saluran Keluhan:</p>
            <div class="flex flex-wrap gap-3 pl-1">
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ saluranKeluhanRaw === 'Datang_Ketempat' || saluranKeluhanRaw.toLowerCase().includes('datang') ? '✓' : '' }}
                </span> Datang Langsung
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ saluranKeluhanRaw === 'Telepon' || saluranKeluhanRaw.toLowerCase().includes('telepon') || saluranKeluhanRaw.toLowerCase().includes('telp') ? '✓' : '' }}
                </span> Via Telepon
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ saluranKeluhanRaw === 'Whatsapp' || saluranKeluhanRaw.toLowerCase().includes('whatsapp') || saluranKeluhanRaw.toLowerCase().includes('temuan') || saluranKeluhanRaw.toLowerCase().includes('lapangan') ? '✓' : '' }}
                </span> Temuan Lapangan
              </span>
            </div>
          </div>

          <!-- SUMBER ADUAN (SEBELAH KANAN) -->
          <div>
            <p class="font-bold mb-1">Sumber Aduan:</p>
            <div class="flex flex-wrap gap-3 pl-1">
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ sumberAduanRaw === 'Pelanggan' || (!sumberAduanRaw.toLowerCase().includes('non') && sumberAduanRaw.toLowerCase().includes('pelanggan')) ? '✓' : '' }}
                </span> Pelanggan Kerjasama
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ sumberAduanRaw === 'Non_Pelanggan' || sumberAduanRaw.toLowerCase().includes('non') ? '✓' : '' }}
                </span> Non-Pelanggan Kerjasama
              </span>
            </div>
          </div>

        </div>

        <!-- DATA PELANGGAN (TABEL FORM) -->
        <div class="space-y-1.5 mb-4">
          <div class="flex">
            <span class="w-40 font-bold">Nama Pelapor</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ namaPelangganText }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Alamat</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ alamatPelangganText }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Nomor Telpon / HP</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ noHpPelangganText }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Kontrak PDAM</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">NO. {{ noKontakPdamText }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Uraian Keluhan</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ detailPelanggan.keluhan || '-' }}</span>
          </div>
          <div class="flex" v-if="longitude || latitude">
            <span class="w-40 font-bold">Titik Koordinat</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">Long: {{ longitude || '-' }}, Lat: {{ latitude || '-' }}</span>
          </div>
        </div>

        <!-- TANDA TANGAN (PEMOHON & PENERIMA ADUAN) -->
        <div class="mt-12 flex justify-between text-center px-8">
          <div class="w-48">
            <p class="mb-16">Pemohon,</p>
            <p class="font-bold border-b border-black pb-0.5">( {{ namaPelangganText }} )</p>
          </div>
          <div class="w-48">
            <p class="mb-16">Penerima Aduan,</p>
            <p class="font-bold border-b border-black pb-0.5">( {{ PenerimaText }} )</p>
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

/* Menyembunyikan template cetak pada layar biasa */
.print-only {
  display: none;
}

@media print {
  /* Sembunyikan elemen web biasa saat mencetak */
  .no-print {
    display: none !important;
  }

  /* Sembunyikan Layout bawaan (Header/Sidebar) jika ada */
  header, sidebar, nav, aside { 
    display: none !important;
  }

  /* Tampilkan hanya formulir resmi saat mencetak */
  .print-only {
    display: block !important;
  }

  @page {
    size: A4 portrait;
    margin: 15mm;
  }
}
</style>