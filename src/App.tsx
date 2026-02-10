import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import SetupGate from './components/SetupGate'
import Dashboard from './pages/Dashboard'
import Coach from './pages/Coach'
import Tasks from './pages/Tasks'
import Record from './pages/Record'
import Me from './pages/Me'

export default function App() {
  return (
    <SetupGate>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/record" element={<Record />} />
          <Route path="/me" element={<Me />} />
          <Route path="/settings" element={<Navigate to="/me" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </SetupGate>
  )
}
