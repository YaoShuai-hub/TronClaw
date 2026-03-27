import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Landing from './pages/Landing.tsx'
import Chat from './pages/Chat.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Agents from './pages/Agents.tsx'
import Explorer from './pages/Explorer.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/explorer" element={<Explorer />} />
      </Route>
    </Routes>
  )
}
