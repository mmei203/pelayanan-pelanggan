<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, Search } from 'lucide-vue-next'
import monitoringServices from '@/services/monitoringServices.js'

const isLoading = ref(false)
const apiError = ref('')
const searchQuery = ref('')
const pelangganHistory = ref([])

// Fetch Data History dari Service Monitoring
const fetchHistory = async () => {
  isLoading.value = true
  apiError.value = ''
  try {
    const response = await monitoringServices.history()
    pelangganHistory.value = response.data?.data || response.data || []
  } catch (error) {
    apiError.value = 'Gagal memuat data history pelanggan.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchHistory()
})

// Logika Pencarian
const filterHistory = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return pelangganHistory.value

    return pelangganHistory.value.filter(item => {
        const nama = item.pelanggan?.namaPelanggan || ''
        const keluhan = item.keluhan || ''
        
        const matchNama = nama.toLowerCase().includes(query)
        const matchKeluhan = keluhan.toLowerCase().includes(query)
        return matchNama || matchKeluhan
    })
})

// Format Tanggal dengan Jam & Menit (DD/MM/YYYY HH:mm)
const formatDateWithTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}
</script>

<template>
    <layout>
        <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 flex flex-col h-full px-2 sm:px-4 md:px-0">
            
            <!-- Tombol & Judul -->
            <div class="flex items-end justify-between">
                <div>
                    <!-- Breadcrumb (Hanya tampil di Laptop) -->
                    <nav class="hidden md:flex text-xs font-normal gap-1 mb-1 items-center">
                        <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
                        <span>&gt;</span>
                        <span>History</span>
                    </nav>

                    <!-- Judul -->
                    <div class="flex items-center gap-2">
                        <button @click="$router.push('/dashboard')" class="hover:opacity-75 transition">
                            <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]"/>
                        </button>
                        <h1 class="text-xl md:text-3xl font-bold text-app-text tracking-tight leading-none">History</h1>
                    </div>
                </div>
            </div>

            <!-- Card Container (Transparan di Mobile, Putih di Laptop) -->
            <div class="bg-transparent md:bg-white rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 flex-1 flex flex-col overflow-hidden">
                
                <!-- Search Input -->
                <div class="p-0 md:p-6 border-b-0 md:border-b border-gray-200 shadow-none md:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-0">
                    <div class="relative w-full flex-1">
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari"
                            class="w-full pl-4 pr-10 py-1.5 md:py-2.5 text-xs md:text-sm rounded-full md:rounded-xl border border-gray-800 md:border-gray-300 focus:outline-none focus:border-app-primary transition bg-white" 
                        />
                        <Search class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 md:text-gray-400"/>
                    </div>
                </div>

                <!-- Tabel History -->
                <div class="p-0 md:p-6 flex-1 overflow-x-auto">
                    <table class="w-full text-center border-collapse min-w-[320px]">
                        <thead>
                            <tr class="border-b border-gray-300 text-xs md:text-sm text-center">
                                <!-- Kolom "No" disembunyikan di Mobile -->
                                <th class="hidden md:table-cell pb-3.5 w-12 font-medium">No</th>
                                <th class="pb-2 md:pb-3.5 font-medium">Nama<span class="hidden md:inline"> Pelanggan</span></th>
                                <!-- Kolom "Keluhan" disembunyikan di Mobile -->
                                <th class="hidden md:table-cell pb-3.5 font-medium">Keluhan</th>
                                <th class="pb-2 md:pb-3.5 font-medium">Tanggal Masuk</th>
                                <th class="pb-2 md:pb-3.5 font-medium">Tanggal Selesai</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-300 text-[11px] md:text-xs text-center">
                            <!-- Loading State -->
                            <tr v-if="isLoading">
                                <td colspan="5" class="py-6 text-center text-gray-500">
                                    Memuat data history...
                                </td>
                            </tr>

                            <!-- Error State -->
                            <tr v-else-if="apiError">
                                <td colspan="5" class="py-6 text-center text-red-500">
                                    {{ apiError }}
                                </td>
                            </tr>

                            <!-- Data Render -->
                            <tr v-else v-for="(item, index) in filterHistory" :key="item.idPengaduan || index" class="hover:bg-gray-50 transition">
                                <td class="hidden md:table-cell py-3 font-normal">{{ index + 1 }}</td>
                                <td class="py-2.5 md:py-3 font-normal">{{ item.pelanggan.namaPelanggan || '-' }}</td>
                                <td class="hidden md:table-cell py-3 font-normal">{{ item.keluhan || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal whitespace-nowrap">
                                    {{ formatDateWithTime(item.tanggalDiterima || item.createdAt) }}
                                </td>
                                <td class="py-2.5 md:py-3 font-normal whitespace-nowrap">
                                    {{ formatDateWithTime(item.tanggalSelesai) }}
                                </td>
                            </tr>

                            <!-- Empty State -->
                            <tr v-if="!isLoading && !apiError && filterHistory.length === 0">
                                <td colspan="5" class="py-6 text-center text-gray-400 font-normal">
                                    Data riwayat pelanggan tidak ditemukan.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    </layout>
</template>