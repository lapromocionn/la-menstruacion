import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EVENTS } from '../lib/notifications'

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function EcosystemHealth() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    load()

    const channel = supabase
      .channel('ecosystem-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ecosystem_stats' }, payload => {
        setStats(payload.new)
        setLastSync(new Date().toLocaleTimeString())
        EVENTS.SYNC_COMPLETED()
      })
      .subscribe(status => setLive(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ecosystem_stats')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setStats(data)
    } else {
      try {
        const r = await fetch('/data/ecosystem.json')
        const d = await r.json()
        setStats(Array.isArray(d) ? d[0] : d)
      } catch { setStats(null) }
    }
    setLoading(false)
  }

  if (loading) return <div className="loading-screen" style={{ height: 200 }}><span>loading</span></div>
  if (!stats) return <div className="empty">No ecosystem data.</div>

  const lastUpdated = stats.last_updated
    ? new Date(stats.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const totalSkills = (stats.skills_detected_socio1 ?? 0) + (stats.skills_detected_socio2 ?? 0)

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Ecosystem Health</h2>
          <p className="section-subtitle">Last updated {lastUpdated}{lastSync ? ` · synced at ${lastSync}` : ''}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`realtime-badge ${live ? '' : 'offline'}`}>
            <span className="realtime-dot" />
            {live ? 'live' : 'connecting'}
          </span>
          <button className="btn-ghost" onClick={load}>
            <RefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="sessions logged"
          value={stats.sessions_logged ?? 0}
          sub="total AI sessions"
        />
        <StatCard
          label="skills · socio1"
          value={stats.skills_detected_socio1 ?? 0}
          sub="David LaPromocion"
        />
        <StatCard
          label="skills · socio2"
          value={stats.skills_detected_socio2 ?? 0}
          sub="Diego Maestro Mason"
        />
        <StatCard
          label="total skills"
          value={totalSkills}
          sub="across both agents"
        />
      </div>

      {/* Agent status */}
      <div className="section-header" style={{ marginTop: 24 }}>
        <h2 className="section-title">Agents</h2>
      </div>
      <div className="card">
        {[
          { id: 'Socio1', name: 'David "LaPromocion"', role: 'environment_infrastructure_setup', status: 'active' },
          { id: 'Socio2', name: 'Diego "Maestro Mason"', role: 'system_architecture_orchestration', status: 'active' }
        ].map(agent => (
          <div key={agent.id} className="task-row" style={{ cursor: 'default' }}>
            <div className={`topnav-avatar pill ${agent.id.toLowerCase()}`} style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 11 }}>
              {agent.id.slice(-1)}
            </div>
            <div className="task-body">
              <div className="task-title">
                {agent.name}
                <span className={`pill ${agent.status === 'active' ? 'completed' : 'pending'}`}>
                  <span className="pill-dot" style={{ background: 'currentColor' }} />
                  {agent.status}
                </span>
              </div>
              <div className="task-meta">
                <span className="task-meta-item" style={{ fontFamily: 'var(--mono)' }}>{agent.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
