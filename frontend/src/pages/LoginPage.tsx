import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password')
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
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow max-w-sm w-full space-y-3">
        <h1 className="text-xl font-semibold">Login</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="email" required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="password" required />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <div className="text-sm text-center">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </div>
      </form>
    </div>
  )
}
