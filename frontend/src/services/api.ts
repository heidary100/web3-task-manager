import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authApi = {
  getNonce: async (address: string) => {
    const response = await api.post("/auth/nonce", { address })
    return response.data
  },

  verifySignature: async (data: { address: string; signature: string; nonce: string }) => {
    const response = await api.post("/auth/verify", data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },
}

// Tasks API
export const tasksApi = {
  getTasks: async (page = 1, limit = 50) => {
    const response = await api.get(`/tasks?page=${page}&limit=${limit}`)
    return response.data
  },

  getTask: async (id: number) => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data: { title: string; description?: string }) => {
    const response = await api.post("/tasks", data)
    return response.data
  },

  updateTask: async (id: number, data: { title?: string; description?: string; status?: string }) => {
    const response = await api.patch(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },
}
