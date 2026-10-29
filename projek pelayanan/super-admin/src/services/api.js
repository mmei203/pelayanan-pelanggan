import axios from 'axios' 

const apiClient = axios.create({
    baseURL: 'http://localhost:5500/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

})

export default apiClient