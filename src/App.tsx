import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Accounts } from '@/pages/Accounts'
import { Transactions } from '@/pages/Transactions'
import { Reports } from '@/pages/Reports'
import { Members } from '@/pages/Members'
import { AIAgent } from '@/pages/AIAgent'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/members" element={<Members />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App