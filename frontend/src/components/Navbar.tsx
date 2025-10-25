import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/tasks" className="text-base font-semibold">Tasks</Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {location.pathname.startsWith('/tasks') && (
            <Link to="/tasks/new" className="btn-primary hidden sm:inline-flex">New Task</Link>
          )}
          <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{user?.email}</span>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  )
}
