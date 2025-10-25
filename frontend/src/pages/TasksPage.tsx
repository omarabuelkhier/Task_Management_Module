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
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="select">
              {['All','Missed/Late','Due Today','Upcoming','Done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="select">
              {['All','low','medium','high'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Link to="/tasks/new" className="btn-primary">New Task</Link>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        <ul className="grid grid-cols-1 gap-3 sm:gap-4">
          {filtered.map(task => (
            <li key={task.id} className="card flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {task.title}
                  {task.derived_status && <StatusBadge status={task.derived_status} />}
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.description && <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>}
                <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggle(task)} className="btn-secondary">
                  {task.is_completed ? 'Mark Incomplete' : 'Mark Done'}
                </button>
                <Link to={`/tasks/${task.id}/edit`} className="btn-secondary">Edit</Link>
                <button onClick={()=>remove(task)} className="btn-danger">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
