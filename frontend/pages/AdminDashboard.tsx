import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import CandidatesList from '../components/admin/CandidatesList';
import AgentsList from '../components/admin/AgentsList';
import AgentsSimple from '../components/admin/AgentsSimple';
import CreateCandidate from '../components/admin/CreateCandidate';
import CreateCandidateSimple from '../components/admin/CreateCandidateSimple';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<CandidatesList />} />
        <Route path="/candidates" element={<CandidatesList />} />
        <Route path="/candidates/new" element={<CreateCandidateSimple />} />
        <Route path="/agents" element={<AgentsSimple />} />
      </Routes>
    </AdminLayout>
  );
}
