import { Navigate, useLocation } from 'react-router-dom'
import { getSetupDone } from '../store'
import './SetupGate.css'

export default function SetupGate({ children }: { children: React.ReactNode }) {
  const done = getSetupDone()
  const location = useLocation()
  const isMe = location.pathname === '/me' || location.pathname === '/settings'

  if (done) return <>{children}</>
  if (isMe) return <>{children}</>
  return <Navigate to="/me" replace state={{ from: location.pathname }} />
}
