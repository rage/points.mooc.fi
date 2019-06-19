export interface Message {
  timestamp: string
  course_id: string
  service_id: string
  data: [ExerciseData]
}

export interface ExerciseData {
  name: string
  id: string
  part: Number
  section: Number
  max_points: Number
}
