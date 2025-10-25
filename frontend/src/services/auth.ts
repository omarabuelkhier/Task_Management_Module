import { axiosClient } from '../lib/axiosClient'

export async function register(name: string, email: string, password: string) {
  const { data } = await axiosClient.post('/auth/register', { name, email, password })
  return data
}

export async function login(email: string, password: string) {
  const { data } = await axiosClient.post('/auth/login', { email, password })
  return data
}

export async function logout() {
  await axiosClient.post('/auth/logout')
}
