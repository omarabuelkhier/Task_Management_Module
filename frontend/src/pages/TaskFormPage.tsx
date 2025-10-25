import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { axiosClient } from '../lib/axiosClient'
import { useNavigate, useParams } from 'react-router-dom'
import { Task } from '../types/task'

export default function TaskFormPage() {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium')
  const [assigneeEmail, setAssigneeEmail] = useState('bob@example.com')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return
      try {
        const { data } = await axiosClient.get<Task>(`/tasks/${id}`)
        setTitle(data.title)
        setDescription(data.description || '')
        setDueDate(data.due_date.slice(0,16))
        setPriority(data.priority)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load task')
      }
    }
    load()
  }, [id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await axiosClient.put(`/tasks/${id}`, {
          title,
          description: description || null,
          due_date: new Date(dueDate).toISOString(),
          priority,
        })
      } else {
        await axiosClient.post('/tasks', {
          title,
          description: description || null,
          due_date: new Date(dueDate).toISOString(),
          priority,
          assignee_email: assigneeEmail,
        })
      }
      navigate('/tasks')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto p-4">
        <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow space-y-3">
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit Task' : 'New Task'}</h1>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={4} />
          </div>
          <div>
            <label className="block text-sm">Due Date</label>
            <input value={dueDate} onChange={e=>setDueDate(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="datetime-local" required />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm">Assignee Email</label>
              <input value={assigneeEmail} onChange={e=>setAssigneeEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="email" required />
            </div>
          )}
          <div>
            <label className="block text-sm">Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="mt-1 w-full border rounded px-3 py-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
