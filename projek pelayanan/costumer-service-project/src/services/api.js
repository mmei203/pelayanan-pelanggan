import axios from 'axios' 

const apiClient = axios.create({
    baseURL: 'https://backend-pelayanan-pelanggan.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

})

export default apiClient