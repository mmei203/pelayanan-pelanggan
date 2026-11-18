import apiClient from './api'

export default {
    getAll(){
        return apiClient.get('/pelanggan')
    },
    detail(id){
        return apiClient.get(`/pelanggan/${id}`)
    },
    history(){
        return apiClient.get('/pelanggan/history')
    },
    print(id) {
        return apiClient.get(`/pelanggan/${id}/print`, {
            responseType: 'blob' // Agar menerima return dalam bentuk file binary/PDF
        })
    },
}