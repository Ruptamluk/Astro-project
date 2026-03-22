// API utilities for communicating with the backend

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  success?: boolean
  data?: T
  detail?: string
  message?: string
  [key: string]: any
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Auth APIs
export const authAPI = {
  requestOTP: (email?: string, phone?: string) =>
    apiCall('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(
        email ? { email } : { phone }
      ),
    }),

  verifyOTP: (otp: string, email?: string, phone?: string) =>
    apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(
        email ? { email, otp } : { phone, otp }
      ),
    }),

  getUser: (userId: string) =>
    apiCall(`/api/auth/user/${userId}`),
}

// Prediction APIs
export const predictionAPI = {
  submitDOB: (userId: string, dob: string) =>
    apiCall(`/api/predictions/submit-dob/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ dob }),
    }),

  getPrediction: (userId: string) =>
    apiCall(`/api/predictions/get-prediction/${userId}`),
}
