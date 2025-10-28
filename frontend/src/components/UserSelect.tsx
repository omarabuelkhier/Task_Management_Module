import { useEffect, useRef, useState } from 'react'
import { fetchUsers, type UserLite } from '../services/users'

type Props = {
  value?: UserLite | null
  onSelect: (user: UserLite) => void
  placeholder?: string
  label?: string
}

export default function UserSelect({ value = null, onSelect, placeholder = 'Select user…', label = 'Assignee' }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [users, setUsers] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Initial load
  useEffect(() => {
    let active = true
    setLoading(true)
    fetchUsers().then(list => { if (active) setUsers(list) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const list = await fetchUsers(q.trim() || undefined)
        setUsers(list)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="relative" ref={containerRef}>
  {label && <label className="label-accent">{label}</label>}
      <button
        type="button"
        className="input flex items-center justify-between min-h-[2.75rem]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className={value ? '' : 'text-gray-400'}>{value ? `${value.name} (${value.email})` : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:max-w-none" role="listbox">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="input mb-2"
          />
          <div className="max-h-60 overflow-auto">
            {loading && <div className="py-2 text-sm text-gray-500 dark:text-gray-400">Loading…</div>}
            {!loading && users.length === 0 && (
              <div className="py-2 text-sm text-gray-500 dark:text-gray-400">No users found</div>
            )}
            {!loading && users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onSelect(u); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${value && value.id === u.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <span className="text-sm sm:text-base">{u.name}</span>
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
