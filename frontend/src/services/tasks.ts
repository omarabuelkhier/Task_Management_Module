import { axiosClient } from '../lib/axiosClient'
import { Task } from '../types/task'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: any
}

export async function fetchTasks(params?: { priority?: string, page?: number, per_page?: number }) {
  const { data } = await axiosClient.get<ApiResponse<Task[]>>('/tasks', { params })
  return { items: data.data, meta: data.meta }
}

export async function fetchTask(id: number) {
  const { data } = await axiosClient.get<Task>(`/tasks/${id}`)
  return data
}

export async function createTask(payload: any) {
  const { data } = await axiosClient.post<Task>('/tasks', payload)
  return data
}

export async function updateTask(id: number, payload: any) {
  const { data } = await axiosClient.put<Task>(`/tasks/${id}`, payload)
  return data
}

export async function deleteTask(id: number) {
  await axiosClient.delete(`/tasks/${id}`)
}

export async function toggleTask(id: number) {
  const { data } = await axiosClient.post<Task>(`/tasks/${id}/toggle`)
  return data
}
