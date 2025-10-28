import axios from 'axios'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  withCredentials: false,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

export function setAuthToken(token: string | null) {
  if (token) {
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axiosClient.defaults.headers.common['Authorization']
  }
}

// Centralize 401 handling: clear auth and bounce to login
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 429) {
      // Too Many Requests: show a polite message
      if (typeof window !== 'undefined') {
        // avoid spamming multiple alerts by debouncing through a flag
        const flag = '__tm_429_shown__'
        if (!(window as any)[flag]) {
          (window as any)[flag] = true
          alert('Too many requests. Please wait a moment and try again.')
          setTimeout(() => { (window as any)[flag] = false }, 3000)
        }
      }
    }
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('tm_token')
        localStorage.removeItem('tm_user')
      } catch {}
      // soft redirect; avoids tight coupling to router here
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
