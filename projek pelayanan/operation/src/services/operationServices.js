import apiClient from './api'

export default {
    getAll(){
        return apiClient.get('/pelanggan')
    },
    create(data){
        return apiClient.post('/pelanggan/tambah-pelanggan', data)
    },
    update(id, data) {
    return apiClient.put(`/pelanggan/${id}`, data, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
    })
    },
    getById(id){
        return apiClient.get(`/pelanggan/${id}`)
    },
    history(){
        return apiClient.get('/pelanggan/history')
    }
}