import { DerivedStatus } from '../types/task'

export default function StatusBadge({ status }: { status: DerivedStatus }) {
  const color = status === 'Done' ? 'bg-green-100 text-green-700'
    : status === 'Missed/Late' ? 'bg-red-100 text-red-700'
    : status === 'Due Today' ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800'
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{status}</span>
}
