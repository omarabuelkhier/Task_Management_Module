import { Priority } from '../types/task'

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const text = priority.charAt(0).toUpperCase() + priority.slice(1)
  const color = priority === 'high' ? 'bg-red-50 text-red-700 border-red-200'
    : priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-slate-50 text-slate-700 border-slate-200'
  return <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>{text}</span>
}
