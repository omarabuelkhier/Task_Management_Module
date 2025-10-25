import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { axiosClient } from '../lib/axiosClient'
import { Task, DerivedStatus, Priority } from '../types/task'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { Link } from 'react-router-dom'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<DerivedStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (priority !== 'All') params.priority = priority
      const { data } = await axiosClient.get<Task[]>('/tasks', { params })
      setTasks(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [priority])

  const filtered = useMemo(() => {
    if (status === 'All') return tasks
    return tasks.filter(t => t.derived_status === status)
  }, [tasks, status])

  const toggle = async (task: Task) => {
    try {
      const { data } = await axiosClient.post<Task>(`/tasks/${task.id}/toggle`)
      setTasks(prev => prev.map(t => t.id === task.id ? data : t))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle task')
    }
  }

  const remove = async (task: Task) => {
    if (!confirm('Delete task?')) return
    try {
      await axiosClient.delete(`/tasks/${task.id}`)
      setTasks(prev => prev.filter(t => t.id !== task.id))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete task')
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded px-2 py-1">
              {['All','Missed/Late','Due Today','Upcoming','Done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="border rounded px-2 py-1">
              {['All','low','medium','high'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Link to="/tasks/new" className="px-3 py-1.5 bg-blue-600 text-white rounded">New Task</Link>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <ul className="space-y-2">
          {filtered.map(task => (
            <li key={task.id} className="bg-white p-3 rounded border flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {task.title}
                  {task.derived_status && <StatusBadge status={task.derived_status} />}
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggle(task)} className="px-2 py-1 border rounded">
                  {task.is_completed ? 'Mark Incomplete' : 'Mark Done'}
                </button>
                <Link to={`/tasks/${task.id}/edit`} className="px-2 py-1 border rounded">Edit</Link>
                <button onClick={()=>remove(task)} className="px-2 py-1 border rounded text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
