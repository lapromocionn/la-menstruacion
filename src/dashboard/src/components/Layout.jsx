import { useState, useEffect } from 'react'
import { CheckSquare, Zap, Clock, Activity, Bell, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { requestPermission } from '../lib/notifications'
import Tasks from '../sections/Tasks'
import Skills from '../sections/Skills'
import Sessions from '../sections/Sessions'
import EcosystemHealth from '../sections/EcosystemHealth'

const TABS = [
  { id: 'tasks',   label: 'Tasks',   Icon: CheckSquare },
  { id: 'skills',  label: 'Skills',  Icon: Zap },
  { id: 'sessions',label: 'Sessions',Icon: Clock },
  { id: 'health',  label: 'Health',  Icon: Activity }
]

function initTab() {
  const p = new URLSearchParams(window.location.search)
  const s = p.get('section')
  return TABS.find(t => t.id === s) ? s : 'tasks'
}

export default function Layout({ session }) {
  const [active, setActive] = useState(initTab)
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')

  const email = session.user?.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  function switchTab(id) {
    setActive(id)
    const url = new URL(window.location)
    url.searchParams.set('section', id)
    window.history.replaceState(null, '', url)
  }

  async function handleNotifRequest() {
    const granted = await requestPermission()
    setNotifGranted(granted)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const CurrentSection = {
    tasks: Tasks,
    skills: Skills,
    sessions: Sessions,
    health: EcosystemHealth
  }[active]

  return (
    <div className="app">
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-mark">λ</div>
          <span className="topnav-name">LaM.mc</span>
        </div>

        <div className="topnav-sep" />

        <div className="topnav-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`topnav-tab ${active === id ? 'active' : ''}`}
              onClick={() => switchTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="topnav-right">
          {!notifGranted && (
            <button className="btn-ghost" onClick={handleNotifRequest} title="Enable notifications">
              <Bell />
            </button>
          )}
          <div className="topnav-user">
            <div className="topnav-avatar">{initials}</div>
          </div>
          <button className="topnav-signout" onClick={signOut} title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </nav>

      <main className="content">
        <CurrentSection session={session} />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottomnav">
        <div className="bottomnav-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`bottomnav-tab ${active === id ? 'active' : ''}`}
              onClick={() => switchTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
