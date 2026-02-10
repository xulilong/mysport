import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getWeightLogs, addWeightLog,
  getDietForDate, addMeal, removeMeal,
  getExerciseForDate, addExercise, removeExercise,
  getProfile,
} from '../store'
import { calcFromProfile } from '../utils/calc'
import { searchFoods, FOOD_CATEGORIES } from '../utils/foods'
import { reviewMeal, reviewExercise, reviewWeight, COACH_NAME, COACH_AVATAR } from '../utils/coach'
import type { MealEntry, ExerciseEntry, FoodItem, CoachMessage } from '../types'
import './Record.css'

const MEAL_TYPES: { value: MealEntry['type']; label: string; icon: string }[] = [
  { value: 'breakfast', label: '早餐', icon: '🌅' },
  { value: 'lunch', label: '午餐', icon: '☀️' },
  { value: 'dinner', label: '晚餐', icon: '🌙' },
  { value: 'snack', label: '加餐', icon: '🍪' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

type TabKey = 'diet' | 'exercise' | 'weight'

/** 教练反馈气泡 */
function CoachFeedback({ msg, onDismiss }: { msg: CoachMessage; onDismiss: () => void }) {
  return (
    <div className={`coach-feedback coach-fb-${msg.type} slide-up`}>
      <div className="coach-fb-header">
        <span className="coach-fb-avatar">{COACH_AVATAR}</span>
        <span className="coach-fb-name">{COACH_NAME}</span>
        <button className="coach-fb-close" onClick={onDismiss}>✕</button>
      </div>
      <div className="coach-fb-body">
        <span className="coach-fb-icon">{msg.icon}</span>
        <p className="coach-fb-text">{msg.text}</p>
      </div>
    </div>
  )
}

export default function Record() {
  const location = useLocation()
  const initTab = (location.state as { tab?: TabKey })?.tab ?? 'diet'
  const [tab, setTab] = useState<TabKey>(initTab)
  const [date, setDate] = useState(todayStr())

  return (
    <div className="record-page fade-in">
      <header className="page-header">
        <h1>记录</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="record-date-input" />
      </header>

      <div className="record-tabs">
        {([
          { key: 'diet' as TabKey, label: '饮食', icon: '🍽️' },
          { key: 'exercise' as TabKey, label: '运动', icon: '💪' },
          { key: 'weight' as TabKey, label: '体重', icon: '⚖️' },
        ]).map(t => (
          <button key={t.key} className={`record-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'diet' && <DietTab date={date} />}
      {tab === 'exercise' && <ExerciseTab date={date} />}
      {tab === 'weight' && <WeightTab date={date} />}
    </div>
  )
}

function DietTab({ date }: { date: string }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [mealType, setMealType] = useState<MealEntry['type']>('lunch')
  const [mealCal, setMealCal] = useState('')
  const [mealName, setMealName] = useState('')
  const [foodSearch, setFoodSearch] = useState('')
  const [foodCategory, setFoodCategory] = useState('all')
  const [showFoodPicker, setShowFoodPicker] = useState(false)
  const [targetCal, setTargetCal] = useState(0)
  const [feedback, setFeedback] = useState<CoachMessage | null>(null)

  const refresh = () => {
    setMeals(getDietForDate(date).meals)
    const p = getProfile()
    setTargetCal(calcFromProfile(p).targetCal)
  }
  useEffect(refresh, [date])

  const consumed = meals.reduce((s, m) => s + m.calories, 0)
  const progress = targetCal > 0 ? Math.min(100, (consumed / targetCal) * 100) : 0

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault()
    const cal = Number(mealCal)
    if (Number.isNaN(cal) || cal <= 0) return
    const newMeal: MealEntry = { id: genId(), type: mealType, calories: Math.round(cal), name: mealName.trim() || undefined }
    addMeal(date, newMeal)
    const newTotal = consumed + Math.round(cal)
    // 生成教练反馈
    const fb = reviewMeal(newMeal, newTotal, targetCal, getProfile())
    setFeedback(fb)
    setMealCal(''); setMealName(''); setShowForm(false)
    refresh()
  }

  const handlePickFood = (food: FoodItem) => {
    setMealName(food.name)
    setMealCal(String(food.typicalCalories))
    setShowFoodPicker(false)
    setShowForm(true)
  }

  const foods = searchFoods(foodSearch, foodCategory)

  return (
    <div className="record-section slide-up">
      {/* 教练反馈 */}
      {feedback && <CoachFeedback msg={feedback} onDismiss={() => setFeedback(null)} />}

      {/* 热量进度 */}
      <div className="diet-progress-bar">
        <div className="diet-progress-info">
          <span className="diet-progress-consumed">{consumed}</span>
          <span className="diet-progress-target">/ {targetCal} kcal</span>
        </div>
        <div className="diet-bar-track">
          <div className="diet-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 餐次分类 */}
      <div className="meal-type-row">
        {MEAL_TYPES.map(t => (
          <button key={t.value} className={`chip ${mealType === t.value ? 'active' : ''}`}
            onClick={() => { setMealType(t.value); setShowForm(true); setShowFoodPicker(false) }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 快速添加 / 食物库 */}
      <div className="record-action-row">
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setShowFoodPicker(false) }}>✏️ 手动输入</button>
        <button className="btn btn-outline" onClick={() => { setShowFoodPicker(!showFoodPicker); setShowForm(false) }}>📖 食物库</button>
      </div>

      {/* 食物库选择器 */}
      {showFoodPicker && (
        <div className="food-picker card">
          <input type="text" placeholder="搜索食物..." value={foodSearch}
            onChange={e => setFoodSearch(e.target.value)} className="field-input food-search-input" />
          <div className="food-categories">
            {FOOD_CATEGORIES.map(c => (
              <button key={c.key} className={`chip ${foodCategory === c.key ? 'active' : ''}`}
                onClick={() => setFoodCategory(c.key)}>{c.label}</button>
            ))}
          </div>
          <ul className="food-list">
            {foods.slice(0, 20).map(f => (
              <li key={f.name} className="food-item" onClick={() => handlePickFood(f)}>
                <span className="food-name">{f.name}</span>
                <span className="food-cal">{f.typicalCalories} kcal</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 手动输入表单 */}
      {showForm && (
        <form onSubmit={handleAddMeal} className="record-form card">
          <label className="field">
            <span className="field-label">食物名称（选填）</span>
            <input type="text" value={mealName} onChange={e => setMealName(e.target.value)} placeholder="如：米饭+鸡胸肉" className="field-input" />
          </label>
          <label className="field">
            <span className="field-label">热量 (kcal)</span>
            <input type="number" min={1} value={mealCal} onChange={e => setMealCal(e.target.value)} className="field-input" required autoFocus />
          </label>
          <div className="record-form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button>
            <button type="submit" className="btn btn-primary">保存</button>
          </div>
        </form>
      )}

      {/* 已记录列表 */}
      {meals.length > 0 && (
        <ul className="record-list">
          {meals.map(m => (
            <li key={m.id} className="record-list-item">
              <span className="record-item-icon">{MEAL_TYPES.find(t => t.value === m.type)?.icon}</span>
              <div className="record-item-body">
                <span className="record-item-title">{MEAL_TYPES.find(t => t.value === m.type)?.label}</span>
                {m.name && <span className="record-item-sub">{m.name}</span>}
              </div>
              <span className="record-item-cal">{m.calories} kcal</span>
              <button className="record-item-del" onClick={() => { removeMeal(date, m.id); refresh() }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ExerciseTab({ date }: { date: string }) {
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [exName, setExName] = useState('')
  const [exDuration, setExDuration] = useState('')
  const [exCal, setExCal] = useState('')
  const [feedback, setFeedback] = useState<CoachMessage | null>(null)

  const refresh = () => setExercises(getExerciseForDate(date).exercises)
  useEffect(refresh, [date])

  const totalBurned = exercises.reduce((s, e) => s + (e.caloriesBurned ?? 0), 0)

  const QUICK_EXERCISES = [
    { name: '快走 30 分钟', duration: 30, cal: 120 },
    { name: '慢跑 30 分钟', duration: 30, cal: 250 },
    { name: '跳绳 15 分钟', duration: 15, cal: 200 },
    { name: '游泳 30 分钟', duration: 30, cal: 300 },
    { name: '力量训练 30 分钟', duration: 30, cal: 180 },
    { name: 'HIIT 20 分钟', duration: 20, cal: 250 },
    { name: '瑜伽 30 分钟', duration: 30, cal: 100 },
    { name: '骑车 30 分钟', duration: 30, cal: 220 },
  ]

  const handleQuickAdd = (ex: typeof QUICK_EXERCISES[0]) => {
    const entry: ExerciseEntry = { id: genId(), name: ex.name, durationMin: ex.duration, caloriesBurned: ex.cal }
    addExercise(date, entry)
    const newTotal = totalBurned + ex.cal
    setFeedback(reviewExercise(entry, newTotal, getProfile()))
    refresh()
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const dur = Number(exDuration)
    if (Number.isNaN(dur) || dur <= 0) return
    const entry: ExerciseEntry = {
      id: genId(), name: exName.trim() || '运动',
      durationMin: Math.round(dur), caloriesBurned: exCal ? Number(exCal) : undefined,
    }
    addExercise(date, entry)
    const newTotal = totalBurned + (entry.caloriesBurned ?? 0)
    setFeedback(reviewExercise(entry, newTotal, getProfile()))
    setExName(''); setExDuration(''); setExCal(''); setShowForm(false)
    refresh()
  }

  return (
    <div className="record-section slide-up">
      {feedback && <CoachFeedback msg={feedback} onDismiss={() => setFeedback(null)} />}

      <div className="exercise-summary">
        <span className="exercise-summary-icon">🔥</span>
        <span className="exercise-summary-val">{totalBurned}</span>
        <span className="exercise-summary-unit">kcal 已消耗</span>
      </div>

      <h3 className="record-sub-title">快速添加</h3>
      <div className="quick-exercise-grid">
        {QUICK_EXERCISES.map(ex => (
          <button key={ex.name} className="quick-exercise-btn" onClick={() => handleQuickAdd(ex)}>
            <span className="qe-name">{ex.name}</span>
            <span className="qe-cal">~{ex.cal} kcal</span>
          </button>
        ))}
      </div>

      <button className="btn btn-outline full" style={{ marginTop: 12 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? '取消' : '✏️ 自定义运动'}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="record-form card">
          <label className="field">
            <span className="field-label">运动名称</span>
            <input type="text" value={exName} onChange={e => setExName(e.target.value)} placeholder="如：慢跑" className="field-input" />
          </label>
          <label className="field">
            <span className="field-label">时长（分钟）</span>
            <input type="number" min={1} value={exDuration} onChange={e => setExDuration(e.target.value)} className="field-input" required />
          </label>
          <label className="field">
            <span className="field-label">消耗热量（选填）</span>
            <input type="number" min={0} value={exCal} onChange={e => setExCal(e.target.value)} className="field-input" placeholder="选填" />
          </label>
          <button type="submit" className="btn btn-primary full">保存</button>
        </form>
      )}

      {exercises.length > 0 && (
        <ul className="record-list">
          {exercises.map(e => (
            <li key={e.id} className="record-list-item">
              <span className="record-item-icon">🏃</span>
              <div className="record-item-body">
                <span className="record-item-title">{e.name}</span>
                <span className="record-item-sub">{e.durationMin} 分钟</span>
              </div>
              {e.caloriesBurned != null && <span className="record-item-cal">{e.caloriesBurned} kcal</span>}
              <button className="record-item-del" onClick={() => { removeExercise(date, e.id); refresh() }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WeightTab({ date }: { date: string }) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [logs, setLogs] = useState(getWeightLogs())
  const [saved, setSaved] = useState(false)
  const [feedback, setFeedback] = useState<CoachMessage | null>(null)

  const refresh = () => setLogs(getWeightLogs())
  const existing = logs.find(l => l.date === date)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const w = Number(weight)
    if (Number.isNaN(w) || w <= 0) return
    addWeightLog({ date, weight: w, bodyFat: bodyFat ? Number(bodyFat) : undefined })
    const profile = getProfile()
    const prevWeight = logs.length > 0 ? logs[logs.length - 1].weight : null
    setFeedback(reviewWeight(w, prevWeight, profile.targetWeight, profile))
    setWeight(''); setBodyFat('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    refresh()
  }

  const recent = [...logs].reverse().slice(0, 10)

  return (
    <div className="record-section slide-up">
      {feedback && <CoachFeedback msg={feedback} onDismiss={() => setFeedback(null)} />}

      {existing && (
        <div className="weight-existing">
          当日已记录：{existing.weight} kg{existing.bodyFat != null ? ` / 体脂 ${existing.bodyFat}%` : ''}
        </div>
      )}

      <form onSubmit={handleSave} className="weight-form-grid">
        <label className="field">
          <span className="field-label">体重 (kg)</span>
          <input type="number" step={0.1} min={20} max={300} value={weight}
            onChange={e => setWeight(e.target.value)} placeholder={existing ? `当前 ${existing.weight}` : '输入体重'}
            className="field-input" autoFocus />
        </label>
        <label className="field">
          <span className="field-label">体脂率 %（选填）</span>
          <input type="number" step={0.1} min={3} max={60} value={bodyFat}
            onChange={e => setBodyFat(e.target.value)} placeholder="选填" className="field-input" />
        </label>
        <button type="submit" className="btn btn-primary full" disabled={!weight}>
          {saved ? '✓ 已保存' : '保存'}
        </button>
      </form>

      {recent.length > 0 && (
        <>
          <h3 className="record-sub-title" style={{ marginTop: 16 }}>最近记录</h3>
          <ul className="record-list">
            {recent.map(l => (
              <li key={l.date} className="record-list-item">
                <span className="record-item-icon">⚖️</span>
                <div className="record-item-body">
                  <span className="record-item-title">{l.date}</span>
                </div>
                <span className="record-item-cal">{l.weight} kg</span>
                {l.bodyFat != null && <span className="record-item-sub" style={{ fontSize: '0.8rem' }}>{l.bodyFat}%</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
