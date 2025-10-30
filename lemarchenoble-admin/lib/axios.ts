import axios from "axios"
import { store } from "@/store"

const API_GATEWAY = "https://lemarchenoble.id.vn/api/v1"

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const state = store.getState()
  const token = state.auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch({ type: "auth/logout" })
    }
    return Promise.reject(error)
  },
)

export default apiClient
