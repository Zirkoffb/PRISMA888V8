import { Routes, Route } from 'react-router-dom';
import CandidateLayout from '../components/candidate/CandidateLayout';
import Dashboard from '../components/candidate/Dashboard';
import DashboardEnhanced from '../components/candidate/DashboardEnhanced';
import Map from '../components/candidate/Map';
import Tasks from '../components/candidate/Tasks';
import TasksEnhanced from '../components/candidate/TasksEnhanced';
import Vault from '../components/candidate/Vault';
import DataIngest from '../components/candidate/DataIngest';

export default function CandidateDashboard() {
  return (
    <CandidateLayout>
      <Routes>
        <Route path="/" element={<DashboardEnhanced />} />
        <Route path="/dashboard" element={<DashboardEnhanced />} />
        <Route path="/map" element={<Map />} />
        <Route path="/tasks" element={<TasksEnhanced />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/data" element={<DataIngest />} />
      </Routes>
    </CandidateLayout>
  );
}
