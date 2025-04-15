export interface Medication {
  id: number
  user_id: string
  name: string
  dosage: string
  instructions: string | null
  start_date: string
  end_date: string
  reminder_time: string
  created_at: string
}
