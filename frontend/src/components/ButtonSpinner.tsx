import React from 'react'

type Props = {
  className?: string
  label?: string
}

// Small spinner suitable for buttons
export default function ButtonSpinner({ className = 'h-4 w-4', label = 'Loading' }: Props) {
  return (
    <span className="inline-flex items-center" role="status" aria-live="polite" aria-busy="true">
      <svg
        className={`animate-spin ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="opacity-25 stroke-current text-gray-400"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="4"
        />
        <path
          className="opacity-75 fill-current text-gray-700"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
