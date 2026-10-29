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
    }
}