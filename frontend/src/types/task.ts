export type Priority = 'low' | 'medium' | 'high'
export type DerivedStatus = 'Done' | 'Missed/Late' | 'Due Today' | 'Upcoming'

export type Task = {
  id: number
  creator_id: number
  assignee_id: number
  title: string
  description?: string | null
  due_date: string
  priority: Priority
  is_completed: boolean
  derived_status?: DerivedStatus
}
