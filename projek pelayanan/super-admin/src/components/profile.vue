<script setup>
import layout from './layout.vue'
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, Search, Plus, X, Filter, Eye, EyeOff } from 'lucide-vue-next'
import router from '@/router/index.js'
import superServices from '@/services/superServices.js'

// State tambah user
const isModalOpen = ref(false)
const modalTitle = ref('Tambah User')
const errorMessage = ref('')
const showPassword = ref(false) // State untuk toggle lihat password

// Get users
const userList = ref([])
const isLoading = ref(false)
const apiError = ref('')

const fetchUsers = async () => {
    isLoading.value = true
    apiError.value = ''
    try {
        const response = await superServices.users()
        userList.value = response.data?.data || response.data || []
    } catch (error) {
        apiError.value = 'Gagal mengambil data user.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

// Panggil fetch pada mounted
onMounted(() => {
    fetchUsers()
})

// Form data user baru sesuai Swagger POST /users
const form = ref({
    namaUser: '',
    email: '',
    username: '',
    password: '',
    role: 'Operator'
})

// Modal Tambah User
const addModal = () => {
    errorMessage.value = ''
    modalTitle.value = 'Tambah User'
    showPassword.value = false
    form.value = { 
        namaUser: '', 
        email: '', 
        username: '', 
        password: '',
        role: 'Operator' 
    }
    isModalOpen.value = true
}

// Submit Form Tambah User Terhubung ke POST /users
const submitForm = async () => {
    errorMessage.value = ''
    // Cek field kosong
    if (
        !form.value.namaUser?.trim() ||
        !form.value.email?.trim() ||
        !form.value.username?.trim() ||
        !form.value.password?.trim() ||
        !form.value.role?.trim()
    ) {
        errorMessage.value = 'Semua field harus diisi!'
        return
    }

    try {
        const payloadCreate = {
            namaUser: form.value.namaUser,
            email: form.value.email,
            username: form.value.username,
            password: form.value.password,
            role: form.value.role
        }
        
        // Memanggil service POST /users
        const res = await superServices.createUser(payloadCreate)
        console.log('User baru berhasil ditambahkan:', res.data)
        
        await fetchUsers()
        isModalOpen.value = false
    } catch (error) {
        errorMessage.value = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan data user.'
        console.error('Detail Error:', error.response?.data || error)
    }
}

const closeModal = () => {
    errorMessage.value = ''
    showPassword.value = false
    isModalOpen.value = false
}

// Search & Filter
const searchQuery = ref('')
const selectedFilter = ref('All')

// Logika Search & Filter berdasarkan Role User
const filterUsers = computed(() => {
    return userList.value.filter(item => {
        const nama = item.namaUser || ''
        const email = item.email || ''
        const username = item.username || ''
        const role = item.role || ''

        // Search
        const matchSearch =
            nama.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
            email.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
            username.toLowerCase().includes(searchQuery.value.toLowerCase().trim())

        // Filter Role
        const matchRole = selectedFilter.value === 'All' || role.toUpperCase() === selectedFilter.value.toUpperCase()

        return matchSearch && matchRole
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

// Format Text
const formatText = (text) => {
    if (!text) return '-'
    return text
}
</script>

<template>
    <layout>
        <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 flex flex-col h-full px-2 sm:px-4 md:px-0">
            
            <!-- Judul Halaman & Tombol Tambah -->
            <div class="flex items-center md:items-end justify-between">
                <div>
                    <!-- Breadcrumb (Hanya tampil di Laptop) -->
                    <nav class="hidden md:flex text-xs mb-1 items-center gap-1 font-normal">
                        <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
                        <span>&gt;</span>
                        <span>Daftar Users</span>
                    </nav>
                    
                    <!-- Judul -->
                    <div class="flex items-center gap-2">
                        <button @click="$router.push('/dashboard')" class="hover:opacity-75 transition">
                            <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]" />
                        </button>
                        <h1 class="text-xl md:text-3xl font-bold text-app-text tracking-tight leading-none">Daftar Users</h1>
                    </div>
                </div>

                <!-- Tombol Tambah User (Hanya tampil di Laptop) -->
                <button @click="addModal" class="hidden md:flex bg-app-secondary hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl items-center gap-2 shadow-sm transition">
                    <Plus class="w-3 h-3 stroke-[5]"/>
                    <span>Tambah User</span>
                </button>
            </div>

            <!-- Card Container -->
            <div class="bg-transparent md:bg-white rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 flex-1 flex flex-col overflow-hidden">

                <!-- Search & Filter -->
                <div class="p-0 md:p-6 border-b-0 md:border-b border-gray-200 shadow-none md:shadow-lg flex flex-row items-center justify-between gap-2 md:gap-4 mb-4 md:mb-0">
                    
                    <!-- Search Input -->
                    <div class="relative flex-1">
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari user..."
                            class="w-full pl-4 pr-10 py-1.5 md:py-2.5 text-xs md:text-sm rounded-full md:rounded-xl border border-gray-800 md:border-gray-300 focus:outline-none focus:border-app-primary transition bg-white" 
                        />
                        <Search class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 md:text-gray-400"/>
                    </div>

                    <!-- Filter Dropdown -->
                    <div class="relative w-auto shrink-0 flex items-center gap-2">
                        
                        <!-- Dropdown Filter Mobile Icon (Tampil di Mobile) -->
                        <div class="relative md:hidden">
                            <select 
                                v-model="selectedFilter"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            >
                                <option value="All">Semua Role</option>
                                <option value="CS">CS</option>
                                <option value="OPERATOR">Operator</option>
                                <option value="MONITORING">Monitoring</option>
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
                            <option value="All">Filter by: Role</option>
                            <option value="CS">CS</option>
                            <option value="OPERATOR">Operator</option>
                            <option value="MONITORING">Monitoring</option>
                        </select>

                        <!-- Tombol Tambah User Khusus Mobile -->
                        <button @click="addModal" class="md:hidden bg-app-success hover:opacity-90 text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs transition">
                            <Plus class="w-5 h-5 stroke-[3]"/>
                        </button>
                    </div>

                </div>

                <!-- Tabel Users -->
                <div class="p-0 md:p-6 flex-1 overflow-x-auto">
                    <table class="w-full border-collapse min-w-[320px]">
                        <thead>
                            <tr class="border-b border-gray-300 text-xs md:text-sm text-center">
                                <th class="hidden md:table-cell pb-3.5 w-12 font-medium">No</th>
                                <th class="pb-2 md:pb-3.5 font-medium leading-tight text-center md:text-left">Nama User</th>
                                <th class="pb-2 md:pb-3.5 font-medium text-center">Email</th>
                                <th class="pb-2 md:pb-3.5 font-medium text-center">Username</th>
                                <th class="pb-2 md:pb-3.5 font-medium text-center">Role</th>
                                <!-- <th class="pb-2 md:pb-3.5 font-medium text-center">Tanggal Dibuat</th> -->
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-300 text-[11px] md:text-xs text-center">
                            <!-- Loading State -->
                            <tr v-if="isLoading">
                                <td colspan="6" class="py-6 text-center text-gray-500 font-normal">
                                    Memuat data user...
                                </td>
                            </tr>

                            <!-- Error State -->
                            <tr v-else-if="apiError">
                                <td colspan="6" class="py-6 text-center text-red-500 font-normal">
                                    {{ apiError }}
                                </td>
                            </tr>

                            <!-- Data Render -->
                            <tr v-else v-for="(item, index) in filterUsers" :key="item.idUser || index" class="hover:bg-gray-50 transition">
                                <td class="hidden md:table-cell py-3 font-normal">{{ index + 1 }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center md:text-left">{{ item.namaUser || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center">{{ item.email || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center">{{ item.username || '-' }}</td>
                                <td class="py-2.5 md:py-3 font-normal text-center">
                                    <span :class="{
                                        'bg-app-secondary text-white': (item.role || '').toUpperCase() === 'CS',
                                        'bg-app-warning text-white': (item.role || '').toUpperCase() === 'OPERATOR',
                                        'bg-app-success text-white': (item.role || '').toUpperCase() === 'MONITORING' || (item.role || '').toUpperCase() === 'ADMIN'
                                    }"
                                    class="w-[70px] md:w-[110px] py-1 text-[10px] md:text-xs font-normal text-center inline-block rounded-md md:rounded-lg shadow-xs md:shadow-sm">
                                        {{ formatText(item.role) }}
                                    </span>
                                </td>
                                <!-- <td class="py-2.5 md:py-3 font-normal whitespace-nowrap">{{ formatData(item.createdAt) }}</td> -->
                            </tr>

                            <!-- Empty State -->
                            <tr v-if="!isLoading && !apiError && filterUsers.length === 0">
                                <td colspan="6" class="py-3 text-center font-normal">
                                    Data user tidak ditemukan.
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>

        </div>

        <!-- Pop Up Tambah User -->
        <Teleport to="body">
            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    <!-- Header Modal -->
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

                    <!-- Form Tambah User -->
                    <form @submit.prevent="submitForm" class="p-6 space-y-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium mb-1.5">Nama User</label>
                                <input v-model="form.namaUser" type="text" placeholder="Masukkan nama user" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">Email</label>
                                <input v-model="form.email" type="email" placeholder="contoh@pald.co.id" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">Username</label>
                                <input v-model="form.username" type="text" placeholder="Masukkan username" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-medium mb-1.5">Role</label>
                                <select v-model="form.role" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none cursor-pointer">
                                    <option value="CS">CS</option>
                                    <option value="Operator">Operator</option>
                                    <option value="Monitoring">Monitoring</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-medium mb-1.5">Password</label>
                            <div class="relative w-full">
                                <input 
                                    v-model="form.password" 
                                    :type="showPassword ? 'text' : 'password'" 
                                    placeholder="Masukkan password" 
                                    class="w-full bg-app-bg rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none"
                                />
                                <button 
                                    type="button" 
                                    @click="showPassword = !showPassword"
                                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                >
                                    <Eye v-if="!showPassword" class="w-4 h-4" />
                                    <EyeOff v-else class="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4">
                            <button type="submit" class="bg-app-success hover:opacity-90 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition">
                                Simpan
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </Teleport>

    </layout>
</template>