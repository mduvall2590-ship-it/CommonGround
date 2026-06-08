import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Governance from './pages/Governance'
import ProposalDetail from './pages/ProposalDetail'
import Ledger from './pages/Ledger'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="governance" element={<Governance />} />
        <Route path="governance/:id" element={<ProposalDetail />} />
        <Route path="ledger" element={<Ledger />} />
      </Route>
    </Routes>
  )
}