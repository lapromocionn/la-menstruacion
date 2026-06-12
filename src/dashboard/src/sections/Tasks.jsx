import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, User, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EVENTS } from '../lib/notifications'

function StatusPill({ status }) {
  const labels = { completed: 'completed', in_progress: 'in progress', pending: 'pending', cancelled: 'cancelled' }
  return (
    <span className={`pill ${status}`}>
      <span className="pill-dot" style={{ background: 'currentColor' }} />
      {labels[status] ?? status}
    </span>
  )
}

function AssigneePill({ assignee }) {
  const cls = assignee?.toLowerCase().replace(/\s/g, '') === 'socio1' ? 'socio1' : 'socio2'
  return <span className={`pill ${cls}`}>{assignee}</span>
}

function TaskRow({ task }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="task-row" onClick={() => setOpen(o => !o)}>
        <span className="task-id">#{task.id}</span>
        <div className="task-body">
          <div className="task-title">
            {task.title}
            <StatusPill status={task.status} />
          </div>
          <div className="task-meta">
            {task.assignee && (
              <span className="task-meta-item">
                <User size={11} /> {task.assignee}
              </span>
            )}
            {task.updated_at && (
              <span className="task-meta-item">
                <Calendar size={11} /> {task.updated_at}
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </div>
      {open && (
        <div className="task-expand">
          {task.status === 'in_progress' && task.steps?.length > 0 && (
            <>
              <div className="task-expand-label">steps</div>
              <ol className="task-steps">
                {task.steps.map((step, i) => (
                  <li key={i} className="task-step">{step}</li>
                ))}
              </ol>
            </>
          )}
          {task.result && (
            <>
              <div className="task-expand-label">result</div>
              <div className="task-expand-value">{task.result}</div>
            </>
          )}
          {task.pending_action && (
            <>
              <div className="task-expand-label">pending action</div>
              <div className="task-expand-value">{task.pending_action}</div>
            </>
          )}
          {!task.result && !task.pending_action && !task.steps?.length && (
            <div className="task-expand-value" style={{ color: 'var(--text-3)' }}>No details.</div>
          )}
        </div>
      )}
    </>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    load()

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, payload => {
        setTasks(prev => [payload.new, ...prev])
        EVENTS.TASK_ASSIGNED(payload.new)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, payload => {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, payload => {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id))
      })
      .subscribe(status => setLive(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data?.length) {
      setTasks(data)
    } else {
      // Fallback to local JSON
      try {
        const r = await fetch('/data/tasks.json')
        const d = await r.json()
        setTasks(d)
      } catch { setTasks([]) }
    }
    setLoading(false)
  }

  const open = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const done = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            Tasks
            <span className="section-count">{tasks.length}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`realtime-badge ${live ? '' : 'offline'}`}>
            <span className="realtime-dot" />
            {live ? 'live' : 'connecting'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: 200 }}><span>loading</span></div>
      ) : tasks.length === 0 ? (
        <div className="empty">No tasks found.</div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                open · {open.length}
              </div>
              {open.map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
          {done.length > 0 && (
            <div className="card">
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                closed · {done.length}
              </div>
              {done.map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </>
      )}
    </>
  )
}
