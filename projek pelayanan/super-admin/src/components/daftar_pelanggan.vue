<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, Search, Plus, SquarePen, Info, ChevronDown, X, Filter } from 'lucide-vue-next'
import router from '@/router/index.js'
import superServices from '@/services/superServices.js'

// state tambah dan edit pelanggan
const isModalOpen = ref(false)
const modalMode = ref('add')
const modalTitle = ref('Tambah Pelanggan')
const errorMessage = ref('')

// get pelanggan
const pelangganList = ref([])
const isLoading = ref(false)
const apiError = ref('')

const fetchPelanggan = async () => {
    isLoading.value = true
    apiError.value = ''
    try {
        const response = await superServices.getAll()
        pelangganList.value = response.data?.data || response.data || []
    } catch (error) {
        apiError.value = 'Gagal mengambil data pelanggan.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

// panggil fetch
onMounted(() => {
    fetchPelanggan()
})

// form data pelanggan
const form = ref({
    id: null,
    idPelanggan: null,
    namaPelanggan: '',
    noTelp: '',
    noPdam: '',
    alamat: '',
    keluhan: '',
    status: 'PENDING'
})

// tambah
const addModal = () => {
    errorMessage.value = ''
    modalMode.value = 'add'
    modalTitle.value = 'Tambah Pelanggan'
    form.value = { 
        id: null, 
        idPelanggan: null, 
        namaPelanggan: '', 
        noTelp: '', 
        noPdam: '', 
        alamat: '', 
        keluhan: '', 
        status: 'PENDING' 
    }
    isModalOpen.value = true
}

// edit
const editModal = (item) => {
    errorMessage.value = ''
    modalMode.value = 'edit'
    modalTitle.value = 'Edit Pelanggan'
    
    // Simpan idPengaduan & status asli item dari backend
    form.value = {
        id: item.idPengaduan,
        idPelanggan: item.idPelanggan || item.pelanggan?.idPelanggan,
        namaPelanggan: item.pelanggan?.namaPelanggan || '',
        noTelp: item.pelanggan?.noHp || '',
        noPdam: item.pelanggan?.noKontakPdam || '',
        alamat: item.pelanggan?.alamat || '',
        keluhan: item.keluhan || '',
        status: item.status || 'PENDING'
    }
    isModalOpen.value = true
}

// submit
const submitForm = async () => {
    errorMessage.value = ''
    // cek field kosong
    if (
        !form.value.namaPelanggan?.trim() ||
        !form.value.noTelp?.trim() ||
        !form.value.noPdam?.trim() ||
        !form.value.alamat?.trim() ||
        !form.value.keluhan?.trim()
    ) {
        errorMessage.value = 'Semua field harus diisi!'
        return
    }

    try {
        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const validIdUserCS = loggedUser.idUser || loggedUser.id || 'b554b7d4-a1b3-4617-b58a-1bb15fe1454f'

        if (form.value.id) {
            // Payload Update dengan menyertakan status asli item
            const payloadUpdate = {
                namaPelanggan: form.value.namaPelanggan,
                noHp: form.value.noTelp,
                noKontakPdam: form.value.noPdam,
                alamat: form.value.alamat,
                keluhan: form.value.keluhan,
                status: form.value.status
            }
            const res = await superServices.update(form.value.id, payloadUpdate)
            console.log('update data pelanggan', res.data)
        } else {
            // Payload Tambah Pelanggan Baru (menggunakan superServices)
            const payloadCreate = {
                namaPelanggan: form.value.namaPelanggan,
                noHp: form.value.noTelp,
                noKontakPdam: form.value.noPdam,
                alamat: form.value.alamat,
                keluhan: form.value.keluhan,
                idUserCS: validIdUserCS
            }
            const res = await superServices.create(payloadCreate)
            console.log('tambah data pelanggan', res.data)
        }
        await fetchPelanggan()
        isModalOpen.value = false
    } catch (error) {
        errorMessage.value = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan data pelanggan.'
        console.error('Detail Error:', error.response?.data || error)
    }
}

const closeModal = () => {
    errorMessage.value = ''
    isModalOpen.value = false
}

// search & filter
const searchQuery = ref('')
const selectedFilter = ref('All')

// logic search & filter
const filterPelanggan = computed(() => {
    return pelangganList.value.filter(item => {
        const nama = item.pelanggan?.namaPelanggan || ''
        const keluhan = item.keluhan || ''
        const status = item.status || ''

        // search
        const matchSearch =
            nama.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
            keluhan.toLowerCase().includes(searchQuery.value.toLowerCase().trim())

        // filter
        const matchStatus = selectedFilter.value === 'All' || status.toUpperCase() === selectedFilter.value.toUpperCase()

        return matchSearch && matchStatus
    })
})

// format tanggal
const formatData = (dataString) => {
    if (!dataString) return '-'
    const date = new Date(dataString)

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}

// format status
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
            
            <!-- Judul Halaman & tombol tambah -->
            <div class="flex items-center md:items-end justify-between">
                <div>
                    <!-- Breadcrumb (Hanya tampil di Laptop) -->
                    <nav class="hidden md:flex text-xs mb-1 items-center gap-1 font-normal">
                        <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
                        <span>&gt;</span>
                        <span>Daftar Pelanggan</span>
                    </nav>
                    
                    <!-- judul -->
                    <div class="flex items-center gap-2">
                        <button @click="$router.push('/dashboard')" class="hover:opacity-75 transition">
                            <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]" />
                        </button>
                        <h1 class="text-xl md:text-3xl font-bold text-app-text tracking-tight leading-none">Daftar Pelanggan</h1>
                    </div>
                </div>

                <!-- tombol tambah pelanggan (Hanya tampil di Laptop) -->
                <button @click="addModal" class="hidden md:flex bg-app-secondary hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl items-center gap-2 shadow-sm transition">
                    <Plus class="w-3 h-3 stroke-[5]"/>
                    <span>Tambah Pelanggan</span>
                </button>
            </div>

            <!-- card (bg-transparent di Mobile, bg-white di Laptop) -->
            <div class="bg-transparent md:bg-white rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 flex-1 flex flex-col overflow-hidden">

                <!-- search & filter -->
                <div class="p-0 md:p-6 border-b-0 md:border-b border-gray-200 shadow-none md:shadow-lg flex flex-row items-center justify-between gap-2 md:gap-4 mb-4 md:mb-0">
                    
                    <!-- search -->
                    <div class="relative flex-1">
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari"
                            class="w-full pl-4 pr-10 py-1.5 md:py-2.5 text-xs md:text-sm rounded-full md:rounded-xl border border-gray-800 md:border-gray-300 focus:outline-none focus:border-app-primary transition bg-white" 
                        />
                        <Search class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 md:text-gray-400"/>
                    </div>

                    <!-- filter (Mobile Icon / Laptop Dropdown) -->
                    <div class="relative w-auto shrink-0 flex items-center gap-2">
                        
                        <!-- Dropdown Filter Mobile Icon (Tampil di Mobile) -->
                        <div class="relative md:hidden">
                            <select 
                                v-model="selectedFilter"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            >
                                <option value="All">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="ON PROGRESS">On Progress</option>
                                <option value="SELESAI">Selesai</option>
                            </select>
                            <button type="button" class="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg">
                                <Filter class="w-5 h-5 stroke-[2]" />
                            </button>
                        </div>

                        <!-- Dropdown Filter Laptop (Tampil di Laptop) -->
                        <select 
                            v-model="selectedFilter"
                            class="hidden md:block apperarance-none bg-white text-xs font-normal pl-4 pr-10 py-2.5 rounded-xl border focus:outline-none focus:border-app-primary cursor-pointer"
                        >
                            <option value="All">Filter by: Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="ON PROGRESS">On Progress</option>
                            <option value="SELESAI">Selesai</option>
                        </select>

                        <!-- Tombol Tambah Pelanggan Hijau Bulat/Kotak Khusus Mobile -->
                        <button @click="addModal" class="md:hidden bg-app-success hover:opacity-90 text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs transition">
                            <Plus class="w-5 h-5 stroke-[3]"/>
                        </button>
                    </div>

                </div>

                <!-- tabel pelanggan -->
                <div class="p-0 md:p-6 flex-1 overflow-x-auto">
                    <table class="w-full border-collapse min-w-[320px]">
                        <thead>
                            <tr class="border-b border-gray-300 text-xs md:text-sm text-center">
                                <!-- Kolom "No" disembunyikan di Mobile sesuai gambar -->
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
                                <td colspan="6" class="py-6 text-center text-gray-500 font-normal">
                                    Memuat data pelanggan...
                                </td>
                            </tr>

                            <!-- Error State -->
                            <tr v-else-if="apiError">
                                <td colspan="6" class="py-6 text-center text-red-500 font-normal">
                                    {{ apiError }}
                                </td>
                            </tr>

                            <!-- Data Render -->
                            <tr v-else v-for="(item, index) in filterPelanggan" :key="item.idPengaduan || index" class="hover:bg-gray-50 transition">
                                <td class="hidden md:table-cell py-3 font-normal">{{ index + 1 }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center md:text-left">{{ item.pelanggan.namaPelanggan || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center max-w-[100px] truncate">{{ item.keluhan || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center">
                                    <span :class="{
                                        'bg-app-error text-white': item.status.toUpperCase() === 'PENDING',
                                        'bg-app-warning text-white': item.status.toUpperCase() === 'ON PROGRESS' || item.status.toUpperCase() === 'DIPROSES',
                                        'bg-app-success text-white': item.status.toUpperCase() === 'SELESAI'
                                    }"
                                    class="w-[70px] md:w-[110px] py-1 text-[10px] md:text-xs font-normal text-center inline-block rounded-md md:rounded-lg shadow-xs md:shadow-sm">
                                        {{ formatStatus(item.status) }}
                                    </span>
                                </td>
                                <td class="py-2.5 md:py-3 font-normal whitespace-nowrap">{{ formatData(item.updatedAt || item.createdAt) }}</td>
                                <td class="py-2.5 md:py-3">
                                    <div class="flex items-center justify-center gap-1.5 md:gap-2">
                                        <button @click="editModal(item)" class="hover:text-gray-800 transition">
                                            <SquarePen class="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[1.5]" />
                                        </button>
                                        <button @click="$router.push(`/detail_pelanggan/${item.idPengaduan}`)" class="hover:text-gray-800 transition">
                                            <Info class="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[1.5]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!isLoading && !apiError && filterPelanggan.length === 0">
                                <td colspan="6" class="py-3 text-center font-normal">
                                    Data pelanggan tidak ditemukan.
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>

        </div>

        <!-- pop up tambah dan edit pelanggan -->
        <Teleport to="body">
            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    <!-- header -->
                    <div class="bg-app-primary2 px-6 py-3 flex items-center justify-between">
                        <h3 class="text-white font-semibold text-sm">{{ modalTitle }}</h3>
                        <button @click="closeModal" class="text-white/80 hover:text-white transition">
                            <X class="w-5 h-5"/>
                        </button>
                    </div>

                    <div v-if="errorMessage" class="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl flex items-center justify-between">
                        <span>{{ errorMessage }}</span>
                        <button type="button" @click="errorMessage = ''" class="font-normal">&times;</button>
                    </div>

                    <!-- form -->
                    <form @submit.prevent="submitForm" class="p-6 space-y-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium mb-1.5">Nama</label>
                                <input v-model="form.namaPelanggan" type="text" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">Np. HP</label>
                                <input v-model="form.noTelp" inputmode="numeric" @input="form.noTelp = form.noTelp.replace(/\D/g, '')" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">No. Kontak PDAM</label>
                                <input v-model="form.noPdam" inputmode="numeric" @input="form.noPdam = form.noPdam.replace(/\D/g, '')" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">Alamat</label>
                                <input v-model="form.alamat" type="text" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-medium mb-1.5">Keluhan</label>
                            <textarea v-model="form.keluhan" rows="4" class="w-full bg-app-bg border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none resize-none"></textarea>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button type="submit" 
                                :class="{
                                    'bg-app-success hover:opacity-90': modalMode === 'add',
                                    'bg-app-warning hover:opacity-90': modalMode === 'edit'
                                }"
                                class="text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition">
                                Simpan
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </Teleport>

    </layout>
</template>