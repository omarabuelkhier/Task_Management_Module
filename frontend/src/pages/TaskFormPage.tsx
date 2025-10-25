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
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <form onSubmit={onSubmit} className="card space-y-3 sm:space-y-4">
          <h1>{isEdit ? 'Edit Task' : 'New Task'}</h1>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <label className="label">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="textarea mt-1" />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input value={dueDate} onChange={e=>setDueDate(e.target.value)} className="input mt-1" type="datetime-local" required />
          </div>
          {!isEdit && (
            <div>
              <label className="label">Assignee Email</label>
              <input value={assigneeEmail} onChange={e=>setAssigneeEmail(e.target.value)} className="input mt-1" type="email" required />
            </div>
          )}
          <div>
            <label className="label">Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="select mt-1">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
