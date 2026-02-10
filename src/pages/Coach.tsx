import { useState, useEffect, useMemo, useRef } from 'react'
import {
  getProfile, getWeightLogs, getDietForDate, getExerciseForDate,
  getOrCreateDayPlan, getAllRecordDates, getDietLogs,
} from '../store'
import { calcFromProfile } from '../utils/calc'
import {
  generateCoachMessages, generateWeeklyReport, handleQuickQuestion,
  calcStreak, COACH_NAME, COACH_AVATAR,
  type WeeklyReport,
} from '../utils/coach'
import type { CoachMessage, DailyStats } from '../types'
import './Coach.css'

function todayStr() { return new Date().toISOString().slice(0, 10) }

function getLastNDays(n: number): string[] {
  const days: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d)
    dd.setDate(dd.getDate() - i)
    days.push(dd.toISOString().slice(0, 10))
  }
  return days
}

/** 快捷问答分类 */
const QUICK_CATEGORIES = [
  {
    label: '📊 今日分析',
    actions: [
      { key: 'how-am-i', label: '📊 今天怎么样？' },
      { key: 'next-meal', label: '🍽️ 下一餐吃什么？' },
      { key: 'phase', label: '📋 我的减脂档案' },
    ],
  },
  {
    label: '🍎 饮食指导',
    actions: [
      { key: 'protein', label: '🥩 蛋白质怎么吃？' },
      { key: 'carbs', label: '🍚 碳水怎么选？' },
      { key: 'eating-out', label: '🍜 外食怎么点？' },
      { key: 'cheat-meal', label: '🍕 可以吃欺骗餐吗？' },
    ],
  },
  {
    label: '💪 运动 & 生活',
    actions: [
      { key: 'exercise', label: '🏋️ 运动方案推荐' },
      { key: 'sleep', label: '😴 睡眠与减脂' },
      { key: 'water', label: '💧 该喝多少水？' },
    ],
  },
  {
    label: '❤️ 心理支持',
    actions: [
      { key: 'motivate', label: '💖 给我打打气' },
      { key: 'plateau', label: '💡 遇到平台期' },
      { key: 'binge', label: '🫂 暴食了怎么办' },
    ],
  },
]

export default function Coach() {
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [weekReport, setWeekReport] = useState<WeeklyReport | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [usedActions, setUsedActions] = useState<Set<string>>(new Set())
  const [expandedCat, setExpandedCat] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const profile = getProfile()
  const weights = getWeightLogs()
  const today = todayStr()

  const currentWeight = useMemo(() => {
    return weights.length > 0 ? weights[weights.length - 1].weight : profile.weight
  }, [weights, profile.weight])

  const { targetCal } = useMemo(
    () => calcFromProfile({ ...profile, weight: currentWeight }),
    [profile, currentWeight]
  )

  const todayDiet = getDietForDate(today)
  const todayExercise = getExerciseForDate(today)
  const todayPlan = getOrCreateDayPlan(today)

  const caloriesIn = todayDiet.meals.reduce((s, m) => s + m.calories, 0)
  const caloriesOut = todayExercise.exercises.reduce((s, e) => s + (e.caloriesBurned ?? 0), 0)
  const tasksCompleted = todayPlan.tasks.filter(t => t.completed).length
  const tasksTotal = todayPlan.tasks.length
  const streak = calcStreak(getAllRecordDates())

  // 生成主消息
  useEffect(() => {
    const stats: DailyStats = {
      date: today, caloriesIn, caloriesOut, targetCalories: targetCal,
      tasksCompleted, tasksTotal, weight: currentWeight, streak,
    }
    const recentWeights = weights.slice(-14).map(w => ({ date: w.date, weight: w.weight }))
    const msgs = generateCoachMessages(profile, stats, recentWeights, [{ date: today, meals: todayDiet.meals }])
    setMessages(msgs)
  }, [])

  // 生成周报
  useEffect(() => {
    const last7 = getLastNDays(7)
    const dietLogs = getDietLogs()
    const weekDays = last7.map(date => {
      const diet = dietLogs[date]
      const calIn = diet ? diet.meals.reduce((s: number, m: { calories: number }) => s + m.calories, 0) : 0
      const ex = getExerciseForDate(date)
      const calOut = ex.exercises.reduce((s: number, e: { caloriesBurned?: number }) => s + (e.caloriesBurned ?? 0), 0)
      const plan = getOrCreateDayPlan(date)
      return {
        date, caloriesIn: calIn, caloriesOut: calOut,
        tasksCompleted: plan.tasks.filter(t => t.completed).length,
        tasksTotal: plan.tasks.length,
      }
    })
    const weekWeights = weights.filter(w => last7.includes(w.date)).map(w => ({ date: w.date, weight: w.weight }))
    setWeekReport(generateWeeklyReport(profile, weekDays, weekWeights, targetCal))
  }, [])

  // 快捷操作
  const handleAction = (action: string) => {
    setUsedActions(prev => new Set(prev).add(action))
    const newMsg = handleQuickQuestion(
      action, profile,
      { caloriesIn, caloriesOut, targetCal, tasksCompleted, tasksTotal },
      currentWeight,
    )
    if (newMsg) {
      setMessages(prev => [...prev, newMsg])
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    }
  }

  const toggleCategory = (idx: number) => {
    setExpandedCat(prev => prev === idx ? null : idx)
  }

  return (
    <div className="coach-page fade-in">
      <header className="coach-header">
        <div className="coach-profile">
          <span className="coach-avatar-lg">{COACH_AVATAR}</span>
          <div>
            <h1 className="coach-name">{COACH_NAME}</h1>
            <p className="coach-role">你的 AI 减脂私教</p>
          </div>
        </div>
        <button className="btn btn-outline coach-report-btn" onClick={() => setShowReport(!showReport)}>
          {showReport ? '返回对话' : '📊 周报'}
        </button>
      </header>

      {showReport && weekReport ? (
        <WeekReportView report={weekReport} />
      ) : (
        <>
          <div className="coach-chat" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={msg.id + i} className={`chat-bubble chat-${msg.type} slide-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="chat-bubble-header">
                  <span className="chat-avatar">{COACH_AVATAR}</span>
                  <span className="chat-sender">{COACH_NAME}</span>
                  <span className="chat-badge">{
                    msg.type === 'greeting' ? '问候' :
                    msg.type === 'encourage' ? '鼓励' :
                    msg.type === 'warning' ? '提醒' :
                    msg.type === 'milestone' ? '里程碑' :
                    msg.type === 'tip' ? '建议' : '点评'
                  }</span>
                </div>
                <div className="chat-bubble-body">
                  <span className="chat-icon">{msg.icon}</span>
                  <p className="chat-text">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="coach-quick-bar">
            <p className="coach-quick-label">问问{COACH_NAME}：</p>
            {QUICK_CATEGORIES.map((cat, ci) => (
              <div key={ci} className="quick-category">
                <button className={`quick-cat-header ${expandedCat === ci ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(ci)}>
                  <span>{cat.label}</span>
                  <span className="quick-cat-arrow">{expandedCat === ci ? '▾' : '▸'}</span>
                </button>
                {expandedCat === ci && (
                  <div className="quick-cat-actions">
                    {cat.actions.map(a => (
                      <button key={a.key}
                        className={`coach-quick-btn ${usedActions.has(a.key) ? 'used' : ''}`}
                        onClick={() => handleAction(a.key)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function WeekReportView({ report }: { report: WeeklyReport }) {
  return (
    <div className="week-report slide-up">
      <div className="report-header-card card">
        <h2 className="report-title">📊 周报 · {report.weekLabel}</h2>
        <p className="report-subtitle">本周减脂数据回顾</p>
      </div>

      <div className="report-stats card">
        <h3 className="card-title">数据概览</h3>
        <div className="report-stat-grid">
          <div className="report-stat">
            <span className="report-stat-val">{report.daysRecorded}</span>
            <span className="report-stat-label">记录天数</span>
          </div>
          <div className="report-stat">
            <span className="report-stat-val">{report.avgCaloriesIn}</span>
            <span className="report-stat-label">日均摄入 kcal</span>
          </div>
          <div className="report-stat">
            <span className="report-stat-val">{report.avgCaloriesOut}</span>
            <span className="report-stat-label">日均消耗 kcal</span>
          </div>
          <div className="report-stat">
            <span className="report-stat-val">
              {report.totalTasks > 0 ? Math.round((report.totalTasksCompleted / report.totalTasks) * 100) : 0}%
            </span>
            <span className="report-stat-label">任务完成率</span>
          </div>
        </div>

        {report.weightChange !== null && (
          <div className="report-weight-change">
            <span className="report-weight-icon">{report.weightChange <= 0 ? '📉' : '📈'}</span>
            <span className={`report-weight-val ${report.weightChange <= 0 ? 'down' : 'up'}`}>
              {report.weightChange <= 0 ? '' : '+'}{report.weightChange.toFixed(1)} kg
            </span>
            <span className="report-weight-label">
              {report.weightStart?.toFixed(1)} → {report.weightEnd?.toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      {report.highlights.length > 0 && (
        <div className="report-section card">
          <h3 className="card-title">✨ 本周亮点</h3>
          <ul className="report-list">
            {report.highlights.map((h, i) => (
              <li key={i} className="report-list-item highlight">
                <span className="report-list-icon">✅</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.suggestions.length > 0 && (
        <div className="report-section card">
          <h3 className="card-title">💡 下周建议</h3>
          <ul className="report-list">
            {report.suggestions.map((s, i) => (
              <li key={i} className="report-list-item suggestion">
                <span className="report-list-icon">💬</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
