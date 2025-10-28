import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import ButtonSpinner from '../components/ButtonSpinner'
import { axiosClient } from '../lib/axiosClient'
import { Task, DerivedStatus, Priority } from '../types/task'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { Link } from 'react-router-dom'
import { fetchTasks, toggleTask } from '../services/tasks'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<DerivedStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
  const params: any = { page }
  if (priority !== 'All') params.priority = priority
  const res = await fetchTasks(params)
  setTasks(res.items)
  setMeta(res.meta)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [priority, page])

  const filtered = useMemo(() => {
    if (status === 'All') return tasks
    return tasks.filter(t => t.derived_status === status)
  }, [tasks, status])

  const toggle = async (task: Task) => {
    if (togglingIds.has(task.id)) return
    setTogglingIds(prev => new Set(prev).add(task.id))
    // optimistic update
    const prev = tasks
    const optimistic = prev.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t)
    setTasks(optimistic)
    try {
      const updated = await toggleTask(task.id)
      setTasks(p => p.map(t => t.id === task.id ? updated : t))
    } catch (err: any) {
      setTasks(prev) // rollback
      const status = err?.response?.status
      if (status === 401) return
      alert(err?.response?.data?.message || 'Failed to toggle task')
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(task.id)
        return next
      })
    }
  }

  const remove = async (task: Task) => {
    if (!confirm('Delete task?')) return
    if (deletingIds.has(task.id)) return
    setDeletingIds(prev => new Set(prev).add(task.id))
    try {
      await axiosClient.delete(`/tasks/${task.id}`)
      setTasks(prev => prev.filter(t => t.id !== task.id))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete task')
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(task.id)
        return next
      })
    }
  }

  return (
  <div className="min-h-screen overflow-x-hidden">
      <Navbar />
  <div className="w-full px-4 md:px-6 py-4 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="select">
              {['All','Missed/Late','Due Today','Upcoming','Done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="select">
              {['All','low','medium','high'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Link to="/tasks/new" className="btn-gradient">New Task</Link>
        </div>

  {loading && <Spinner label="Loading tasks…" />}
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
                <button
                  onClick={()=>toggle(task)}
                  disabled={togglingIds.has(task.id)}
                  aria-busy={togglingIds.has(task.id)}
                  className="btn-success inline-flex items-center justify-center gap-2"
                >
                  {togglingIds.has(task.id) && <ButtonSpinner />}
                  <span>{task.is_completed ? 'Mark Incomplete' : 'Mark Done'}</span>
                </button>
                <Link to={`/tasks/${task.id}/edit`} className="btn-warning">Edit</Link>
                <button
                  onClick={()=>remove(task)}
                  disabled={deletingIds.has(task.id)}
                  aria-busy={deletingIds.has(task.id)}
                  className="btn-danger inline-flex items-center justify-center gap-2"
                >
                  {deletingIds.has(task.id) && <ButtonSpinner />}
                  <span>Delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
        {meta && (
          <div className="mt-4 flex items-center justify-between">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Page {meta.current_page} of {meta.last_page}
            </div>
            <button
              className="btn-secondary"
              disabled={!meta.has_more}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
