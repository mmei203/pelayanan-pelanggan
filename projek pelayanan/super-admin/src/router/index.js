import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/dashboard.vue'
import DaftarPelanggan from '../components/daftar_pelanggan.vue'
import DetailPelanggan from '../components/detail_pelanggan.vue'
import History from '../components/history.vue'
import Users from '../components/users.vue'

const routes = [
  {path: '/dashboard', name: 'Dashboard', component: Dashboard},
  {path: '/daftar_pelanggan', name: 'Daftar-Pelanggan', component: DaftarPelanggan},
  {path: '/detail_pelanggan/:id', name: 'Detail-Pelanggan', component: DetailPelanggan},
  {path: '/history', name: 'History', component: History},
  {path: '/users', name: 'Users', component: Users},
  {path: '/tambah_pelanggan', name: 'TambahPelanggan', component: () => import('@/components/form_pelanggan.vue')},
  {path: '/edit_pelanggan/:id', name: 'EditPelanggan', component: () => import('@/components/form_pelanggan.vue')},
  {path: '/tambah_user', name: 'TambahUser', component: () => import('@/components/form_user.vue')
  },
  {path: '/edit_user/:id', name: 'EditUser', component: () => import('@/components/form_user.vue')}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router