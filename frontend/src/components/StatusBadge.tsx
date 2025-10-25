import { DerivedStatus } from '../types/task'

export default function StatusBadge({ status }: { status: DerivedStatus }) {
  const color = status === 'Done'
    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    : status === 'Missed/Late'
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      : status === 'Due Today'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
  return <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>{status}</span>
}
