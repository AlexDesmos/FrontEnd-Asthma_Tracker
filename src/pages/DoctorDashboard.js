import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorChartsPage from './DoctorChartsPage';
import DoctorProfilePage from './DoctorProfilePage';
import DoctorBottomNav from '../components/DoctorBottomNav';

function DoctorDashboard({ personnelNumber, onLogout }) {
  return (
    <>
      <Routes>
        <Route path="/" element={<DoctorChartsPage />} />
        <Route
          path="profile"
          element={<DoctorProfilePage personnelNumber={personnelNumber} onLogout={onLogout} />}
        />
      </Routes>
      <DoctorBottomNav />
    </>
  );
}

export default DoctorDashboard;
