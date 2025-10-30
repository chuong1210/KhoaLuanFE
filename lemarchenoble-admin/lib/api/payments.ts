import axios from "@/lib/axios"

export const paymentsAPI = {
  // Get payment methods
  getPaymentMethods: async () => {
    const response = await axios.get("/transaction/")
    return response.data
  },

  // Initialize payment (COD or Online)
  initPayment: async (data: any) => {
    const response = await axios.post("/transaction/init", data)
    return response.data
  },
}
