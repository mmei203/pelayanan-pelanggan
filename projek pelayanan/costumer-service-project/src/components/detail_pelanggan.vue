<script setup>
import layout from './layout.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import pelangganServices from '@/services/pelangganServices.js'

const route = useRoute()
const isLoading = ref(false)
const apiError = ref('')

const detailPelanggan = ref({
  id: null,
  namaPelanggan: '-',
  alamat: '-',
  noPdam: '-',
  keluhan: '-',
  noTelp: '-',
  operator: '-',
  createdAt: null,
  updatedAt: null,
  finished: null
})

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

const fetchDetailPelanggan = async () => {
  isLoading.value = true
  apiError.value = ''
  try {
    const id = route.params.id
    const response = await pelangganServices.detail(id)
    const data = response.data?.data || response.data || {}

    // Mapping struktur JSON API ke variabel detailPelanggan
    detailPelanggan.value = {
      id: data.idPengaduan,
      namaPelanggan: data.pelanggan?.namaPelanggan || '-',
      alamat: data.pelanggan?.alamat || '-',
      noPdam: data.pelanggan?.noKontakPdam || '-',
      keluhan: data.keluhan || '-',
      noTelp: data.pelanggan?.noHp || '-',
      operator: data.penangani?.namaUser || '-',
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
    <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 flex flex-col h-full px-2 sm:px-4 md:px-0">
      
      <!-- Tombol dan Judul -->
      <div class="flex items-center justify-between">
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
      </div>

      <!-- Pesan Error / Loading -->
      <div v-if="isLoading" class="text-xs text-gray-500">Memuat data...</div>
      <div v-else-if="apiError" class="text-xs text-red-500">{{ apiError }}</div>

      <!-- Detail Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pt-2 md:pt-4">
        
        <!-- Informasi Pelanggan -->
        <div class="space-y-3 md:space-y-4">
          <h2 class="text-base md:text-lg font-bold text-app-primary border-b-2 border-app-primary pb-2">
            Pelanggan
          </h2>

          <div class="space-y-2.5 md:space-y-3 text-xs">
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

    </div>
  </layout>
</template>