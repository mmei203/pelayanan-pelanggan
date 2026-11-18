<script setup>
import layout from './layout.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Printer } from 'lucide-vue-next'
import monitoringServices from '@/services/monitoringServices.js'
import logoPald from '@/assets/logo.png'

const route = useRoute()
const idPengaduan = route.params.id
const isLoading = ref(false)
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

const detailPelanggan = ref({
  id: null,
  status: '',
  namaPelanggan: '-',
  alamat: '-',
  noPdam: '-',
  keluhan: '-',
  noTelp: '-',
  saluranKeluhan: '-',
  saluranKeluhanRaw: '',
  sumberAduan: '-',
  sumberAduanRaw: '',
  operator: '-',
  penerima: '-',
  longitude: '',
  latitude: '',
  createdAt: null,
  updatedAt: null,
  finished: null
})

// Fungsi Cetak / Print Menggunakan Service monitoringServices atau Browser Print
const handlePrint = async () => {
  if (!idPengaduan) {
    showToast('ID Pengaduan tidak ditemukan.', 'error')
    return
  }

  try {
    if (typeof monitoringServices.print === 'function') {
      const response = await monitoringServices.print(idPengaduan)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const fileURL = URL.createObjectURL(blob)
      window.open(fileURL, '_blank')
    } else {
      window.print()
    }
  } catch (error) {
    console.error('Gagal mencetak dokumen:', error)
    showToast('Gagal mengunduh formulir cetak.', 'error')
  }
}

// Helper Mapping Saluran Keluhan Backend -> Display Teks
const mapSaluranKeluhan = (rawVal) => {
  if (!rawVal) return '-'
  const val = String(rawVal).trim()
  const lower = val.toLowerCase()
  if (val === 'Datang_Ketempat' || lower.includes('datang')) return 'Datang Langsung'
  if (val === 'Telepon' || lower.includes('telepon') || lower.includes('telp')) return 'Via Telepon'
  if (val === 'Whatsapp' || val === 'WhatsApp' || lower.includes('whatsapp') || lower.includes('temuan') || lower.includes('lapangan')) return 'Temuan Lapangan'
  return val
}

// Helper Mapping Sumber Aduan Backend -> Display Teks
const mapSumberAduan = (rawVal) => {
  if (!rawVal) return '-'
  const val = String(rawVal).trim()
  const lower = val.toLowerCase()
  if (val === 'Non_Pelanggan' || val === 'Non_Pelangan' || lower.includes('non')) return 'Non Pelanggan'
  if (val === 'Pelanggan' || lower.includes('pelanggan')) return 'Pelanggan'
  return val
}

// Helper Format Tanggal untuk Laptop (dengan Jam & Menit)
const formatDateLaptop = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Helper Format Tanggal untuk Mobile (DD/MM/YYYY)
const formatDateMobile = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Fetch Detail Pelanggan dari API Monitoring
const fetchDetailPelanggan = async () => {
  isLoading.value = true
  apiError.value = ''
  try {
    const id = route.params.id
    const response = await monitoringServices.detail(id)
    const data = response.data?.data || response.data || {}

    // Mapping struktur JSON API ke variabel detailPelanggan
    detailPelanggan.value = {
      id: data.idPengaduan,
      status: data.status ? data.status.toUpperCase() : '',
      namaPelanggan: data.pelanggan?.namaPelanggan || '-',
      alamat: data.pelanggan?.alamat || '-',
      noPdam: data.pelanggan?.noKontakPdam || '-',
      keluhan: data.keluhan || '-',
      noTelp: data.pelanggan?.noHp || '-',
      saluranKeluhan: mapSaluranKeluhan(data.saluranKeluhan),
      saluranKeluhanRaw: data.saluranKeluhan || '',
      sumberAduan: mapSumberAduan(data.sumberAduan),
      sumberAduanRaw: data.sumberAduan || '',
      operator: data.penangani?.namaUser || '-',
      penerima: data.penerima?.namaUser || '-',
      longitude: data.longitude || '',
      latitude: data.latitude || '',
      createdAt: data.tanggalDiterima || data.createdAt,
      updatedAt: data.tanggalDiproses,
      finished: data.tanggalSelesai
    }
  } catch (error) {
    apiError.value = 'Gagal mengambil data detail pelanggan.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDetailPelanggan()
})
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

      <!-- Tombol dan Judul -->
      <div class="flex items-center justify-between no-print">
        <div>
          <!-- Breadcrumb (Hanya tampil di Laptop) -->
          <nav class="hidden md:flex text-xs font-normal gap-1 mb-1 items-center">
            <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
            <span>&gt;</span>
            <router-link to="/daftar_pelanggan" class="hover:underline">Daftar Pelanggan</router-link>
            <span>&gt;</span>
            <span>Detail Pelanggan</span>
          </nav>

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

      <!-- Pesan Error / Loading -->
      <div v-if="isLoading" class="text-xs text-gray-500 no-print">Memuat data...</div>
      <div v-else-if="apiError" class="text-xs text-red-500 no-print">{{ apiError }}</div>

      <!-- Detail Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pt-2 md:pt-4 no-print">
        
        <!-- Informasi Pelanggan -->
        <div class="space-y-3 md:space-y-4">
          <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-2">
            Pelanggan
          </h2>

          <div class="space-y-2.5 md:space-y-3 text-xs">
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Saluran Keluhan</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.saluranKeluhan }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Sumber Aduan</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.sumberAduan }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Nama</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.namaPelanggan }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Alamat</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.alamat }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">No. Kontak PDAM</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.noPdam }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Keluhan</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.keluhan }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">No. Telp</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.noTelp }}</span>
            </div>
          </div>
        </div>

        <!-- Informasi Proses -->
        <div class="space-y-3 md:space-y-4">
          <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-2">
            Proses
          </h2>

          <div class="space-y-2.5 md:space-y-3 text-xs">
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Operator</span>
              <span class="col-span-2 font-light text-app-text">{{ detailPelanggan.operator }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Keluhan diterima</span>
              <span class="col-span-2 font-light text-app-text">
                <span class="hidden md:inline">{{ formatDateLaptop(detailPelanggan.createdAt) }}</span>
                <span class="md:hidden">{{ formatDateMobile(detailPelanggan.createdAt) }}</span>
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Laporan diproses</span>
              <span class="col-span-2 font-light text-app-text">
                <span class="hidden md:inline">{{ formatDateLaptop(detailPelanggan.updatedAt) }}</span>
                <span class="md:hidden">{{ formatDateMobile(detailPelanggan.updatedAt) }}</span>
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 items-start">
              <span class="font-semibold text-app-secondary">Laporan selesai</span>
              <span class="col-span-2 font-light text-app-text">
                <span class="hidden md:inline">{{ formatDateLaptop(detailPelanggan.finished) }}</span>
                <span class="md:hidden">{{ formatDateMobile(detailPelanggan.finished) }}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- TEMPLATE FORMULIR RESMI KHUSUS PRINT (MUNCUL SAAT CETAK / PRINT)   -->
      <!-- =================================================================== -->
      <div v-if="!isLoading && !apiError && detailPelanggan.id" class="print-only font-serif text-black p-4 text-xs">
        
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
            <p><strong>Tanggal Lapor:</strong> {{ formatDateLaptop(detailPelanggan.createdAt) }}</p>
            <p><strong>Status Pengaduan:</strong> {{ detailPelanggan.status }}</p>
          </div>
          <div class="text-right">
            <p><strong>No. Pengaduan:</strong> {{ detailPelanggan.id ? detailPelanggan.id.substring(0, 8).toUpperCase() : '-' }}</p>
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
                  {{ detailPelanggan.saluranKeluhanRaw === 'Datang_Ketempat' || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('datang') ? '✓' : '' }}
                </span> Datang Langsung
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ detailPelanggan.saluranKeluhanRaw === 'Telepon' || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('telepon') || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('telp') ? '✓' : '' }}
                </span> Via Telepon
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ detailPelanggan.saluranKeluhanRaw === 'Whatsapp' || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('whatsapp') || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('temuan') || detailPelanggan.saluranKeluhanRaw.toLowerCase().includes('lapangan') ? '✓' : '' }}
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
                  {{ detailPelanggan.sumberAduanRaw === 'Pelanggan' || (!detailPelanggan.sumberAduanRaw.toLowerCase().includes('non') && detailPelanggan.sumberAduanRaw.toLowerCase().includes('pelanggan')) ? '✓' : '' }}
                </span> Pelanggan Kerjasama
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 border border-black text-center leading-none text-[9px] font-bold">
                  {{ detailPelanggan.sumberAduanRaw === 'Non_Pelanggan' || detailPelanggan.sumberAduanRaw.toLowerCase().includes('non') ? '✓' : '' }}
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
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ detailPelanggan.namaPelanggan }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Alamat</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ detailPelanggan.alamat }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Nomor Telpon / HP</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ detailPelanggan.noTelp }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Kontrak PDAM</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">NO. {{ detailPelanggan.noPdam }}</span>
          </div>
          <div class="flex">
            <span class="w-40 font-bold">Uraian Keluhan</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">{{ detailPelanggan.keluhan }}</span>
          </div>
          <div class="flex" v-if="detailPelanggan.longitude || detailPelanggan.latitude">
            <span class="w-40 font-bold">Titik Koordinat</span>
            <span class="w-4 text-center">:</span>
            <span class="flex-1 border-b border-black border-dotted pb-0.5">Long: {{ detailPelanggan.longitude || '-' }}, Lat: {{ detailPelanggan.latitude || '-' }}</span>
          </div>
        </div>

        <!-- TANDA TANGAN (PEMOHON & PENERIMA ADUAN) -->
        <div class="mt-12 flex justify-between text-center px-8">
          <div class="w-48">
            <p class="mb-16">Pemohon,</p>
            <p class="font-bold border-b border-black pb-0.5">( {{ detailPelanggan.namaPelanggan }} )</p>
          </div>
          <div class="w-48">
            <p class="mb-16">Penerima Aduan,</p>
            <p class="font-bold border-b border-black pb-0.5">( {{ detailPelanggan.penerima }} )</p>
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