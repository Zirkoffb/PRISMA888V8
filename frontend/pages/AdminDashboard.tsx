import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import CandidatesList from '../components/admin/CandidatesList';
import AgentsList from '../components/admin/AgentsList';
import CreateCandidate from '../components/admin/CreateCandidate';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<CandidatesList />} />
        <Route path="/candidates" element={<CandidatesList />} />
        <Route path="/candidates/new" element={<CreateCandidate />} />
        <Route path="/agents" element={<AgentsList />} />
      </Routes>
    </AdminLayout>
  );
}
