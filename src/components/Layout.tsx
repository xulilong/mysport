import { NavLink } from 'react-router-dom'
import './Layout.css'

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/coach', label: '私教', icon: '🧑‍🏫' },
  { to: '/record', label: '记录', icon: '📝' },
  { to: '/tasks', label: '任务', icon: '✅' },
  { to: '/me', label: '我的', icon: '👤' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="layout-main">{children}</main>
      <nav className="layout-nav" aria-label="主导航">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={to === '/'}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
