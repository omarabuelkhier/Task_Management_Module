import { axiosClient } from '../lib/axiosClient'
import { Task } from '../types/task'

export type ApiEnvelope<T> = {
  data: T
  message?: string
  success?: boolean
  meta?: any
}

export async function fetchTasks(params?: { priority?: string, page?: number, per_page?: number }) {
  const { data } = await axiosClient.get<ApiEnvelope<Task[]>>('/tasks', { params })
  return { items: data.data, meta: data.meta }
}

export async function fetchTask(id: number) {
  const { data } = await axiosClient.get<ApiEnvelope<Task>>(`/tasks/${id}`)
  return data.data
}

export async function createTask(payload: any) {
  const { data } = await axiosClient.post<ApiEnvelope<Task>>('/tasks', payload)
  return data.data
}

export async function updateTask(id: number, payload: any) {
  const { data } = await axiosClient.put<ApiEnvelope<Task>>(`/tasks/${id}`, payload)
  return data.data
}

export async function deleteTask(id: number) {
  await axiosClient.delete(`/tasks/${id}`)
}

export async function toggleTask(id: number) {
  const { data } = await axiosClient.post<ApiEnvelope<Task>>(`/tasks/${id}/toggle`)
  return data.data
}
