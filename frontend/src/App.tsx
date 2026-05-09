import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import UploadSection from './pages/UploadSection';
import FileHistory from './pages/FileHistory';
import ThreatReport from './pages/ThreatReport';
import Settings from './pages/Settings';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={
          <DashboardLayout>
            <DashboardOverview />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/upload" element={
          <DashboardLayout>
            <UploadSection />
          </DashboardLayout>
        } />

        <Route path="/dashboard/history" element={
          <DashboardLayout>
            <FileHistory />
          </DashboardLayout>
        } />

        <Route path="/dashboard/reports" element={
          <DashboardLayout>
            <ThreatReport />
          </DashboardLayout>
        } />

        <Route path="/dashboard/settings" element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        } />

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
