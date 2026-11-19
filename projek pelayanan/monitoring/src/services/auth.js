import apiClient from './api'

export default {
    login(credentials) {
        return apiClient.post('/auth/login', credentials)
    },
    logout() {
        const token = localStorage.getItem('token')
        return apiClient.post(
        '/auth/logout',
        {},
        {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
        )
    },
    forgotPassword(payload) {
        return apiClient.post('/auth/forgot-password', payload)
    },
    resetPassword(payload) {
        return apiClient.post('/auth/reset-password', payload)
    },
    getMe() {
        return apiClient.get('/auth/me', {
            headers: getAuthHeader()
        })
    },
    updateProfile(data) {
        const token = localStorage.getItem('token')
        return apiClient.put('/auth/profile', data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
    }
}