import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Governance from './pages/Governance'
import ProposalDetail from './pages/ProposalDetail'
import Ledger from './pages/Ledger'
import ComplianceDashboard from './pages/ComplianceDashboard'
import PublicTransparency from './pages/PublicTransparency'
import Landing from './pages/Landing'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="governance" element={<Governance />} />
        <Route path="governance/:id" element={<ProposalDetail />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="compliance" element={<ComplianceDashboard />} />
      </Route>
      {/* Public transparency page — standalone, no auth chrome */}
      <Route path="/transparency" element={<PublicTransparency />} />
    </Routes>
  )
}
