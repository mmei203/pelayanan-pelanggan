<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, Search, Info, Filter } from 'lucide-vue-next'
import pelangganServices from '@/services/operationServices.js'

const isLoading = ref(false)
const apiError = ref('')
const searchQuery = ref('')
const selectedFilter = ref('All')
const pelangganList = ref([])

// Fetch data menggunakan service pelangganServices.getAll()
const fetchPelanggan = async () => {
  isLoading.value = true
  apiError.value = ''
  try {
    const response = await pelangganServices.getAll()
    pelangganList.value = response.data.data
    console.log('data pelanggan: ', response.data.data)
  } catch (error) {
    apiError.value = 'Gagal mengambil data pelanggan.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// Jalankan fetch data saat komponen di-mount
onMounted(() => {
  fetchPelanggan()
})

// Logic Search & Filter Status
const filterPelanggan = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return pelangganList.value.filter(item => {
    // Search Filter
    const matchNama = item.pelanggan?.namaPelanggan?.toLowerCase().includes(query)
    const matchKeluhan = item.keluhan?.toLowerCase().includes(query)
    const matchSearch = !query || matchNama || matchKeluhan

    // Status Filter
    const itemStatus = item.status?.toUpperCase()
    let matchStatus = true
    if (selectedFilter.value !== 'All') {
      if (selectedFilter.value === 'ON PROGRESS') {
        matchStatus = itemStatus === 'ON PROGRESS' || itemStatus === 'DIPROSES'
      } else {
        matchStatus = itemStatus === selectedFilter.value
      }
    }

    return matchSearch && matchStatus
  })
})

// Format Tanggal
const formatData = (dataString) => {
  if (!dataString) return '-'
  const date = new Date(dataString)

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Format Status
const formatStatus = (status) => {
  if (!status) return '-'
  return status
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <layout>
    <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 flex flex-col h-full px-2 sm:px-4 md:px-0">
      
      <!-- Judul Halaman -->
      <div class="flex items-center md:items-end justify-between">
        <div>
          <!-- Breadcrumb (Hanya di Laptop) -->
          <nav class="hidden md:flex text-xs mb-1 items-center gap-1 font-normal">
            <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
            <span>&gt;</span>
            <span>Daftar Pelanggan</span>
          </nav>
          
          <!-- Judul -->
          <div class="flex items-center gap-2">
            <button @click="$router.push('/dashboard')" class="hover:opacity-75 transition">
              <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]" />
            </button>
            <h1 class="text-xl md:text-3xl font-bold text-app-text tracking-tight leading-none">Daftar Pelanggan</h1>
          </div>
        </div>
      </div>

      <!-- Card Container (bg-transparent di Mobile, bg-white di Laptop) -->
      <div class="bg-transparent md:bg-white rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 flex-1 flex flex-col overflow-hidden">

        <!-- Search Bar & Filter Section -->
        <div class="p-0 md:p-6 border-b-0 md:border-b border-gray-200 shadow-none md:shadow-lg flex items-center justify-between gap-2 md:gap-4 mb-4 md:mb-0">
          
          <!-- Input Search (Bentuk Oval di Mobile, Persegi rounded di Laptop) -->
          <div class="relative w-full flex-1">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari Pelanggan"
              class="w-full pl-4 pr-10 py-1.5 md:py-2.5 text-xs md:text-sm rounded-full md:rounded-xl border border-gray-800 md:border-gray-300 focus:outline-none focus:border-app-primary transition bg-white" 
            />
            <Search class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 md:text-gray-400"/>
          </div>

          <!-- Filter Status Dropdown (Tampil di Laptop) -->
          <div class="hidden md:block shrink-0">
            <select 
              v-model="selectedFilter"
              class="bg-white text-xs md:text-sm font-normal px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-app-primary cursor-pointer shadow-xs"
            >
              <option value="All">Filter by: Status</option>
              <option value="PENDING">Pending</option>
              <option value="ON PROGRESS">On Progress</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>

          <!-- Icon Filter Khusus Mobile -->
          <div class="flex md:hidden items-center shrink-0">
            <div class="relative">
              <select 
                v-model="selectedFilter"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                <option value="All">Filter by: Status</option>
                <option value="PENDING">Pending</option>
                <option value="ON PROGRESS">On Progress</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <button class="p-1.5 text-gray-700 hover:bg-gray-200 rounded-lg transition">
                <Filter class="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

        </div>

        <!-- Tabel Pelanggan -->
        <div class="p-0 md:p-6 flex-1 overflow-x-auto">
          <table class="w-full border-collapse min-w-[320px]">
            <thead>
              <tr class="border-b border-gray-300 text-xs md:text-sm text-center">
                <th class="hidden md:table-cell pb-3.5 w-12 font-medium">No</th>
                <th class="pb-2 md:pb-3.5 font-medium leading-tight text-center md:text-left">Nama<br class="md:hidden"/> Pelanggan</th>
                <th class="pb-2 md:pb-3.5 font-medium text-center">Keluhan</th>
                <th class="pb-2 md:pb-3.5 font-medium text-center">Status</th>
                <th class="pb-2 md:pb-3.5 font-medium text-center">Tanggal</th>
                <th class="pb-2 md:pb-3.5 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300 text-[11px] md:text-xs text-center">
              
              <!-- Loading State -->
              <tr v-if="isLoading">
                <td colspan="6" class="py-6 text-center text-gray-500">
                  Memuat data pelanggan...
                </td>
              </tr>

              <!-- Error State -->
              <tr v-else-if="apiError">
                <td colspan="6" class="py-6 text-center text-red-500">
                  {{ apiError }}
                </td>
              </tr>

              <!-- Data Render -->
              <tr v-else v-for="(item, index) in filterPelanggan" :key="item.idPengaduan || index" class="hover:bg-black/5 md:hover:bg-gray-50 transition">
                <td class="hidden md:table-cell py-3 font-normal">{{ index + 1 }}</td>
                <td class="py-2.5 md:py-3 font-normal text-center md:text-left max-w-[80px] md:max-w-none leading-tight">{{ item.pelanggan.namaPelanggan }}</td>
                <td class="py-2.5 md:py-3 font-normal text-center max-w-[90px] md:max-w-none truncate">{{ item.keluhan }}</td>
                <td class="py-2.5 md:py-3 font-normal text-center">
                  <span :class="{
                    'bg-app-error text-white': item.status === 'PENDING',
                    'bg-app-warning text-white': item.status === 'ON PROGRESS' || item.status === 'DIPROSES',
                    'bg-app-success text-white': item.status === 'SELESAI'
                  }"
                  class="w-[65px] md:w-[110px] py-1 text-[10px] md:text-xs font-normal text-center inline-block rounded-md md:rounded-lg shadow-xs md:shadow-sm">
                    {{ formatStatus(item.status) }}
                  </span>
                </td>
                <td class="py-2.5 md:py-3 font-normal whitespace-nowrap">{{ formatData(item.updatedAt) }}</td>
                <td class="py-2.5 md:py-3">
                  <div class="flex items-center justify-center">
                    <!-- Icon Info (Satu-satunya aksi di Laptop & Mobile) -->
                    <button @click="$router.push(`/detail_pelanggan/${item.idPengaduan}`)" class="hover:text-gray-800 transition">
                      <Info class="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[1.5]" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="!isLoading && !apiError && filterPelanggan.length === 0">
                <td colspan="6" class="py-6 text-center text-gray-400 font-normal">
                  Data pelanggan tidak ditemukan.
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>

    </div>
  </layout>
</template>