import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/dashboard.vue'
import DaftarPelanggan from '../components/daftar_pelanggan.vue'
import DetailPelanggan from '../components/detail_pelanggan.vue'
import History from '../components/history.vue'
import Profile from '../components/profile.vue'
import Login from '../components/login.vue'

const routes = [
  {path: '/dashboard', name: 'Dashboard', component: Dashboard},
  {path: '/daftar_pelanggan', name: 'Daftar-Pelanggan', component: DaftarPelanggan},
  {path: '/detail_pelanggan/:id', name: 'Detail-Pelanggan', component: DetailPelanggan},
  {path: '/history', name: 'History', component: History},
  {path: '/profile', name: 'Profile', component: Profile},
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router