import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import MeasurePage from './MeasurePage';
import ChartsPage from './ChartsPage';
import UserPage from './UserPage';

function Dashboard({ userOms, userId, onLogout }) {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MeasurePage userId={userId} />} />
        <Route path="/charts" element={<ChartsPage userOms={userOms} userId={userId} />} />
        <Route path="/user" element={<UserPage userOms={userOms} onLogout={onLogout} />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default Dashboard;
