import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import UploadSection from './pages/UploadSection';
import FileStatus from './pages/FileStatus';
import ThreatAnalysis from './pages/ThreatAnalysis';

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

        <Route path="/dashboard/status" element={
          <DashboardLayout>
            <FileStatus />
          </DashboardLayout>
        } />

        <Route path="/dashboard/threats" element={
          <DashboardLayout>
            <ThreatAnalysis />
          </DashboardLayout>
        } />

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
