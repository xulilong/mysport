import type { UserProfile, ActivityLevel } from '../types'

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
}

/** Mifflin-St Jeor BMR (kcal/day) */
export function bmr(weight: number, height: number, age: number, isMale: boolean): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(base + (isMale ? 5 : -161))
}

/** TDEE (kcal/day) */
export function tdee(weight: number, height: number, age: number, isMale: boolean, activity: ActivityLevel): number {
  return Math.round(bmr(weight, height, age, isMale) * ACTIVITY_MULT[activity])
}

/** 减脂建议热量：约 20% 缺口 */
export function deficitCalories(tdeeVal: number, deficitPercent: number = 0.2): number {
  const target = Math.round(tdeeVal * (1 - deficitPercent))
  return Math.max(1200, target)
}

export function bmi(weight: number, height: number): number {
  const h = height / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

export function getBmiLabel(bmiVal: number): string {
  if (bmiVal < 18.5) return '偏瘦'
  if (bmiVal < 24) return '正常'
  if (bmiVal < 28) return '超重'
  return '肥胖'
}

export function calcFromProfile(profile: UserProfile) {
  const isMale = profile.gender === 'male'
  const bmrVal = bmr(profile.weight, profile.height, profile.age, isMale)
  const tdeeVal = tdee(profile.weight, profile.height, profile.age, isMale, profile.activityLevel)
  const targetCal = deficitCalories(tdeeVal)
  const bmiVal = bmi(profile.weight, profile.height)
  return { bmrVal, tdeeVal, targetCal, bmiVal }
}

/** 预计达到目标体重的天数 */
export function estimateDaysToGoal(currentWeight: number, targetWeight: number, dailyDeficit: number): number {
  if (currentWeight <= targetWeight || dailyDeficit <= 0) return 0
  const kgToLose = currentWeight - targetWeight
  // 1kg 脂肪 ≈ 7700 kcal
  return Math.round((kgToLose * 7700) / dailyDeficit)
}
