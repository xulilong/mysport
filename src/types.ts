export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra'

export interface UserProfile {
  height: number        // cm
  weight: number        // kg
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  targetWeight: number  // kg
  bodyFat?: number      // 体脂率 %
  startWeight?: number  // 起始体重
  nickname?: string     // 昵称
  startDate?: string    // 开始减脂日期
}

export interface WeightLog {
  date: string     // YYYY-MM-DD
  weight: number   // kg
  bodyFat?: number // 体脂率 %
}

export interface MealEntry {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  name?: string
  protein?: number   // g
  carbs?: number     // g
  fat?: number       // g
  fromTaskId?: string
}

export interface DietLog {
  date: string
  meals: MealEntry[]
}

export interface DayTask {
  id: string
  type: 'diet' | 'exercise'
  title: string
  detail?: string
  calories?: number
  completed: boolean
  completedAt?: string
  note?: string
}

export interface ExerciseEntry {
  id: string
  name: string
  durationMin: number
  caloriesBurned?: number
  fromTaskId?: string
}

export interface ExerciseLog {
  date: string
  exercises: ExerciseEntry[]
}

export interface DayPlan {
  date: string
  tasks: DayTask[]
}

/** 常见食物条目 */
export interface FoodItem {
  name: string
  caloriesPer100g: number
  typicalServing: number   // 典型份量 g
  typicalCalories: number  // 典型份量热量
  category: FoodCategory
  protein?: number   // per 100g
  carbs?: number
  fat?: number
}

export type FoodCategory = 'staple' | 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'snack' | 'drink' | 'fast'

/** AI 私教消息 */
export interface CoachMessage {
  id: string
  type: 'greeting' | 'review' | 'tip' | 'encourage' | 'warning' | 'milestone'
  text: string
  timestamp: string
  icon?: string
}

/** 用户每日统计快照 */
export interface DailyStats {
  date: string
  caloriesIn: number
  caloriesOut: number
  targetCalories: number
  tasksCompleted: number
  tasksTotal: number
  weight?: number
  streak: number  // 连续打卡天数
}
