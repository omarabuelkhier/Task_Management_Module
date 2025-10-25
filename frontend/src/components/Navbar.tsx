import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  return (
    <nav className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/tasks" className="font-semibold">Tasks</Link>
        <div className="flex items-center gap-3">
          {location.pathname.startsWith('/tasks') && (
            <Link to="/tasks/new" className="px-3 py-1.5 bg-blue-600 text-white rounded">New Task</Link>
          )}
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button onClick={logout} className="px-3 py-1.5 border rounded">Logout</button>
        </div>
      </div>
    </nav>
  )
}
