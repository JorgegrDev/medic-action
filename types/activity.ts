export interface Activity {
  id: number
  user_id: string
  type: string
  description: string
  related_id?: number
  created_at: string
}
