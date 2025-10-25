import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-3">
        <h1>Login</h1>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="input mt-1" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="input mt-1" type="password" placeholder="••••••••" required />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <div className="text-center text-sm">
          No account? <Link to="/register" className="text-blue-600 dark:text-blue-400">Register</Link>
        </div>
      </form>
    </div>
  )
}
