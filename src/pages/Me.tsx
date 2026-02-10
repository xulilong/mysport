import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProfile, setProfile, getSetupDone, setSetupDone,
  getWeightLogs, exportAllData, importAllData,
  getTheme, setTheme, getAllRecordDates,
} from '../store'
import { calcFromProfile, getBmiLabel } from '../utils/calc'
import { calcStreak } from '../utils/coach'
import type { UserProfile, ActivityLevel } from '../types'
import './Me.css'

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: '久坐（几乎不运动）',
  light: '轻度（1-3 天/周）',
  moderate: '中度（3-5 天/周）',
  active: '高度（5-6 天/周）',
  extra: '极高（几乎每天）',
}

export default function Me() {
  const navigate = useNavigate()
  const [profile, setProfileState] = useState<UserProfile>(getProfile())
  const [showEdit, setShowEdit] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(getTheme())
  const isFirst = !getSetupDone()

  useEffect(() => { setProfileState(getProfile()) }, [])

  const weights = getWeightLogs()
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.weight
  const { bmrVal, tdeeVal, targetCal, bmiVal } = calcFromProfile({ ...profile, weight: currentWeight })
  const bmiLabel = getBmiLabel(bmiVal)
  const streak = calcStreak(getAllRecordDates())
  const totalDays = getAllRecordDates().length

  const update = (p: Partial<UserProfile>) => {
    const next = setProfile(p)
    setProfileState(next)
  }

  const handleComplete = () => {
    setSetupDone(true)
    navigate('/', { replace: true })
  }

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setCurrentTheme(next)
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `轻脂_备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const ok = importAllData(reader.result as string)
        if (ok) { alert('导入成功！页面将刷新。'); window.location.reload() }
        else alert('导入失败，请检查文件格式。')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="me-page fade-in">
      <header className="page-header">
        <h1>{isFirst ? '初始设置' : '我的'}</h1>
        <p>{isFirst ? '填写个人信息，开始你的减脂之旅' : '管理个人信息与应用设置'}</p>
      </header>

      {/* 用户概览卡片 */}
      {!isFirst && (
        <section className="card me-profile-card">
          <div className="me-avatar">
            {profile.gender === 'female' ? '👩' : '👨'}
          </div>
          <div className="me-profile-info">
            <span className="me-name">{profile.nickname || '减脂达人'}</span>
            <span className="me-stats-row">
              {currentWeight} kg · {profile.height} cm · BMI {bmiVal} {bmiLabel}
            </span>
          </div>
          <div className="me-badges">
            <div className="me-badge">
              <span className="me-badge-val">🔥 {streak}</span>
              <span className="me-badge-label">连续</span>
            </div>
            <div className="me-badge">
              <span className="me-badge-val">📅 {totalDays}</span>
              <span className="me-badge-label">总天数</span>
            </div>
          </div>
        </section>
      )}

      {/* 热量信息 */}
      {!isFirst && (
        <section className="card">
          <h2 className="card-title">每日热量参考</h2>
          <div className="me-cal-grid">
            <div className="me-cal-item">
              <span className="me-cal-label">基础代谢</span>
              <span className="me-cal-val">{bmrVal} kcal</span>
            </div>
            <div className="me-cal-item">
              <span className="me-cal-label">每日消耗</span>
              <span className="me-cal-val">{tdeeVal} kcal</span>
            </div>
            <div className="me-cal-item accent">
              <span className="me-cal-label">减脂建议</span>
              <span className="me-cal-val">{targetCal} kcal</span>
            </div>
            <div className="me-cal-item">
              <span className="me-cal-label">热量缺口</span>
              <span className="me-cal-val">{tdeeVal - targetCal} kcal</span>
            </div>
          </div>
        </section>
      )}

      {/* 编辑个人信息 */}
      <section className="card">
        <div className="me-section-header">
          <h2 className="card-title" style={{ marginBottom: 0 }}>个人信息</h2>
          {!isFirst && (
            <button className="me-edit-btn" onClick={() => setShowEdit(!showEdit)}>
              {showEdit ? '收起' : '编辑'}
            </button>
          )}
        </div>

        {(isFirst || showEdit) && (
          <div className="me-form-grid">
            <label className="field">
              <span className="field-label">昵称</span>
              <input type="text" value={profile.nickname ?? ''} onChange={e => update({ nickname: e.target.value })}
                placeholder="给自己起个名字" className="field-input" />
            </label>
            <label className="field">
              <span className="field-label">身高 (cm)</span>
              <input type="number" min={100} max={250} value={profile.height || ''}
                onChange={e => update({ height: Number(e.target.value) || 0 })} className="field-input" />
            </label>
            <label className="field">
              <span className="field-label">当前体重 (kg)</span>
              <input type="number" min={30} max={300} step={0.1} value={profile.weight ?? ''}
                onChange={e => update({ weight: Number(e.target.value) ? Number(e.target.value) : undefined as any })} className="field-input" />
            </label>
            <label className="field">
              <span className="field-label">目标体重 (kg)</span>
              <input type="number" min={30} max={300} step={0.1} value={profile.targetWeight ?? ''}
                onChange={e => update({ targetWeight: Number(e.target.value) || 0 })} className="field-input" />
            </label>
            <label className="field">
              <span className="field-label">年龄</span>
              <input type="number" min={10} max={120} value={profile.age || ''}
                onChange={e => update({ age: Number(e.target.value) || 0 })} className="field-input" />
            </label>
            <label className="field">
              <span className="field-label">体脂率 %（选填）</span>
              <input type="number" min={3} max={60} step={0.1} value={profile.bodyFat ?? ''}
                onChange={e => update({ bodyFat: e.target.value ? Number(e.target.value) : undefined })}
                className="field-input" placeholder="选填" />
            </label>
            <div className="field full">
              <span className="field-label">性别</span>
              <div className="field-radio-group">
                <label className="radio">
                  <input type="radio" name="me-gender" checked={profile.gender === 'male'} onChange={() => update({ gender: 'male' })} />
                  <span>男</span>
                </label>
                <label className="radio">
                  <input type="radio" name="me-gender" checked={profile.gender === 'female'} onChange={() => update({ gender: 'female' })} />
                  <span>女</span>
                </label>
              </div>
            </div>
            <div className="field full">
              <span className="field-label">活动量</span>
              <select value={profile.activityLevel} onChange={e => update({ activityLevel: e.target.value as ActivityLevel })} className="field-select">
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(k => (
                  <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isFirst && (
          <button className="btn btn-primary full" style={{ marginTop: 16 }} onClick={handleComplete}>
            完成设置，开始使用 →
          </button>
        )}
        {!isFirst && !showEdit && (
          <p className="me-hint">数据仅保存在本机，修改后自动保存。</p>
        )}
      </section>

      {/* 设置 */}
      {!isFirst && (
        <section className="card">
          <h2 className="card-title">设置</h2>
          <div className="me-settings-list">
            <div className="me-setting-row" onClick={toggleTheme}>
              <span>{currentTheme === 'dark' ? '🌙' : '☀️'} 外观模式</span>
              <span className="me-setting-val">{currentTheme === 'dark' ? '深色' : '浅色'}</span>
            </div>
            <div className="me-setting-row" onClick={handleExport}>
              <span>📤 导出数据</span>
              <span className="me-setting-val">JSON 备份</span>
            </div>
            <div className="me-setting-row" onClick={handleImport}>
              <span>📥 导入数据</span>
              <span className="me-setting-val">从备份恢复</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
