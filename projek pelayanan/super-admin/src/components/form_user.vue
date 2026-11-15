<script setup>
import layout from './layout.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Eye, EyeOff } from 'lucide-vue-next'
import superServices from '@/services/superServices.js'

const route = useRoute()
const router = useRouter()

const idUser = route.params.id
const isEdit = computed(() => !!idUser)

const errorMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const form = ref({
    namaUser: '',
    email: '',
    username: '',
    password: '',
    role: 'Operator'
})

onMounted(async () => {
    if (isEdit.value) {
        try {
            const res = await superServices.users()
            const users = res.data?.data || res.data || []
            const user = users.find(u => (u.idUser || u.id) === idUser)
            if (user) {
                form.value = {
                    namaUser: user.namaUser || '',
                    email: user.email || '',
                    username: user.username || '',
                    password: '',
                    role: user.role || 'Operator'
                }
            }
        } catch (err) {
            errorMessage.value = 'Gagal memuat data user'
        }
    }
})

// Helper pemetaan role UI ke Enum Prisma Backend (Super Admin -> Super_Admin)
const mapRoleToBackend = (role) => {
    if (!role) return 'Operator'
    const clean = String(role).trim()
    
    if (clean === 'Super Admin' || clean.toLowerCase().includes('super')) {
        return 'Super_Admin'
    }
    return clean
}

const submitForm = async () => {
    errorMessage.value = ''
    if (
        !form.value.namaUser?.trim() ||
        !form.value.email?.trim() ||
        !form.value.username?.trim() ||
        !form.value.role?.trim() ||
        (!isEdit.value && !form.value.password?.trim())
    ) {
        errorMessage.value = 'Semua field wajib harus diisi!'
        return
    }

    isSubmitting.value = true
    try {
        const payloadRole = mapRoleToBackend(form.value.role)

        if (isEdit.value) {
            const payloadUpdate = {
                namaUser: form.value.namaUser.trim(),
                email: form.value.email.trim(),
                username: form.value.username.trim(),
                role: payloadRole
            }
            
            if (form.value.password && form.value.password.trim() !== '') {
                payloadUpdate.password = form.value.password.trim()
            }
            
            await superServices.updateUser(idUser, payloadUpdate)
        } else {
            await superServices.createUser({
                namaUser: form.value.namaUser.trim(),
                email: form.value.email.trim(),
                username: form.value.username.trim(),
                password: form.value.password.trim(),
                role: payloadRole
            })
        }
        router.push('/users')
    } catch (error) {
        errorMessage.value = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan data user.'
        console.error('Detail Error Backend:', error.response?.data || error)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <layout>
        <div class="max-w-xl mx-auto space-y-4 px-2 sm:px-4 py-2">
            
            <!-- Judul Halaman Mobile -->
            <div class="flex items-center gap-2">
                <button @click="$router.push('/users')" class="hover:opacity-75 transition">
                    <ChevronLeft class="w-6 h-6 stroke-[2.5]" />
                </button>
                <h1 class="text-xl font-bold text-app-text tracking-tight leading-none">
                    {{ isEdit ? 'Edit User' : 'Tambah User' }}
                </h1>
            </div>

            <!-- Error Notification -->
            <div v-if="errorMessage" class="p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl">
                {{ errorMessage }}
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                <div>
                    <label class="block text-xs font-medium mb-1.5">Nama User</label>
                    <input v-model="form.namaUser" type="text" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">Email</label>
                    <input v-model="form.email" type="email" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">Username</label>
                    <input v-model="form.username" type="text" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">Role</label>
                    <select v-model="form.role" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none cursor-pointer">
                        <option value="Super Admin">Super Admin</option>
                        <option value="CS">CS</option>
                        <option value="Operator">Operator</option>
                        <option value="Pengawas">Pengawas</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">Password {{ isEdit ? '(Opsional)' : '' }}</label>
                    <div class="relative w-full">
                        <input 
                            v-model="form.password" 
                            :type="showPassword ? 'text' : 'password'" 
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

                <div class="pt-2">
                    <button type="submit" 
                        :disabled="isSubmitting"
                        :class="isEdit ? 'bg-app-warning hover:opacity-90' : 'bg-app-success hover:opacity-90'"
                        class="w-full text-white text-xs font-semibold py-3 rounded-xl shadow-sm transition disabled:opacity-50">
                        {{ isSubmitting ? 'Memproses...' : 'Simpan' }}
                    </button>
                </div>
            </form>
        </div>
    </layout>
</template>