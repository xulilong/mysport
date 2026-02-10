import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProfile, getWeightLogs, getDietForDate, getExerciseForDate,
  getOrCreateDayPlan, getAllRecordDates,
} from '../store'
import { calcFromProfile, getBmiLabel, estimateDaysToGoal } from '../utils/calc'
import { generateCoachMessages, calcStreak } from '../utils/coach'
import type { CoachMessage, DailyStats } from '../types'
import './Dashboard.css'

function todayStr() { return new Date().toISOString().slice(0, 10) }

export default function Dashboard() {
  const navigate = useNavigate()
  const [coachMsgs, setCoachMsgs] = useState<CoachMessage[]>([])
  const profile = getProfile()
  const weights = getWeightLogs()
  const today = todayStr()

  const currentWeight = useMemo(() => {
    if (weights.length === 0) return profile.weight
    return weights[weights.length - 1].weight
  }, [weights, profile.weight])

  const { targetCal, tdeeVal, bmiVal } = useMemo(
    () => calcFromProfile({ ...profile, weight: currentWeight }),
    [profile, currentWeight]
  )

  const todayDiet = getDietForDate(today)
  const todayExercise = getExerciseForDate(today)
  const todayPlan = getOrCreateDayPlan(today)

  const caloriesIn = todayDiet.meals.reduce((s, m) => s + m.calories, 0)
  const caloriesOut = todayExercise.exercises.reduce((s, e) => s + (e.caloriesBurned ?? 0), 0)
  const remaining = Math.max(0, targetCal - caloriesIn)
  const calProgress = targetCal > 0 ? Math.min(1, caloriesIn / targetCal) : 0

  const tasksCompleted = todayPlan.tasks.filter(t => t.completed).length
  const tasksTotal = todayPlan.tasks.length

  const allDates = getAllRecordDates()
  const streak = calcStreak(allDates)

  const targetWeight = profile.targetWeight ?? currentWeight
  const remainingKg = Math.max(0, currentWeight - targetWeight)
  // startWeight: 优先用 profile 设置的起始体重，其次用第一条体重记录，最后用 profile.weight
  const startWeight = profile.startWeight ?? (weights.length > 0 ? weights[0].weight : profile.weight)
  // 如果当前体重比起始体重还重，说明起始体重设置有误，用当前体重作为基准
  const effectiveStart = Math.max(startWeight, currentWeight, targetWeight)
  const progressKg = Math.max(0, effectiveStart - currentWeight)
  // 每日热量缺口 = TDEE - 目标摄入
  const dailyDeficit = tdeeVal - targetCal
  const daysEstimate = dailyDeficit > 0 ? estimateDaysToGoal(currentWeight, targetWeight, dailyDeficit) : 0

  // 体重趋势（最近 14 天）
  const weightTrend = useMemo(() => weights.slice(-14), [weights])

  // AI 私教消息
  useEffect(() => {
    const stats: DailyStats = {
      date: today, caloriesIn, caloriesOut, targetCalories: targetCal,
      tasksCompleted, tasksTotal, weight: currentWeight, streak,
    }
    const recentWeights = weights.slice(-14).map(w => ({ date: w.date, weight: w.weight }))
    setCoachMsgs(generateCoachMessages(profile, stats, recentWeights, [{ date: today, meals: todayDiet.meals }]))
  }, [])

  const bmiLabel = getBmiLabel(bmiVal)

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">轻脂</h1>
          <p className="dash-subtitle">{profile.nickname ? `${profile.nickname}，` : ''}今天也要加油哦</p>
        </div>
        <div className="dash-streak" title="连续打卡">
          <span className="streak-fire">🔥</span>
          <span className="streak-num">{streak}</span>
          <span className="streak-label">天</span>
        </div>
      </header>

      {/* 热量环形进度 */}
      <section className="card dash-cal-card slide-up">
        <div className="dash-cal-ring">
          <CalorieRing progress={calProgress} size={140} stroke={10} />
          <div className="ring-center">
            <span className="ring-cal-num">{remaining}</span>
            <span className="ring-cal-unit">kcal 剩余</span>
          </div>
        </div>
        <div className="dash-cal-stats">
          <div className="cal-stat">
            <span className="cal-stat-icon">🎯</span>
            <span className="cal-stat-val">{targetCal}</span>
            <span className="cal-stat-label">目标</span>
          </div>
          <div className="cal-stat">
            <span className="cal-stat-icon">🍽️</span>
            <span className="cal-stat-val">{caloriesIn}</span>
            <span className="cal-stat-label">已摄入</span>
          </div>
          <div className="cal-stat">
            <span className="cal-stat-icon">🏃</span>
            <span className="cal-stat-val">{caloriesOut}</span>
            <span className="cal-stat-label">已消耗</span>
          </div>
        </div>
      </section>

      {/* 快捷操作 */}
      <div className="dash-quick-actions">
        <button className="quick-btn" onClick={() => navigate('/record')}>
          <span className="quick-icon">🍽️</span>
          <span>记饮食</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/record', { state: { tab: 'exercise' } })}>
          <span className="quick-icon">💪</span>
          <span>记运动</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/record', { state: { tab: 'weight' } })}>
          <span className="quick-icon">⚖️</span>
          <span>记体重</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/tasks')}>
          <span className="quick-icon">📋</span>
          <span>今日任务</span>
        </button>
      </div>

      {/* 任务进度 */}
      <section className="card dash-tasks-card">
        <div className="dash-tasks-header">
          <h2 className="card-title" style={{ marginBottom: 0 }}>今日任务</h2>
          <span className="dash-tasks-count">{tasksCompleted}/{tasksTotal}</span>
        </div>
        <div className="dash-tasks-bar-wrap">
          <div
            className="dash-tasks-bar"
            style={{ width: `${tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0}%` }}
          />
        </div>
        <button className="dash-tasks-link" onClick={() => navigate('/tasks')}>
          {tasksCompleted >= tasksTotal ? '全部完成 ✓' : `还有 ${tasksTotal - tasksCompleted} 项未完成，去打卡 →`}
        </button>
      </section>

      {/* AI 私教入口 */}
      <section className="card dash-coach-card" onClick={() => navigate('/coach')} style={{ cursor: 'pointer' }}>
        <div className="dash-coach-header">
          <span className="dash-coach-avatar">🧑‍🏫</span>
          <div className="dash-coach-info">
            <span className="dash-coach-name">小轻 · AI 私教</span>
            <span className="dash-coach-hint">点击查看今日分析和建议 →</span>
          </div>
        </div>
        {coachMsgs.length > 0 && (
          <div className="dash-coach-preview">
            <span className="dash-coach-preview-icon">{coachMsgs[0].icon}</span>
            <p className="dash-coach-preview-text">{coachMsgs[0].text}</p>
          </div>
        )}
      </section>

      {/* 目标进度 */}
      <section className="card dash-goal-card">
        <h2 className="card-title">目标进度</h2>
        <div className="goal-stats">
          <div className="goal-stat">
            <span className="goal-stat-val">{currentWeight} <small>kg</small></span>
            <span className="goal-stat-label">当前体重</span>
          </div>
          <div className="goal-stat accent">
            <span className="goal-stat-val">{remainingKg.toFixed(1)} <small>kg</small></span>
            <span className="goal-stat-label">距目标</span>
          </div>
          <div className="goal-stat">
            <span className="goal-stat-val">{progressKg.toFixed(1)} <small>kg</small></span>
            <span className="goal-stat-label">已减</span>
          </div>
        </div>
        <div className="goal-progress-wrap">
          <div className="goal-progress-bar">
            <div
              className="goal-progress-fill"
              style={{ width: `${progressKg + remainingKg > 0 ? (progressKg / (progressKg + remainingKg)) * 100 : 0}%` }}
            />
          </div>
          <div className="goal-progress-labels">
            <span>{effectiveStart} kg</span>
            <span>{targetWeight} kg</span>
          </div>
        </div>
        {daysEstimate > 0 && remainingKg > 0 && (
          <p className="goal-estimate">按当前计划，预计约 {daysEstimate > 365 ? `${Math.round(daysEstimate / 30)} 个月` : `${daysEstimate} 天`}后达到目标</p>
        )}
        {remainingKg <= 0 && (
          <p className="goal-estimate">🎉 已达到目标体重！继续保持健康的生活方式。</p>
        )}
      </section>

      {/* 体重趋势 */}
      {weightTrend.length >= 2 && (
        <section className="card dash-chart-card">
          <h2 className="card-title">体重趋势</h2>
          <div className="dash-chart">
            {(() => {
              const min = Math.min(...weightTrend.map(w => w.weight))
              const max = Math.max(...weightTrend.map(w => w.weight))
              const range = max - min || 1
              return weightTrend.map(w => {
                const h = ((w.weight - min) / range) * 100
                return (
                  <div key={w.date} className="dash-chart-col" title={`${w.date}\n${w.weight} kg`}>
                    <div className="dash-chart-bar" style={{ height: `${Math.max(8, h)}%` }} />
                    <span className="dash-chart-val">{w.weight}</span>
                  </div>
                )
              })
            })()}
          </div>
          <div className="dash-chart-axis">
            <span>{weightTrend[0]?.date.slice(5)}</span>
            <span>{weightTrend[weightTrend.length - 1]?.date.slice(5)}</span>
          </div>
        </section>
      )}

      {/* 身体数据 */}
      <section className="card">
        <h2 className="card-title">身体数据</h2>
        <div className="body-stats-grid">
          <div className="body-stat">
            <span className="body-stat-label">BMI</span>
            <span className="body-stat-val">{bmiVal} <small>{bmiLabel}</small></span>
          </div>
          <div className="body-stat">
            <span className="body-stat-label">身高</span>
            <span className="body-stat-val">{profile.height} <small>cm</small></span>
          </div>
          <div className="body-stat">
            <span className="body-stat-label">基础代谢</span>
            <span className="body-stat-val">{calcFromProfile({ ...profile, weight: currentWeight }).bmrVal} <small>kcal</small></span>
          </div>
          <div className="body-stat">
            <span className="body-stat-label">每日消耗</span>
            <span className="body-stat-val">{tdeeVal} <small>kcal</small></span>
          </div>
        </div>
      </section>
    </div>
  )
}

function CalorieRing({ progress, size, stroke }: { progress: number; size: number; stroke: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, progress))
  const color = progress > 1 ? 'var(--warning)' : 'var(--accent)'
  return (
    <svg width={size} height={size} className="ring-svg">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}
