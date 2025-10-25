import { Priority } from '../types/task'

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const text = priority.charAt(0).toUpperCase() + priority.slice(1)
  const color = priority === 'high'
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    : priority === 'medium'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800'
  return <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>{text}</span>
}
