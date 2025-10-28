import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { axiosClient } from '../lib/axiosClient'
import { fetchTask, updateTask, createTask } from '../services/tasks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Task } from '../types/task'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserLite } from '../services/users'
import UserSelect from '../components/UserSelect'

const baseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  priority: z.enum(['low','medium','high']),
})

const createSchema = baseSchema

const editSchema = baseSchema

type FormValues = z.infer<typeof createSchema>

export default function TaskFormPage() {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id
  const isEdit = Boolean(id)
  const [selectedUser, setSelectedUser] = useState<UserLite | null>(null)
  const [serverError, setServerError] = useState<string>('')
  const initialValuesRef = useRef<FormValues | null>(null)
  const resolver = useMemo(() => zodResolver(isEdit ? editSchema : createSchema), [isEdit])
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isSubmitted } } = useForm<FormValues>({
    resolver,
    defaultValues: { title: '', description: '', date: '', time: '', priority: 'medium' }
  })
  
  // On mobile, make sure focused inputs scroll into view before native pickers open
  const handleFocusCenter = (e: React.FocusEvent<HTMLElement>) => {
    // Prefer coarse pointer heuristic to detect touch devices
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      const el = e.target as HTMLElement
      // Delay to allow browser to schedule focus, then center the element
      setTimeout(() => {
        try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }) } catch {}
      }, 0)
    }
  }
  
  // Clear any previous error when switching modes/routes
  useEffect(() => { setServerError('') }, [isEdit])

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return
      try {
        const task = await fetchTask(Number(id))
        const d = new Date(task.due_date)
        const date = d.toISOString().slice(0,10)
        const time = d.toISOString().slice(11,16)
        reset({ title: task.title, description: task.description || '', date, time, priority: task.priority as any })
        // Save initial values for easy reset on edit
        initialValuesRef.current = { title: task.title, description: task.description || '', date, time, priority: task.priority as any } as FormValues
      } catch (err: any) {
        // Only show load error in edit mode; create mode should not display anything
        const status = err?.response?.status
        if (status === 403) {
          setServerError('You are not allowed to view or edit this task (assignee-only).')
        } else {
          setServerError(err?.response?.data?.message || 'Failed to load task')
        }
      }
    }
    load()
  }, [id])

  // no-op effects removed; user loading is managed in UserSelect

  const onSubmit = handleSubmit(async (values) => {
  setServerError('')
    const { date, time, title, description, priority } = values as any
    const local = new Date(`${date}T${time}:00`)
    const payload: any = { title, description: (description || '').trim() ? description : null, due_date: local.toISOString(), priority }
    try {
      if (isEdit) {
        await updateTask(Number(id), payload)
      } else {
        if (!selectedUser) return // inline error will appear below after submit
        payload.assignee_email = selectedUser.email
        await createTask(payload)
      }
      navigate('/tasks')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Failed to save task')
    }
  })

  return (
  <div className="min-h-screen overflow-x-hidden overflow-y-visible">
      <Navbar />
  <div className="w-full px-4 md:px-6 py-4 sm:py-6 pb-safe overflow-visible">
        <form onSubmit={onSubmit} className="card space-y-3 sm:space-y-4 overflow-visible" noValidate>
          <h1>{isEdit ? 'Edit Task' : 'New Task'}</h1>
          {serverError && (
            <div className="alert alert-error mt-2 flex items-center justify-between gap-2">
              <span>{serverError}</span>
              <Link to="/tasks" className="btn-secondary">Back</Link>
            </div>
          )}
          <div>
            <label className="label-accent">Title</label>
            <input {...register('title')} className="input mt-1 min-h-[2.75rem]" onFocus={handleFocusCenter} />
            {errors.title && <div className="mt-1 alert-error">{errors.title.message}</div>}
          </div>
          <div>
            <label className="label-accent">Description</label>
            <textarea {...register('description')} className="textarea mt-1 min-h-[2.75rem]" onFocus={handleFocusCenter} />
            {errors.description && <div className="mt-1 alert-error">{errors.description.message}</div>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label-accent">Due Date</label>
              <input {...register('date')} className="input mt-1 min-h-[2.75rem]" type="date" onFocus={handleFocusCenter} />
              {errors.date && <div className="mt-1 alert-error">{errors.date.message}</div>}
            </div>
            <div>
              <label className="label-accent">Due Time</label>
              <input {...register('time')} className="input mt-1 min-h-[2.75rem]" type="time" onFocus={handleFocusCenter} />
              {errors.time && <div className="mt-1 alert-error">{errors.time.message}</div>}
            </div>
          </div>
          {!isEdit && (
            <div>
              <UserSelect
                label="Assignee"
                value={selectedUser}
                onSelect={(u) => {
                  setSelectedUser(u)
                }}
              />
              {!selectedUser && isSubmitted && (
                <div className="mt-1 alert-error">Please select an assignee</div>
              )}
            </div>
          )}
          <div>
            <label className="label-accent">Priority</label>
            <select {...register('priority')} className="select mt-1 min-h-[2.75rem]" onFocus={handleFocusCenter}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button disabled={isSubmitting} className="btn-gradient w-full sm:w-auto">
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
            {isEdit && (
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => { if (initialValuesRef.current) reset(initialValuesRef.current) }}
              >
                Reset
              </button>
            )}
            <Link to="/tasks" className="btn-secondary w-full sm:w-auto">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
