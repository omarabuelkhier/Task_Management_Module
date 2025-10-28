import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import ButtonSpinner from './ButtonSpinner'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
  <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <Link to="/tasks" className="text-lg font-bold italic font-fancy bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          Task Manager
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {location.pathname.startsWith('/tasks') && (
            <Link to="/tasks/new" className="btn-gradient inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z"/></svg>
              <span className="hidden sm:inline">New Task</span>
            </Link>
          )}
          <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{user?.email}</span>
          <button
            onClick={async () => {
              if (isLoggingOut) return
              setIsLoggingOut(true)
              try { await logout() } finally { setIsLoggingOut(false) }
            }}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut && <ButtonSpinner />}
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
