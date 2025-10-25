import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(name, email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-3">
        <h1>Register</h1>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <label className="label">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="input mt-1" placeholder="Jane Doe" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="input mt-1" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="input mt-1" type="password" placeholder="••••••••" required />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Register'}
        </button>
        <div className="text-center text-sm">
          Have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400">Login</Link>
        </div>
      </form>
    </div>
  )
}
