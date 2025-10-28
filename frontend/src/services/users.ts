import { axiosClient } from '../lib/axiosClient'

export type UserLite = {
  id: number
  name: string
  email: string
}

export async function fetchUsers(q?: string): Promise<UserLite[]> {
  const { data } = await axiosClient.get('/users', { params: q ? { q } : undefined })
  if (Array.isArray(data)) return data as UserLite[]
  if (data && Array.isArray(data.data)) return data.data as UserLite[]
  return []
}
