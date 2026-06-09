import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AutonomyPill({ level }) {
  return <span className={`pill ${level}`}>{level}</span>
}

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    load()

    const channel = supabase
      .channel('skills-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => load())
      .subscribe(status => setLive(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('observed_date', { ascending: false })

    if (!error && data?.length) {
      setSkills(data)
    } else {
      try {
        const r = await fetch('/data/skills.json')
        const d = await r.json()
        setSkills(d)
      } catch { setSkills([]) }
    }
    setLoading(false)
  }

  const grouped = skills.reduce((acc, s) => {
    const key = s.human ?? 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const groupOrder = ['Socio1', 'Socio2']
  const sortedGroups = [
    ...groupOrder.filter(k => grouped[k]),
    ...Object.keys(grouped).filter(k => !groupOrder.includes(k))
  ]

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            Skills
            <span className="section-count">{skills.length}</span>
          </h2>
        </div>
        <span className={`realtime-badge ${live ? '' : 'offline'}`}>
          <span className="realtime-dot" />
          {live ? 'live' : 'connecting'}
        </span>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: 200 }}><span>loading</span></div>
      ) : skills.length === 0 ? (
        <div className="empty">No skills detected yet.</div>
      ) : (
        sortedGroups.map(group => (
          <div key={group} className="skills-group">
            <div className="skills-group-label">
              <span className={`pill ${group.toLowerCase().replace(/\s/g, '')}`}>{group}</span>
              <span>{grouped[group].length} skill{grouped[group].length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card">
              {grouped[group].map((s, i) => (
                <div key={i} className="skill-row">
                  <div style={{ flex: 1 }}>
                    <div className="skill-name">{s.skill}</div>
                    <div className="skill-evidence">{s.evidence}</div>
                    <div style={{ marginTop: 6 }}>
                      <AutonomyPill level={s.autonomy ?? 'high'} />
                    </div>
                  </div>
                  <div className="skill-date">{s.observed_date ?? s.date}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  )
}
