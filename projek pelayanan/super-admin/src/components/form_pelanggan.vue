<script setup>
import layout from './layout.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import superServices from '@/services/superServices.js'

const route = useRoute()
const router = useRouter()

// Cek apakah mode Edit (ada parameter ID di URL) atau Tambah
const idPengaduan = route.params.id
const isEdit = computed(() => !!idPengaduan)

const errorMessage = ref('')
const isSubmitting = ref(false)

const form = ref({
    namaPelanggan: '',
    noTelp: '',
    noPdam: '',
    alamat: '',
    saluranKeluhan: '',
    sumberAduan: '',
    keluhan: '',
    status: 'PENDING'
})

onMounted(async () => {
    // Jika mode edit, fetch detail data pelanggan
    if (isEdit.value) {
        try {
            const res = await superServices.detail(idPengaduan)
            const item = res.data?.data || res.data

            const rawSaluran = String(item.saluranKeluhan || '').toLowerCase().trim()
            let mappedSaluran = ''
            if (rawSaluran === 'datang_ketempat' || rawSaluran.includes('datang')) mappedSaluran = 'Datang_Ketempat'
            else if (rawSaluran === 'telepon' || rawSaluran.includes('telp')) mappedSaluran = 'Telepon'
            else if (rawSaluran === 'whatsapp' || rawSaluran.includes('temuan') || rawSaluran.includes('lapangan')) mappedSaluran = 'Whatsapp'

            const rawSumber = String(item.sumberAduan || '').toLowerCase().trim()
            let mappedSumber = ''
            if (rawSumber === 'non_pelanggan' || rawSumber.includes('non')) mappedSumber = 'Non_Pelanggan'
            else if (rawSumber === 'pelanggan' || rawSumber.includes('pelanggan')) mappedSumber = 'Pelanggan'

            form.value = {
                namaPelanggan: item.pelanggan?.namaPelanggan || '',
                noTelp: item.pelanggan?.noHp || '',
                noPdam: item.pelanggan?.noKontakPdam || '',
                alamat: item.pelanggan?.alamat || '',
                saluranKeluhan: mappedSaluran,
                sumberAduan: mappedSumber,
                keluhan: item.keluhan || '',
                status: item.status || 'PENDING'
            }
        } catch (err) {
            errorMessage.value = 'Gagal memuat data pelanggan'
        }
    }
})

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
        if (isEdit.value) {
            const payloadUpdate = {
                namaUser: form.value.namaUser.trim(),
                email: form.value.email.trim(),
                username: form.value.username.trim(),
                role: form.value.role.toUpperCase()
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
                role: form.value.role.toUpperCase()
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
                <button @click="$router.push('/daftar_pelanggan')" class="hover:opacity-75 transition">
                    <ChevronLeft class="w-6 h-6 stroke-[2.5]" />
                </button>
                <h1 class="text-xl font-bold text-app-text tracking-tight leading-none">
                    {{ isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan' }}
                </h1>
            </div>

            <!-- Error Notification -->
            <div v-if="errorMessage" class="p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl">
                {{ errorMessage }}
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                <div>
                    <label class="block text-xs font-medium mb-1.5">Nama</label>
                    <input v-model="form.namaPelanggan" type="text" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none">
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">No. HP</label>
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

                <!-- Dropdown Saluran Keluhan -->
                <div>
                    <label class="block text-xs font-medium mb-1.5">Saluran Keluhan</label>
                    <select v-model="form.saluranKeluhan" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none cursor-pointer">
                        <option value="" disabled selected hidden></option>
                        <option value="Datang_Ketempat">Datang Langsung</option>
                        <option value="Telepon">Via Telepon</option>
                        <option value="Whatsapp">Temuan Lapangan</option>
                    </select>
                </div>

                <!-- Dropdown Sumber Aduan -->
                <div>
                    <label class="block text-xs font-medium mb-1.5">Sumber Aduan</label>
                    <select v-model="form.sumberAduan" class="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none cursor-pointer">
                        <option value="" disabled selected hidden></option>
                        <option value="Pelanggan">Pelanggan</option>
                        <option value="Non_Pelanggan">Non Pelanggan</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-medium mb-1.5">Keluhan</label>
                    <textarea v-model="form.keluhan" rows="3" class="w-full bg-app-bg border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#427AA1] outline-none resize-none"></textarea>
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