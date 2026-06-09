import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EVENTS } from '../lib/notifications'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    load()

    const channel = supabase
      .channel('sessions-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, payload => {
        setSessions(prev => [payload.new, ...prev])
        EVENTS.SESSION_CLOSED(payload.new)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, () => load())
      .subscribe(status => setLive(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: false })

    if (!error && data?.length) {
      setSessions(data)
    } else {
      try {
        const r = await fetch('/data/sessions.json')
        const d = await r.json()
        setSessions(d)
      } catch { setSessions([]) }
    }
    setLoading(false)
  }

  function parseArr(val) {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return val.split('\n').filter(Boolean) }
    }
    return []
  }

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            Sessions
            <span className="section-count">{sessions.length}</span>
          </h2>
        </div>
        <span className={`realtime-badge ${live ? '' : 'offline'}`}>
          <span className="realtime-dot" />
          {live ? 'live' : 'connecting'}
        </span>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: 200 }}><span>loading</span></div>
      ) : sessions.length === 0 ? (
        <div className="empty">No sessions logged yet.</div>
      ) : (
        <div className="card">
          {sessions.map((s, i) => {
            const tasks = parseArr(s.tasks_completed)
            const skills = parseArr(s.skills_observed)
            const priorities = parseArr(s.next_priorities)

            return (
              <div key={s.id ?? i} className="session-item">
                <div className="session-date-col">
                  <div className="session-date">{s.session_date}</div>
                  {s.duration && <div className="session-duration">{s.duration}</div>}
                </div>
                <div className="session-body">
                  {tasks.length > 0 && (
                    <>
                      <div className="session-tasks-label">completed</div>
                      {tasks.map((t, j) => (
                        <div key={j} className="session-task-item">{t}</div>
                      ))}
                    </>
                  )}
                  {skills.length > 0 && (
                    <div className="session-skills">
                      {skills.map((sk, j) => (
                        <span key={j} className="pill" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                  {priorities.length > 0 && (
                    <div className="session-priority">
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>next</div>
                      {priorities.map((p, j) => (
                        <div key={j} className="session-task-item">{p}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
