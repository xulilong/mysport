import type { UserProfile, DayPlan, DayTask, ActivityLevel } from '../types'
import { calcFromProfile } from './calc'

/** 早餐/午餐/晚餐/加餐 占比 */
const DIET_RATIO: { key: string; label: string; ratio: number }[] = [
  { key: 'breakfast', label: '早餐', ratio: 0.25 },
  { key: 'lunch', label: '午餐', ratio: 0.35 },
  { key: 'dinner', label: '晚餐', ratio: 0.35 },
  { key: 'snack', label: '加餐/零食', ratio: 0.05 },
]

/** 各餐次具体食物推荐（按热量档位选最接近的一条） */
const DIET_SUGGESTIONS: Record<string, { cal: number; detail: string }[]> = {
  breakfast: [
    { cal: 300, detail: '燕麦 40g + 牛奶 200ml + 香蕉 1 根 + 水煮蛋 1 个' },
    { cal: 350, detail: '全麦面包 2 片 + 水煮蛋 1 个 + 牛奶 200ml + 苹果 半个' },
    { cal: 400, detail: '燕麦 50g + 牛奶 200ml + 香蕉 1 根 + 水煮蛋 1 个 + 核桃 2 颗' },
    { cal: 450, detail: '紫薯 1 小个 + 水煮蛋 1 个 + 牛奶 200ml + 黄瓜 半根' },
    { cal: 500, detail: '全麦三明治（蛋+生菜）+ 牛奶 200ml + 橙子 1 个' },
  ],
  lunch: [
    { cal: 400, detail: '糙米饭 1 小碗 + 清蒸鱼 1 份 + 炒青菜 1 盘' },
    { cal: 450, detail: '杂粮饭 1 碗 + 鸡胸肉 100g + 西兰花 + 番茄蛋汤' },
    { cal: 500, detail: '米饭 1 碗 + 瘦肉 80g + 蔬菜 2 份 + 豆腐 半块' },
    { cal: 550, detail: '糙米饭 + 牛肉 80g + 木耳炒黄瓜 + 紫菜蛋花汤' },
    { cal: 600, detail: '杂粮饭 + 鱼/虾 100g + 绿叶菜 2 份 + 菌菇汤' },
  ],
  dinner: [
    { cal: 400, detail: '红薯 1 个 + 清蒸鱼 1 份 + 凉拌菠菜' },
    { cal: 450, detail: '杂粮粥 1 碗 + 鸡胸肉 100g + 炒时蔬' },
    { cal: 500, detail: '糙米饭 1 小碗 + 瘦肉 80g + 青菜 2 份' },
    { cal: 550, detail: '玉米 1 根 + 虾仁 80g + 西兰花 + 番茄' },
    { cal: 600, detail: '杂粮饭 + 豆腐 + 蔬菜 2 份 + 蛋花汤' },
  ],
  snack: [
    { cal: 50, detail: '黄瓜/番茄 适量' },
    { cal: 100, detail: '苹果/梨 1 个 或 酸奶 1 小杯' },
    { cal: 150, detail: '香蕉 1 根 + 坚果 5 颗' },
    { cal: 200, detail: '酸奶 1 杯 + 燕麦片 少许' },
  ],
}

/** 运动及 MET（代谢当量），消耗 ≈ MET × 体重(kg) × 时长(小时) */
const EXERCISE_MET: { title: string; met: number; durationMin: number; detail: string }[] = [
  { title: '快走', met: 3.5, durationMin: 30, detail: '快走或散步' },
  { title: '慢跑', met: 6, durationMin: 25, detail: '慢跑、 jogging' },
  { title: '跑步', met: 9, durationMin: 20, detail: '中速跑' },
  { title: '骑车', met: 6, durationMin: 25, detail: '骑行，中等强度' },
  { title: '跳绳', met: 11, durationMin: 15, detail: '跳绳' },
  { title: '游泳', met: 8, durationMin: 20, detail: '游泳' },
  { title: 'HIIT', met: 8, durationMin: 20, detail: '高强度间歇' },
  { title: '力量训练', met: 4.5, durationMin: 25, detail: '哑铃、深蹲等' },
  { title: '拉伸/瑜伽', met: 2.5, durationMin: 15, detail: '拉伸、瑜伽' },
]

/** 按活动量选 2–3 项运动（久坐多动、活跃的强度高） */
function pickExercises(activity: ActivityLevel, weightKg: number): { title: string; detail: string; calories: number }[] {
  const count = activity === 'sedentary' || activity === 'light' ? 3 : activity === 'extra' ? 2 : 3
  const start = activity === 'sedentary' ? 0 : activity === 'light' ? 0 : activity === 'moderate' ? 1 : 2
  const pool = EXERCISE_MET.slice(start, start + 5)
  const picked: { title: string; detail: string; calories: number }[] = []
  for (let i = 0; i < count && i < pool.length; i++) {
    const e = pool[i]
    const hours = e.durationMin / 60
    const cal = Math.round(e.met * weightKg * hours)
    picked.push({
      title: `${e.title} ${e.durationMin} 分钟`,
      detail: e.detail + `，约消耗 ${cal} kcal`,
      calories: cal,
    })
  }
  return picked
}

function pickDietDetail(mealKey: string, targetCal: number): { cal: number; detail: string } {
  const list = DIET_SUGGESTIONS[mealKey] ?? []
  if (list.length === 0) return { cal: targetCal, detail: `约 ${targetCal} kcal` }
  let best = list[0]
  for (const item of list) {
    if (Math.abs(item.cal - targetCal) < Math.abs(best.cal - targetCal)) best = item
  }
  return { cal: best.cal, detail: best.detail + `（约 ${best.cal} kcal）` }
}

export function generateDayPlan(date: string, profile: UserProfile, currentWeight: number): DayPlan {
  const { targetCal } = calcFromProfile({ ...profile, weight: currentWeight })
  const tasks: DayTask[] = []

  for (const { key, label, ratio } of DIET_RATIO) {
    const target = Math.round(targetCal * ratio / 50) * 50
    if (target < 50) continue
    const { cal, detail } = pickDietDetail(key, target)
    tasks.push({
      id: `diet-${key}-${date}`,
      type: 'diet',
      title: label,
      detail,
      calories: cal,
      completed: false,
    })
  }

  const exercises = pickExercises(profile.activityLevel, currentWeight)
  exercises.forEach((e, i) => {
    tasks.push({
      id: `exercise-${date}-${i}`,
      type: 'exercise',
      title: e.title,
      detail: e.detail,
      calories: e.calories,
      completed: false,
    })
  })

  return { date, tasks }
}
