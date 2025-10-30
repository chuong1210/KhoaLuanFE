import axios from "axios"
import { cookies } from "@/lib/utils/cookies"

const axiosInstance = axios.create({
  baseURL: "https://lemarchenoble.id.vn/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = cookies.get("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cookies.remove("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
export const apiClient = axiosInstance
