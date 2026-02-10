import { useState, useEffect } from 'react'
import {
  getOrCreateDayPlan, setTaskCompleted, setTaskNote,
  syncDietRecordFromTask, syncExerciseRecordFromTask, parseDurationFromTitle,
} from '../store'
import type { DayPlan, DayTask } from '../types'
import './Tasks.css'

function todayStr() { return new Date().toISOString().slice(0, 10) }

export default function Tasks() {
  const today = todayStr()
  const [viewDate, setViewDate] = useState(today)
  const [plan, setPlan] = useState<DayPlan | null>(() => getOrCreateDayPlan(today))
  const [editingNote, setEditingNote] = useState<{ taskId: string; note: string } | null>(null)

  useEffect(() => { setPlan(getOrCreateDayPlan(viewDate)) }, [viewDate])

  const handleToggle = (taskId: string, completed: boolean) => {
    const next = setTaskCompleted(viewDate, taskId, completed)
    if (next) setPlan(next)
    if (completed) setEditingNote({ taskId, note: '' })
    else setEditingNote(null)
  }

  const handleSaveNote = (taskId: string, note: string) => {
    const next = setTaskNote(viewDate, taskId, note)
    if (next) {
      setPlan(next)
      const task = next.tasks.find(t => t.id === taskId)
      if (task) {
        if (task.type === 'diet' && note.trim())
          syncDietRecordFromTask(viewDate, taskId, note.trim(), task.calories ?? 0)
        if (task.type === 'exercise' && (note.trim() || task.title)) {
          const duration = parseDurationFromTitle(task.title)
          syncExerciseRecordFromTask(viewDate, taskId, note.trim(), task.title, duration, task.calories ?? 0)
        }
      }
    }
    setEditingNote(null)
  }

  const dietTasks = plan?.tasks.filter(t => t.type === 'diet') ?? []
  const exerciseTasks = plan?.tasks.filter(t => t.type === 'exercise') ?? []
  const completedCount = plan?.tasks.filter(t => t.completed).length ?? 0
  const totalCount = plan?.tasks.length ?? 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="tasks-page fade-in">
      <header className="page-header">
        <div className="tasks-header-row">
          <h1>今日任务</h1>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)}
            className="tasks-date" max={today} />
        </div>
      </header>

      {/* 进度概览 */}
      <div className="tasks-progress-card card">
        <div className="tasks-progress-top">
          <span className="tasks-progress-text">
            完成 <strong>{completedCount}</strong> / {totalCount}
          </span>
          {completedCount >= totalCount && totalCount > 0 && <span className="tasks-done-badge">🎉 全部完成</span>}
        </div>
        <div className="tasks-bar-wrap">
          <div className="tasks-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {plan && plan.tasks.length > 0 ? (
        <>
          <section className="card">
            <h2 className="card-title">🍽️ 饮食建议</h2>
            <ul className="task-list">
              {dietTasks.map(t => (
                <TaskRow key={t.id} task={t} onToggle={handleToggle}
                  editingNote={editingNote?.taskId === t.id ? editingNote.note : null}
                  onOpenNote={() => setEditingNote({ taskId: t.id, note: t.note ?? '' })}
                  onEditNote={note => setEditingNote(prev => prev ? { ...prev, note } : null)}
                  onSaveNote={() => editingNote?.taskId === t.id && handleSaveNote(t.id, editingNote.note)}
                  onCancelNote={() => setEditingNote(null)} />
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="card-title">💪 运动建议</h2>
            <ul className="task-list">
              {exerciseTasks.map(t => (
                <TaskRow key={t.id} task={t} onToggle={handleToggle}
                  editingNote={editingNote?.taskId === t.id ? editingNote.note : null}
                  onOpenNote={() => setEditingNote({ taskId: t.id, note: t.note ?? '' })}
                  onEditNote={note => setEditingNote(prev => prev ? { ...prev, note } : null)}
                  onSaveNote={() => editingNote?.taskId === t.id && handleSaveNote(t.id, editingNote.note)}
                  onCancelNote={() => setEditingNote(null)} />
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="card">
          <p className="tasks-empty">请先在「我的」中填写个人信息，即可生成每日饮食与运动建议。</p>
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task, onToggle, editingNote, onOpenNote, onEditNote, onSaveNote, onCancelNote,
}: {
  task: DayTask
  onToggle: (taskId: string, completed: boolean) => void
  editingNote: string | null
  onOpenNote: () => void
  onEditNote: (note: string) => void
  onSaveNote: () => void
  onCancelNote: () => void
}) {
  const isEditing = editingNote !== null

  return (
    <li className={`task-row ${task.completed ? 'completed' : ''}`}>
      <label className="task-check-wrap">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id, !task.completed)}
          className="task-check" aria-label={task.title} />
        <span className="task-checkbox" aria-hidden />
      </label>
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {task.detail && (
          <span className="task-detail">{task.type === 'diet' ? '推荐：' : ''}{task.detail}</span>
        )}
        {task.note && <span className="task-note-display">📝 {task.note}</span>}
        {task.completed && !task.note && !isEditing && (
          <button type="button" className="task-add-note" onClick={onOpenNote}>
            + {task.type === 'diet' ? '记录吃了什么' : '记录做了什么'}
          </button>
        )}
        {isEditing && (
          <div className="task-note-form">
            <input type="text" placeholder={task.type === 'diet' ? '吃了什么' : '做了什么'}
              value={editingNote} onChange={e => onEditNote(e.target.value)}
              className="field-input task-note-input" autoFocus />
            <div className="task-note-actions">
              <button type="button" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={onCancelNote}>取消</button>
              <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={onSaveNote}>保存</button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
