import type { CoachMessage, UserProfile, DailyStats, MealEntry, ExerciseEntry } from '../types'
import { bmi, getBmiLabel } from './calc'

export const COACH_NAME = '小轻'
export const COACH_AVATAR = '🧑‍🏫'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function now() { return new Date().toISOString() }

type Phase = 'start' | 'early' | 'mid' | 'advanced' | 'maintain'

function getPhase(profile: UserProfile, streak: number): Phase {
  let days = 0
  if (profile.startDate) days = Math.floor((Date.now() - new Date(profile.startDate).getTime()) / 86400000)
  const d = Math.max(days, streak)
  if (d <= 3) return 'start'
  if (d <= 14) return 'early'
  if (d <= 45) return 'mid'
  if (d <= 90) return 'advanced'
  return 'maintain'
}

function getBmiTier(weight: number, height: number) {
  const v = bmi(weight, height)
  if (v < 18.5) return 'underweight'
  if (v < 24) return 'normal'
  if (v < 28) return 'overweight'
  return 'obese'
}

const DAILY_TIPS: { icon: string; text: string }[] = [
  { icon: '💧', text: '每天喝 1500-2000ml 水，饭前喝一杯能增加饱腹感。' },
  { icon: '🥚', text: '蛋白质是减脂好帮手：增加饱腹感、维持肌肉、提高代谢。' },
  { icon: '🛌', text: '睡眠不足会让你更容易暴食。保证 7-8 小时睡眠。' },
  { icon: '🚶', text: '多走路、多站立，日常活动消耗占总消耗 15-30%。' },
  { icon: '🥗', text: '先吃蔬菜和蛋白质，最后吃主食，能有效控制血糖。' },
  { icon: '⏰', text: '规律进餐比少吃一顿更重要，不规律饮食更容易囤脂。' },
  { icon: '🍚', text: '粗粮（糙米、燕麦、红薯）替代精制碳水，饱腹感更强。' },
  { icon: '📏', text: '体重每天波动 1-2 kg 是正常的，关注周平均趋势更科学。' },
  { icon: '🏋️', text: '力量训练能提高基础代谢，每周 2-3 次效果最佳。' },
  { icon: '🍎', text: '水果果糖不低，每天 200-350g 为宜，优选低糖水果。' },
]

const DAILY_TIPS_2: { icon: string; text: string }[] = [
  { icon: '🧘', text: '压力导致皮质醇升高，促进腹部脂肪堆积。适当放松也是减脂。' },
  { icon: '🍳', text: '早餐吃够蛋白质，能减少全天的饥饿感和零食摄入。' },
  { icon: '🥤', text: '一杯奶茶 400-600 kcal，相当于一顿正餐。少喝含糖饮料。' },
  { icon: '🌿', text: '膳食纤维能延缓消化、增加饱腹感。每天 25-30g。' },
  { icon: '🍖', text: '减脂期每公斤体重需 1.2-1.6g 蛋白质。' },
  { icon: '🚫', text: '不要完全戒掉某类食物，过度限制会导致暴食。' },
  { icon: '📝', text: '记录饮食的人平均多减 2 倍体重。' },
  { icon: '🥑', text: '适量摄入橄榄油、坚果、牛油果中的好脂肪。' },
  { icon: '🍲', text: '在家做饭比外食平均少摄入 200-300 kcal。' },
  { icon: '⚡', text: 'HIIT 能在短时间内消耗大量热量，且运动后持续燃脂。' },
  { icon: '🧂', text: '高盐饮食导致水肿。减盐后体重可能快速下降 1-2 kg。' },
  { icon: '🍌', text: '运动前 1 小时吃根香蕉，能提供能量让运动表现更好。' },
  { icon: '🪞', text: '围度变化、衣服变松、精力变好，都是进步的信号。' },
  { icon: '🥩', text: '优质蛋白：鸡胸肉、鱼虾、鸡蛋、豆腐、牛奶。' },
  { icon: '🍽️', text: '用小盘子盛饭能减少 20-30% 的进食量。' },
  { icon: '🏃', text: '有氧 20 分钟后脂肪供能比例增加，但 10 分钟也有益。' },
  { icon: '🌙', text: '晚上 9 点后尽量不进食。实在饿就吃黄瓜、西红柿。' },
  { icon: '🧊', text: '低温环境能激活棕色脂肪，增加额外热量消耗。' },
]
const ALL_TIPS = [...DAILY_TIPS, ...DAILY_TIPS_2]

const PHASE_ADVICE: Record<Phase, string[]> = {
  start: [
    '刚开始减脂，最重要的是养成记录习惯。先做到每天记录就很棒。',
    '初期减重会比较快（主要是水分），后面速度会放慢，这是正常的。',
    '建议先从饮食控制开始，等习惯了再逐步增加运动量。',
  ],
  early: [
    '你已经度过了最难的开头，现在保持节奏，稳步前进。',
    '可以开始关注饮食结构了：蛋白质够不够？蔬菜吃得多不多？',
    '如果还没开始力量训练，现在是个好时机。',
  ],
  mid: [
    '身体已经适应了，可以适当增加运动强度或尝试新运动方式。',
    '坚持到现在很不容易，你的自律已经超过了大多数人。',
    '中期可以更精细地管理饮食：关注蛋白质、控制精制碳水。',
  ],
  advanced: [
    '你已经是减脂达人了！可以开始关注体脂率和体型塑造。',
    '可以尝试更高级的训练方式：力量训练分化、HIIT 变体等。',
  ],
  maintain: [
    '恭喜进入维持期！每周称重 1-2 次保持警觉。',
    '维持期可以适当放宽热量限制，但建议不超过 TDEE。',
    '继续保持运动习惯，这是防止反弹最有效的方法。',
  ],
}

export function generateCoachMessages(
  profile: UserProfile, stats: DailyStats,
  recentWeights: { date: string; weight: number }[],
  recentMeals?: { date: string; meals: { type: string; calories: number }[] }[],
): CoachMessage[] {
  const msgs: CoachMessage[] = []
  const name = profile.nickname || '同学'
  const hour = new Date().getHours()
  const phase = getPhase(profile, stats.streak)
  const cw = stats.weight ?? profile.weight
  const bmiTier = getBmiTier(cw, profile.height)
  const gp: Record<string, string[]> = {
    morning_start: [`早上好${name}！今天目标 ${stats.targetCalories} kcal，我陪你一起完成。`, `${name}早！先从一顿健康的早餐开始吧。`],
    morning_early: [`早上好${name}！连续 ${stats.streak} 天了，习惯正在养成。`, `${name}早！记得先喝杯温水再吃早餐。`],
    morning_mid: [`早上好${name}！坚持 ${stats.streak} 天了，你的自律让我印象深刻。`, `${name}早！身体正在适应新的生活方式。`],
    morning_advanced: [`早上好${name}！${stats.streak} 天的坚持，你已经是减脂达人了。`, `${name}早！你的坚持超过了 95% 的人。`],
    morning_maintain: [`早上好${name}！维持期也要保持好习惯哦。`],
    noon_default: [`中午好${name}！已摄入 ${stats.caloriesIn} kcal，还可以吃 ${Math.max(0, stats.targetCalories - stats.caloriesIn)} kcal。`, `午餐时间！一份蛋白质 + 两份蔬菜 + 适量主食。`],
    afternoon_default: [`下午好！哪怕快走 20 分钟也很棒。`, `${name}，下午饿了吃个水果或一小把坚果。`],
    evening_default: [`晚上好${name}！晚餐尽量 8 点前吃完。`, `${name}，今天辛苦了，来看看完成情况吧。`],
  }
  const tk = hour < 10 ? 'morning' : hour < 14 ? 'noon' : hour < 18 ? 'afternoon' : 'evening'
  const pool = gp[`${tk}_${phase}`] ?? gp[`${tk}_default`] ?? gp.noon_default
  const tIcon = hour < 10 ? '☀️' : hour < 14 ? '👋' : hour < 18 ? '💪' : '🌙'
  msgs.push({ id: genId(), type: 'greeting', timestamp: now(), icon: tIcon, text: pick(pool) })
  if (Math.random() < 0.6) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '🎯', text: pick(PHASE_ADVICE[phase]) })
  const cr = stats.targetCalories > 0 ? stats.caloriesIn / stats.targetCalories : 0
  if (stats.caloriesIn > 0) {
    if (cr > 1.3) msgs.push({ id: genId(), type: 'warning', timestamp: now(), icon: '🚨', text: `今天摄入 ${stats.caloriesIn} kcal，超出目标 ${Math.round((cr - 1) * 100)}%。建议晚上不再进食或加一次运动来弥补。` })
    else if (cr > 1.1) msgs.push({ id: genId(), type: 'warning', timestamp: now(), icon: '⚠️', text: `今天摄入 ${stats.caloriesIn} kcal，略超目标。偶尔超标没问题，减脂看周平均。` })
    else if (cr >= 0.85) msgs.push({ id: genId(), type: 'encourage', timestamp: now(), icon: '✅', text: pick([`热量控制得很好！${stats.caloriesIn} kcal，在目标范围内。`, `${stats.caloriesIn} kcal，完美节奏！`]) })
    else if (cr >= 0.6) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '🍽️', text: `今天摄入 ${stats.caloriesIn} kcal，比目标低一些。适度缺口是好的，但别低于基础代谢。` })
    else msgs.push({ id: genId(), type: 'warning', timestamp: now(), icon: '🍽️', text: `今天才吃了 ${stats.caloriesIn} kcal，太少了！建议至少吃到 1200 kcal。` })
  }
  if (recentMeals && recentMeals.length > 0) {
    const tm = recentMeals.find(d => d.date === stats.date)?.meals ?? []
    if (hour >= 11 && tm.length > 0 && !tm.some(m => m.type === 'breakfast'))
      msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '🥣', text: '今天没记录早餐。哪怕一杯牛奶+一个鸡蛋也好。' })
    const missed = recentMeals.slice(-3).filter(d => d.meals.length > 0 && !d.meals.some(m => m.type === 'breakfast')).length
    if (missed >= 3) msgs.push({ id: genId(), type: 'warning', timestamp: now(), icon: '⏰', text: `连续 ${missed} 天没吃早餐了。长期不吃早餐会降低基础代谢。` })
  }
  if (stats.tasksTotal > 0) {
    const r = stats.tasksCompleted / stats.tasksTotal
    if (r >= 1) msgs.push({ id: genId(), type: 'encourage', timestamp: now(), icon: '🎉', text: pick([`今天任务全部完成！太棒了${name}！`, `全部打卡完成！每一次坚持都在让你变得更好。`]) })
    else if (r >= 0.5) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '📋', text: `已完成 ${stats.tasksCompleted}/${stats.tasksTotal} 项，加把劲！` })
  }
  const mst = [
    { d: 100, i: '👑', t: `连续 ${stats.streak} 天！百日坚持，${name}你已经是传奇了。` },
    { d: 60, i: '🏆', t: `连续 ${stats.streak} 天！两个月的坚持，身体和意志力都在变强。` },
    { d: 30, i: '🥇', t: `连续 ${stats.streak} 天！一个月了！30 天足以形成稳定习惯。` },
    { d: 21, i: '🏆', t: `连续 ${stats.streak} 天！21 天习惯养成达成。` },
    { d: 14, i: '🔥', t: `连续 ${stats.streak} 天！两周了，身体开始适应新节奏。` },
    { d: 7, i: '🔥', t: `连续 ${stats.streak} 天！一周了，习惯正在养成。` },
    { d: 3, i: '🔥', t: `连续 ${stats.streak} 天打卡，势头很好！` },
  ]
  for (const m of mst) { if (stats.streak >= m.d) { msgs.push({ id: genId(), type: 'milestone', timestamp: now(), icon: m.i, text: m.t }); break } }
  if (recentWeights.length >= 3) {
    const r7 = recentWeights.slice(-7)
    const diff = r7[r7.length - 1].weight - r7[0].weight
    const rem = r7[r7.length - 1].weight - profile.targetWeight
    if (diff < -1) msgs.push({ id: genId(), type: 'warning', timestamp: now(), icon: '⚡', text: `最近体重下降 ${Math.abs(diff).toFixed(1)} kg，速度有点快。健康速度是每周 0.5-1 kg。` })
    else if (diff < -0.3) msgs.push({ id: genId(), type: 'encourage', timestamp: now(), icon: '📉', text: `最近体重下降 ${Math.abs(diff).toFixed(1)} kg，趋势很好！距目标还有 ${Math.max(0, rem).toFixed(1)} kg。` })
    else if (diff > 0.5) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `最近体重上升 ${diff.toFixed(1)} kg，可能是水肿或饮食变化，关注周平均趋势。` })
    if (recentWeights.length >= 14) {
      const o7 = recentWeights.slice(-14, -7), n7 = recentWeights.slice(-7)
      const ao = o7.reduce((s, w) => s + w.weight, 0) / o7.length, an = n7.reduce((s, w) => s + w.weight, 0) / n7.length
      if (Math.abs(an - ao) < 0.2 && rem > 2) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '💡', text: '体重两周几乎没变化，可能进入平台期。换运动方式、增加蛋白质、保证睡眠，平台期过后往往会有一波明显下降！' })
    }
  }
  if (bmiTier === 'obese' && phase === 'start') msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '🎯', text: '根据 BMI 目前属于肥胖范围。别担心，初期效果会很明显。建议先控制饮食，运动以低强度有氧为主。' })
  else if (bmiTier === 'overweight' && phase !== 'maintain' && new Date().getDate() % 5 === 0) msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: '📐', text: 'BMI 在超重范围。从超重减到正常，对健康改善最显著。' })
  const di = new Date().getDate() % ALL_TIPS.length
  msgs.push({ id: genId(), type: 'tip', timestamp: now(), icon: ALL_TIPS[di].icon, text: ALL_TIPS[di].text })
  return msgs
}

export function reviewMeal(meal: MealEntry, totalCal: number, targetCal: number, profile: UserProfile): CoachMessage {
  const name = profile.nickname || '同学'
  const rem = targetCal - totalCal
  const ml: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
  const label = ml[meal.type] || '这餐'
  if (totalCal > targetCal * 1.2) return { id: genId(), type: 'warning', timestamp: now(), icon: '⚠️', text: `${label} ${meal.calories} kcal${meal.name ? `（${meal.name}）` : ''}。今天总摄入 ${totalCal} kcal，超出目标 ${Math.abs(rem)} kcal。建议后面选低热量食物或加运动。` }
  if (totalCal > targetCal) return { id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `${label} ${meal.calories} kcal 已记录。今天略超目标 ${Math.abs(rem)} kcal，问题不大。` }
  if (meal.type === 'breakfast') return { id: genId(), type: 'encourage', timestamp: now(), icon: '🌅', text: `${name}，早餐 ${meal.calories} kcal 已记录！还剩 ${rem} kcal 额度。` }
  if (meal.type === 'snack' && meal.calories > 300) return { id: genId(), type: 'tip', timestamp: now(), icon: '🍪', text: `加餐 ${meal.calories} kcal 偏高。下次试试水果、酸奶、坚果。` }
  return { id: genId(), type: 'encourage', timestamp: now(), icon: '✅', text: pick([`${label} ${meal.calories} kcal 已记录！还剩 ${Math.max(0, rem)} kcal。`, `记录完成！${label} ${meal.calories} kcal。${name}，饮食管理做得很好。`]) }
}

export function reviewExercise(entry: ExerciseEntry, totalBurned: number, profile: UserProfile): CoachMessage {
  const name = profile.nickname || '同学'
  const cal = entry.caloriesBurned ?? 0
  if (cal >= 400) return { id: genId(), type: 'encourage', timestamp: now(), icon: '🔥', text: `${entry.name} 消耗 ${cal} kcal，运动量很大！${name}记得补充水分和蛋白质。今天总消耗 ${totalBurned} kcal。` }
  if (cal >= 200) return { id: genId(), type: 'encourage', timestamp: now(), icon: '💪', text: `${entry.name} ${entry.durationMin} 分钟，消耗 ${cal} kcal，很棒！今天总消耗 ${totalBurned} kcal。` }
  if (entry.durationMin >= 20) return { id: genId(), type: 'encourage', timestamp: now(), icon: '👍', text: `${entry.name} ${entry.durationMin} 分钟${cal > 0 ? `，消耗 ${cal} kcal` : ''}。坚持最重要！` }
  return { id: genId(), type: 'tip', timestamp: now(), icon: '🏃', text: `${entry.name} ${entry.durationMin} 分钟已记录。试试延长到 20-30 分钟效果更好。` }
}

export function reviewWeight(weight: number, prevWeight: number | null, targetWeight: number, profile: UserProfile): CoachMessage {
  const name = profile.nickname || '同学'
  const bmiVal = bmi(weight, profile.height)
  const label = getBmiLabel(bmiVal)
  const rem = weight - targetWeight
  if (prevWeight === null) return { id: genId(), type: 'tip', timestamp: now(), icon: '⚖️', text: `体重 ${weight} kg（BMI ${bmiVal}，${label}）。${rem > 0 ? `距目标还有 ${rem.toFixed(1)} kg，加油！` : '已达到目标体重，继续保持！'}` }
  const diff = weight - prevWeight
  if (diff < -0.5) return { id: genId(), type: 'encourage', timestamp: now(), icon: '🎉', text: `体重 ${weight} kg，比上次减了 ${Math.abs(diff).toFixed(1)} kg！${name}，努力有了回报。${rem > 0 ? `距目标还有 ${rem.toFixed(1)} kg。` : '已达到目标！'}` }
  if (diff < 0) return { id: genId(), type: 'encourage', timestamp: now(), icon: '📉', text: `体重 ${weight} kg，下降 ${Math.abs(diff).toFixed(1)} kg。稳步下降最健康，${name}继续保持。` }
  if (diff > 1) return { id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `体重 ${weight} kg，比上次增加 ${diff.toFixed(1)} kg。可能是水分波动，关注周趋势更有意义。` }
  if (diff > 0) return { id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `体重 ${weight} kg，小幅上升 ${diff.toFixed(1)} kg。每天波动 1-2 kg 是正常的，${name}别灰心。` }
  return { id: genId(), type: 'encourage', timestamp: now(), icon: '⚖️', text: `体重 ${weight} kg，和上次持平。稳定也是进步，${name}继续坚持。` }
}

export interface WeeklyReport {
  weekLabel: string; avgCaloriesIn: number; avgCaloriesOut: number; targetCalories: number
  weightStart: number | null; weightEnd: number | null; weightChange: number | null
  daysRecorded: number; totalTasksCompleted: number; totalTasks: number
  highlights: string[]; suggestions: string[]
}

export function generateWeeklyReport(
  profile: UserProfile,
  weekDays: { date: string; caloriesIn: number; caloriesOut: number; tasksCompleted: number; tasksTotal: number }[],
  weekWeights: { date: string; weight: number }[],
  targetCalories: number,
): WeeklyReport {
  const name = profile.nickname || '同学'
  const dr = weekDays.filter(d => d.caloriesIn > 0 || d.tasksCompleted > 0).length
  const avgIn = dr > 0 ? Math.round(weekDays.reduce((s, d) => s + d.caloriesIn, 0) / dr) : 0
  const avgOut = dr > 0 ? Math.round(weekDays.reduce((s, d) => s + d.caloriesOut, 0) / dr) : 0
  const tc = weekDays.reduce((s, d) => s + d.tasksCompleted, 0)
  const tt = weekDays.reduce((s, d) => s + d.tasksTotal, 0)
  const ws = weekWeights.length > 0 ? weekWeights[0].weight : null
  const we = weekWeights.length > 0 ? weekWeights[weekWeights.length - 1].weight : null
  const wc = ws !== null && we !== null ? we - ws : null
  const hl: string[] = [], sg: string[] = []
  if (dr >= 6) hl.push(`本周 ${dr} 天都有记录，坚持得非常好！`)
  else if (dr >= 4) hl.push(`本周记录了 ${dr} 天，还不错。`)
  else sg.push(`本周只记录了 ${dr} 天，试试每天都记录。`)
  if (avgIn > 0 && avgIn <= targetCalories * 1.05 && avgIn >= targetCalories * 0.8) hl.push(`日均摄入 ${avgIn} kcal，热量控制得很好。`)
  else if (avgIn > targetCalories * 1.1) sg.push(`日均摄入 ${avgIn} kcal，超出目标。下周试试减少主食或零食。`)
  else if (avgIn > 0 && avgIn < targetCalories * 0.7) sg.push(`日均摄入 ${avgIn} kcal，吃得太少了。`)
  if (wc !== null) { if (wc < -0.3) hl.push(`本周体重下降 ${Math.abs(wc).toFixed(1)} kg！`); else if (wc > 0.5) sg.push(`本周体重上升 ${wc.toFixed(1)} kg，检查一下饮食。`); else hl.push('体重基本稳定。') }
  const tr = tt > 0 ? tc / tt : 0
  if (tr >= 0.8) hl.push(`任务完成率 ${Math.round(tr * 100)}%，执行力很强！`)
  else if (tr < 0.5 && tt > 0) sg.push(`任务完成率 ${Math.round(tr * 100)}%，下周试试先完成饮食任务。`)
  if (avgOut > 200) hl.push(`日均运动消耗 ${avgOut} kcal，运动量充足。`)
  else if (avgOut < 50) sg.push('本周运动量偏少，试试每天快走 30 分钟。')
  if (sg.length === 0) sg.push(`${name}，本周表现很棒！下周继续保持。`)
  return { weekLabel: `${(weekDays[0]?.date ?? '').slice(5)} ~ ${(weekDays[weekDays.length - 1]?.date ?? '').slice(5)}`, avgCaloriesIn: avgIn, avgCaloriesOut: avgOut, targetCalories, weightStart: ws, weightEnd: we, weightChange: wc, daysRecorded: dr, totalTasksCompleted: tc, totalTasks: tt, highlights: hl, suggestions: sg }
}

export function suggestNextMeal(remaining: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', _profile: UserProfile): CoachMessage {
  if (remaining <= 0) return { id: genId(), type: 'tip', timestamp: now(), icon: '🥗', text: '今天热量已用完。如果还饿，选择黄瓜、番茄、生菜这类几乎零热量的蔬菜。' }
  const budget = Math.min(remaining, mealType === 'snack' ? 150 : mealType === 'breakfast' ? 400 : 500)
  const sg: Record<string, string[]> = {
    breakfast: [`早餐建议 ${budget} kcal。推荐：燕麦+牛奶+水煮蛋+水果。`, `早餐预算 ${budget} kcal。试试：全麦面包+鸡蛋+牛奶。`, `高蛋白早餐：2 个水煮蛋(144)+牛奶(135)+半根玉米(60)≈340 kcal。`],
    lunch: [`午餐建议 ${budget} kcal。推荐：杂粮饭+鸡胸肉/鱼+两份蔬菜。`, `午餐预算 ${budget} kcal。糙米饭+瘦肉+西兰花+番茄蛋汤。`, `外食午餐：选少油的菜，米饭半碗，多要蔬菜。`],
    dinner: [`晚餐建议 ${budget} kcal。推荐：红薯/玉米+清蒸鱼+凉拌蔬菜。`, `晚餐预算 ${budget} kcal。杂粮粥+豆腐+炒时蔬，清淡好消化。`, `晚餐建议 8 点前吃完。蒸蛋+清炒蔬菜+小碗杂粮粥。`],
    snack: [`加餐控制在 ${budget} kcal 以内。一个苹果(106)或一小把坚果(150)。`, `健康加餐：无糖酸奶(100)、香蕉(90)、10 颗杏仁(70)。`, `下午饿了？水煮蛋(72)+黑咖啡(5)，饱腹又提神。`],
  }
  return { id: genId(), type: 'tip', timestamp: now(), icon: '🍽️', text: pick(sg[mealType] ?? sg.lunch) }
}

export function calcStreak(allDates: string[]): number {
  if (allDates.length === 0) return 0
  const sorted = [...new Set(allDates)].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let checkDate = today
  if (sorted[0] !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1); checkDate = y.toISOString().slice(0, 10)
    if (sorted[0] !== checkDate) return 0
  }
  let streak = 0
  const d = new Date(checkDate)
  for (let i = 0; i < 365; i++) {
    if (sorted.includes(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}

function answerFAQ(key: string, profile: UserProfile): CoachMessage {
  const name = profile.nickname || '同学'
  const w = profile.weight
  const bmiVal = bmi(w, profile.height)
  const bmiLabel = getBmiLabel(bmiVal)
  const answers: Record<string, CoachMessage> = {
    protein: { id: genId(), type: 'tip', timestamp: now(), icon: '🥩', text: `${name}，根据体重 ${w} kg，每天建议 ${Math.round(w * 1.2)}-${Math.round(w * 1.6)}g 蛋白质。\n\n优质来源：\n• 鸡胸肉 100g ≈ 31g\n• 鸡蛋 1 个 ≈ 6g\n• 牛奶 250ml ≈ 8g\n• 豆腐 100g ≈ 8g\n• 鱼虾 100g ≈ 18-20g` },
    bmi: { id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `${name}，你的 BMI 是 ${bmiVal}（${bmiLabel}）。\n\n标准：<18.5 偏瘦 / 18.5-24 正常 / 24-28 超重 / ≥28 肥胖\n\nBMI 只是参考，建议结合腰围、体脂率综合评估。` },
    cheatday: { id: genId(), type: 'tip', timestamp: now(), icon: '🍕', text: '关于欺骗餐：\n1. 建议是"欺骗餐"而不是"欺骗日"\n2. 每 1-2 周一次\n3. 热量控制在 TDEE 的 120-130%\n4. 选你真正想吃的，充分享受\n5. 第二天恢复正常，不要因内疚而节食' },
    'exercise-plan': { id: genId(), type: 'tip', timestamp: now(), icon: '🏋️', text: bmiVal >= 28 ? `${name}，BMI ${bmiVal}，建议低冲击运动为主：\n• 快走 30-40 分钟\n• 游泳 30 分钟\n• 骑车 30 分钟\n每周 3-4 次，循序渐进。` : bmiVal >= 24 ? `${name}，建议有氧+力量结合：\n• 力量训练 30 分钟\n• 慢跑/游泳 30 分钟\n• HIIT 20 分钟\n每周 4-5 次。` : `${name}，BMI 接近正常，以塑形为主：\n• 力量训练 40 分钟\n• HIIT 15-20 分钟\n• 瑜伽/普拉提\n每周 4-5 次。` },
    'diet-structure': { id: genId(), type: 'tip', timestamp: now(), icon: '🥗', text: '理想减脂饮食结构：\n• 蛋白质 30-35%\n• 碳水 35-40%（优选粗粮）\n• 脂肪 25-30%\n\n三餐分配：早 25-30% / 午 35-40% / 晚 25-30%\n每餐都要有蛋白质+蔬菜+适量主食。' },
    sleep: { id: genId(), type: 'tip', timestamp: now(), icon: '😴', text: '睡眠与减脂：\n• 睡眠不足 → 食欲增加\n• 睡眠不足 → 腹部脂肪堆积\n\n改善建议：\n1. 固定作息\n2. 睡前 1 小时不看手机\n3. 卧室保持凉爽黑暗\n4. 避免下午 3 点后摄入咖啡因' },
    water: { id: genId(), type: 'tip', timestamp: now(), icon: '💧', text: `每天建议喝 ${Math.round(w * 35)}-${Math.round(w * 40)}ml 水。\n\n技巧：\n1. 起床后喝 200ml 温水\n2. 每餐前 30 分钟喝一杯\n3. 运动前后各 200-300ml\n4. 少量多次，不要猛灌` },
    rebound: { id: genId(), type: 'tip', timestamp: now(), icon: '🔄', text: '避免反弹：\n1. 不极端节食（≥1200 kcal/天）\n2. 保持力量训练维持肌肉\n3. 每周减 0.5-1 kg\n4. 达标后逐步增加热量\n5. 长期保持运动习惯\n\n反弹根本原因是恢复旧习惯。让健康成为日常。' },
  }
  return answers[key] ?? { id: genId(), type: 'tip', timestamp: now(), icon: '💬', text: `${name}，建议多记录数据，我会根据实际情况给出更精准的建议。` }
}

export function handleQuickQuestion(
  action: string, profile: UserProfile,
  data: { caloriesIn: number; caloriesOut: number; targetCal: number; tasksCompleted: number; tasksTotal: number },
  currentWeight: number,
): CoachMessage | null {
  const name = profile.nickname || '同学'
  const { caloriesIn, caloriesOut, targetCal, tasksCompleted, tasksTotal } = data
  const rem = targetCal - caloriesIn
  switch (action) {
    case 'how-am-i': {
      if (caloriesIn === 0) return { id: genId(), type: 'tip', timestamp: now(), icon: '📊', text: `${name}，今天还没记录饮食呢。先去记录一下吧。` }
      const exNote = caloriesOut > 0 ? `运动消耗了 ${caloriesOut} kcal，` : ''
      if (caloriesIn <= targetCal * 1.05) return { id: genId(), type: 'encourage', timestamp: now(), icon: '✅', text: `${name}，今天摄入 ${caloriesIn} kcal，${exNote}热量控制得不错！还剩 ${Math.max(0, rem)} kcal。任务 ${tasksCompleted}/${tasksTotal}。` }
      return { id: genId(), type: 'warning', timestamp: now(), icon: '📊', text: `${name}，今天摄入 ${caloriesIn} kcal，超出目标 ${Math.abs(rem)} kcal。${exNote}建议晚上少吃或加运动。偶尔超标很正常。` }
    }
    case 'next-meal': {
      const h = new Date().getHours()
      const mt = h < 9 ? 'breakfast' : h < 13 ? 'lunch' : h < 18 ? 'dinner' : 'snack'
      return suggestNextMeal(rem, mt as 'breakfast' | 'lunch' | 'dinner' | 'snack', profile)
    }
    case 'motivate': return { id: genId(), type: 'encourage', timestamp: now(), icon: '💖', text: pick([
      `${name}，你已经在减脂的路上了，这本身就很了不起。`, `每一次记录、每一次运动，都是在投资未来的自己。${name}，你做得很好。`,
      `减脂不是惩罚，是对自己的关爱。${name}，享受变得更好的过程吧。`, `想想一个月后的自己，会感谢现在坚持的你。${name}，你比想象的更强大。`,
      `${name}，不要和别人比，和昨天的自己比就好。你已经在进步了。`, `体重只是数字，真正重要的是你越来越健康、越来越自信。${name}加油！`,
    ]) }
    case 'plateau': return { id: genId(), type: 'tip', timestamp: now(), icon: '💡', text: '平台期非常正常，几乎每个人都会遇到。\n\n突破方法：\n1. 换运动方式\n2. 增加蛋白质，减少精制碳水\n3. 尝试 16:8 轻断食\n4. 增加日常活动量\n5. 保证 7-8 小时睡眠\n\n平台期过后往往会有一波明显下降，别放弃！' }
    case 'binge': return { id: genId(), type: 'encourage', timestamp: now(), icon: '🫂', text: `${name}，暴食了也没关系。\n\n1. 不要自责——内疚感会导致恶性循环\n2. 不要第二天节食补偿\n3. 分析原因：太饿？压力大？情绪低落？\n4. 如果是饿导致的，说明平时吃太少了\n5. 如果是情绪导致的，试试运动、散步来替代\n\n一次暴食不会毁掉你的努力。下一餐回到正轨就好。` }
    case 'phase': {
      const bv = bmi(currentWeight, profile.height), bl = getBmiLabel(bv)
      const sw = profile.startWeight ?? profile.weight, lost = sw - currentWeight, toGo = currentWeight - profile.targetWeight
      return { id: genId(), type: 'tip', timestamp: now(), icon: '📋', text: `${name}的减脂档案：\n\n• 当前 ${currentWeight} kg / 目标 ${profile.targetWeight} kg\n• 已减 ${Math.max(0, lost).toFixed(1)} kg / 还需 ${Math.max(0, toGo).toFixed(1)} kg\n• BMI ${bv}（${bl}）/ 目标热量 ${targetCal} kcal\n\n${toGo <= 0 ? '已达到目标！进入维持期，保持好习惯。' : `按每周 0.5 kg，预计还需约 ${Math.round(toGo / 0.5)} 周。加油！`}` }
    }
    case 'protein': case 'bmi': case 'sleep': case 'water': case 'rebound': return answerFAQ(action, profile)
    case 'cheat-meal': return answerFAQ('cheatday', profile)
    case 'exercise': return answerFAQ('exercise-plan', profile)
    case 'carbs': case 'diet-structure': return answerFAQ('diet-structure', profile)
    case 'eating-out': return { id: genId(), type: 'tip', timestamp: now(), icon: '🍜', text: '外食减脂攻略：\n1. 选清蒸、白灼、凉拌，避免油炸红烧\n2. 米饭半碗或换粗粮\n3. 多点蔬菜\n4. 汤选清汤\n5. 火锅选清汤锅底\n6. 麻辣烫选蔬菜+鸡蛋+豆腐\n7. 便利店：饭团+沙拉+牛奶\n\n外食热量通常比自己做高 30-50%。' }
    default: return answerFAQ(action, profile)
  }
}