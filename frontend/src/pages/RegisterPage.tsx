import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('Alice Creator')
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password')
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
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow max-w-sm w-full space-y-3">
        <h1 className="text-xl font-semibold">Register</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="email" required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="password" required />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Creating…' : 'Register'}
        </button>
        <div className="text-sm text-center">
          Have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </form>
    </div>
  )
}
