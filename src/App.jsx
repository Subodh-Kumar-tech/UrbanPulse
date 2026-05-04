import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import UserDashboard from '@/pages/UserDashboard';
import ReportIssue from '@/pages/Report';
import Admin from '@/pages/Admin';
import Petitions from '@/pages/Petitions';
import Login from '@/pages/Login';
import IssueDetail from '@/pages/IssueDetail';
import CityMap from '@/pages/CityMap';
import Leaderboard from '@/pages/Leaderboard';
import ActivityFeed from '@/pages/ActivityFeed';
import Settings from '@/pages/Settings';
import { useStore } from '@/lib/Store';

function ProtectedRoute({ children, reqRole }) {
  const { user } = useStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (reqRole && user.role !== reqRole) return <Navigate to="/dashboard" replace />;
  
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="petitions" element={<Petitions />} />
        <Route path="issue/:id" element={<IssueDetail />} />
        <Route path="map" element={<CityMap />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="activity" element={<ActivityFeed />} />
        <Route path="my-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute reqRole="admin"><Admin /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
