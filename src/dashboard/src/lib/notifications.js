export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notify(title, body, url = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(sw => {
      sw.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url },
        tag: title.toLowerCase().replace(/\s+/g, '-')
      })
    })
  } else {
    new Notification(title, { body })
  }
}

export const EVENTS = {
  TASK_ASSIGNED: (task) => notify(
    'New task assigned',
    `${task.id}: ${task.title} → ${task.assignee}`,
    `/?section=tasks`
  ),
  SESSION_CLOSED: (session) => notify(
    'Session closed',
    `${session.session_date} · ${session.duration}`,
    `/?section=sessions`
  ),
  SYNC_COMPLETED: () => notify(
    'Sync completed',
    'Ecosystem data updated from Gemini',
    '/?section=health'
  )
}
