import apiClient from './api'

export default {
    getAll(){
        return apiClient.get('/pelanggan')
    },
    create(data){
        return apiClient.post('/pelanggan', data)
    },
    update(id, data){
        return apiClient.put(`/pelanggan/${id}`, data)
    },
    detail(id){
        return apiClient.get(`/pelanggan/${id}`)
    },
    history(){
        return apiClient.get('pelanggan/history')
    },
    users(){
        return apiClient.get('users')
    },
    createUser(data){
        return apiClient.post('users', data)
    }
}