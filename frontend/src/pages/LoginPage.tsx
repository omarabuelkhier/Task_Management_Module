import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ButtonSpinner from '../components/ButtonSpinner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-3">
        <div className="mb-1 text-center font-fancy text-3xl font-bold italic tracking-wide bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          Task Manager
        </div>
        <h1>Login</h1>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <label className="label-accent">Email</label>
          <input {...register('email')} className="input mt-1" type="email" placeholder="you@example.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label-accent">Password</label>
          <input {...register('password')} className="input mt-1" type="password" placeholder="••••••••" />
          {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
        </div>
        <button
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="btn-gradient w-full inline-flex items-center justify-center gap-2"
        >
          {isSubmitting && <ButtonSpinner />}
          <span>{isSubmitting ? 'Signing in…' : 'Login'}</span>
        </button>
        <div className="text-center text-sm">
          No account? <Link to="/register" className="text-blue-600 dark:text-blue-400">Register</Link>
        </div>
      </form>
    </div>
  )
}
