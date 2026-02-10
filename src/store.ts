import type { UserProfile, WeightLog, DietLog, DayPlan, ExerciseLog, ExerciseEntry, MealEntry } from './types'
import { generateDayPlan } from './utils/tasks'

const KEY_PROFILE = 'mysport_profile'
const KEY_WEIGHTS = 'mysport_weights'
const KEY_DIET = 'mysport_diet'
const KEY_PLANS = 'mysport_plans'
const KEY_EXERCISE = 'mysport_exercise'
const KEY_SETUP_DONE = 'mysport_setup_done'
const KEY_THEME = 'mysport_theme'

const defaultProfile: UserProfile = {
  height: 170,
  weight: 65,
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  targetWeight: 60,
}

// ---- Profile ----
export function getProfile(): UserProfile {
  try {
    const s = localStorage.getItem(KEY_PROFILE)
    if (s) return { ...defaultProfile, ...JSON.parse(s) }
  } catch (_) {}
  return defaultProfile
}

export function setProfile(p: Partial<UserProfile>): UserProfile {
  const prev = getProfile()
  const next = { ...prev, ...p }
  if (!next.startWeight && next.weight) next.startWeight = next.weight
  if (!next.startDate) next.startDate = new Date().toISOString().slice(0, 10)
  localStorage.setItem(KEY_PROFILE, JSON.stringify(next))
  return next
}

export function getSetupDone(): boolean {
  return localStorage.getItem(KEY_SETUP_DONE) === '1'
}

export function setSetupDone(done: boolean): void {
  if (done) localStorage.setItem(KEY_SETUP_DONE, '1')
  else localStorage.removeItem(KEY_SETUP_DONE)
}

// ---- Theme ----
export function getTheme(): 'light' | 'dark' {
  const t = localStorage.getItem(KEY_THEME)
  if (t === 'dark') return 'dark'
  if (t === 'light') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem(KEY_THEME, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function initTheme() {
  document.documentElement.setAttribute('data-theme', getTheme())
}

// ---- Weight ----
export function getWeightLogs(): WeightLog[] {
  try {
    const s = localStorage.getItem(KEY_WEIGHTS)
    if (s) return JSON.parse(s)
  } catch (_) {}
  return []
}

export function addWeightLog(log: WeightLog): WeightLog[] {
  const list = getWeightLogs().filter((l) => l.date !== log.date)
  list.push(log)
  list.sort((a, b) => a.date.localeCompare(b.date))
  localStorage.setItem(KEY_WEIGHTS, JSON.stringify(list))
  return list
}

export function deleteWeightLog(date: string): WeightLog[] {
  const list = getWeightLogs().filter((l) => l.date !== date)
  localStorage.setItem(KEY_WEIGHTS, JSON.stringify(list))
  return list
}

// ---- Diet ----
export function getDietLogs(): Record<string, DietLog> {
  try {
    const s = localStorage.getItem(KEY_DIET)
    if (s) return JSON.parse(s)
  } catch (_) {}
  return {}
}

function saveDietLogs(logs: Record<string, DietLog>) {
  localStorage.setItem(KEY_DIET, JSON.stringify(logs))
}

export function getDietForDate(date: string): DietLog {
  const logs = getDietLogs()
  return logs[date] ?? { date, meals: [] }
}

export function addMeal(date: string, meal: MealEntry): DietLog {
  const logs = getDietLogs()
  const day = logs[date] ?? { date, meals: [] }
  day.meals = [...day.meals, meal]
  logs[date] = day
  saveDietLogs(logs)
  return day
}

export function removeMeal(date: string, mealId: string): DietLog {
  const logs = getDietLogs()
  const day = logs[date] ?? { date, meals: [] }
  day.meals = day.meals.filter((m) => m.id !== mealId)
  logs[date] = day
  saveDietLogs(logs)
  return day
}

// ---- Plans ----
function getPlans(): Record<string, DayPlan> {
  try {
    const s = localStorage.getItem(KEY_PLANS)
    if (s) return JSON.parse(s)
  } catch (_) {}
  return {}
}

function savePlans(plans: Record<string, DayPlan>) {
  localStorage.setItem(KEY_PLANS, JSON.stringify(plans))
}

export function getDayPlan(date: string): DayPlan | null {
  const plans = getPlans()
  return plans[date] ?? null
}

function isLegacyDietTask(task: { type: string; detail?: string }): boolean {
  if (task.type !== 'diet' || !task.detail) return false
  const d = task.detail.trim()
  return d.length < 25 || /^约\s*\d+\s*kcal\s*$/.test(d.replace(/[（）()]/g, '').trim())
}

export function getOrCreateDayPlan(date: string): DayPlan {
  const plans = getPlans()
  const existing = plans[date]
  const profile = getProfile()
  const weights = getWeightLogs()
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.weight

  const needRegenerate = existing && existing.tasks.some((t) => isLegacyDietTask(t))
  if (existing && !needRegenerate) return existing

  const plan = generateDayPlan(date, profile, currentWeight)
  if (existing && needRegenerate) {
    plan.tasks = plan.tasks.map((t) => {
      const oldT = existing.tasks.find((o) => o.id === t.id)
      if (!oldT) return t
      return { ...t, completed: oldT.completed, completedAt: oldT.completedAt, note: oldT.note }
    })
  }
  plans[date] = plan
  savePlans(plans)
  return plan
}

export function setTaskCompleted(date: string, taskId: string, completed: boolean, note?: string): DayPlan | null {
  const plans = getPlans()
  const plan = plans[date]
  if (!plan) return null
  const updated = {
    ...plan,
    tasks: plan.tasks.map((t) =>
      t.id === taskId
        ? { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined, note: note !== undefined ? note : t.note }
        : t
    ),
  }
  plans[date] = updated
  savePlans(plans)
  return updated
}

export function setTaskNote(date: string, taskId: string, note: string): DayPlan | null {
  const plans = getPlans()
  const plan = plans[date]
  if (!plan) return null
  const updated = {
    ...plan,
    tasks: plan.tasks.map((t) => (t.id === taskId ? { ...t, note } : t)),
  }
  plans[date] = updated
  savePlans(plans)
  return updated
}

// ---- Exercise ----
function getExerciseLogs(): Record<string, ExerciseLog> {
  try {
    const s = localStorage.getItem(KEY_EXERCISE)
    if (s) return JSON.parse(s)
  } catch (_) {}
  return {}
}

function saveExerciseLogs(logs: Record<string, ExerciseLog>) {
  localStorage.setItem(KEY_EXERCISE, JSON.stringify(logs))
}

export function getExerciseForDate(date: string): ExerciseLog {
  const logs = getExerciseLogs()
  return logs[date] ?? { date, exercises: [] }
}

export function addExercise(date: string, entry: ExerciseEntry): ExerciseLog {
  const logs = getExerciseLogs()
  const day = logs[date] ?? { date, exercises: [] }
  day.exercises = [...day.exercises, entry]
  logs[date] = day
  saveExerciseLogs(logs)
  return day
}

export function removeExercise(date: string, entryId: string): ExerciseLog {
  const logs = getExerciseLogs()
  const day = logs[date] ?? { date, exercises: [] }
  day.exercises = day.exercises.filter((e) => e.id !== entryId)
  logs[date] = day
  saveExerciseLogs(logs)
  return day
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function mealTypeFromTaskId(taskId: string): MealEntry['type'] | null {
  const parts = taskId.split('-')
  if (parts[0] !== 'diet' || parts.length < 3) return null
  const key = parts[1]
  if (['breakfast', 'lunch', 'dinner', 'snack'].includes(key)) return key as MealEntry['type']
  return null
}

export function parseDurationFromTitle(title: string): number {
  const m = title.match(/(\d+)\s*分钟?/)
  return m ? parseInt(m[1], 10) : 20
}

export function syncDietRecordFromTask(date: string, taskId: string, note: string, calories: number): void {
  const type = mealTypeFromTaskId(taskId)
  if (!type || !note.trim()) return
  const day = getDietForDate(date)
  const existing = day.meals.find((m) => m.fromTaskId === taskId)
  if (existing) removeMeal(date, existing.id)
  addMeal(date, { id: genId(), type, calories, name: note.trim(), fromTaskId: taskId })
}

export function syncExerciseRecordFromTask(
  date: string, taskId: string, note: string, title: string, durationMin: number, caloriesBurned: number
): void {
  if (!note.trim() && !title.trim()) return
  const day = getExerciseForDate(date)
  const existing = day.exercises.find((e) => e.fromTaskId === taskId)
  if (existing) removeExercise(date, existing.id)
  addExercise(date, { id: genId(), name: (note.trim() || title).trim(), durationMin, caloriesBurned, fromTaskId: taskId })
}

// ---- Data Export/Import ----
export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('mysport_')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)!) } catch { data[key] = localStorage.getItem(key) }
    }
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json)
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('mysport_')) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      }
    }
    return true
  } catch { return false }
}

/** 获取所有有记录的日期（用于计算连续打卡） */
export function getAllRecordDates(): string[] {
  const dates = new Set<string>()
  // 体重记录
  getWeightLogs().forEach(w => dates.add(w.date))
  // 饮食记录
  const dietLogs = getDietLogs()
  Object.keys(dietLogs).forEach(d => { if (dietLogs[d].meals.length > 0) dates.add(d) })
  // 运动记录
  const exLogs = getExerciseLogs()
  Object.keys(exLogs).forEach(d => { if (exLogs[d].exercises.length > 0) dates.add(d) })
  // 任务完成
  const plans = getPlans()
  Object.keys(plans).forEach(d => { if (plans[d].tasks.some(t => t.completed)) dates.add(d) })
  return [...dates].sort()
}
