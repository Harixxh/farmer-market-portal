import axios from 'axios'

const API_BASE_URL = 'https://farmer-market-portal.onrender.com'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if we're not already on the login page
            // and the request wasn't part of a batch fetch (which handles its own errors)
            const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup'
            if (!isLoginPage && !error.config?._skipAuthRedirect) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleAuth: (data) => api.post('/auth/google', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    verifyOTP: (data) => api.post('/auth/verify-reset-otp', data),
    resetPassword: (data) => api.post('/auth/reset-password', data)
}

// Profile API
export const profileAPI = {
    getProfile: () => api.get('/api/profile/me'),
    updateBasicInfo: (data) => api.put('/api/profile/basic', data),
    updateFarmerProfile: (data) => api.put('/api/profile/farmer', data),
    updateBuyerProfile: (data) => api.put('/api/profile/buyer', data),
    getFarmerStats: () => api.get('/api/profile/farmer/stats'),
    getBuyerStats: () => api.get('/api/profile/buyer/stats'),
    getAllBuyers: () => api.get('/api/profile/buyers'),
    getAllFarmers: () => api.get('/api/profile/farmers')
}

// Produce API
export const produceAPI = {
    create: (data) => api.post('/api/produce', data),
    getMyProduce: () => api.get('/api/produce/my'),
    getStats: () => api.get('/api/produce/stats'),
    getMarketplace: () => api.get('/api/produce/marketplace'),
    getById: (id) => api.get(`/api/produce/${id}`),
    update: (id, data) => api.put(`/api/produce/${id}`, data),
    markAsSold: (id) => api.patch(`/api/produce/${id}/sold`),
    delete: (id) => api.delete(`/api/produce/${id}`)
}

// Order API
export const orderAPI = {
    create: (data) => api.post('/api/orders', data),
    getBuyerOrders: () => api.get('/api/orders/buyer'),
    getFarmerOrders: () => api.get('/api/orders/farmer'),
    getById: (id) => api.get(`/api/orders/${id}`),
    updateStatus: (id, data) => api.patch(`/api/orders/${id}/status`, data),
    cancel: (id) => api.patch(`/api/orders/${id}/cancel`)
}

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/api/admin/dashboard'),
    getAllUsers: (params) => api.get('/api/admin/users', { params }),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    updateUserRole: (id, data) => api.patch(`/api/admin/users/${id}/role`, data),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    getAllProduce: (params) => api.get('/api/admin/produce', { params }),
    deleteProduce: (id) => api.delete(`/api/admin/produce/${id}`),
    getAllOrders: (params) => api.get('/api/admin/orders', { params }),
    verifyBuyer: (id) => api.patch(`/api/admin/buyers/${id}/verify`)
}

export default api
