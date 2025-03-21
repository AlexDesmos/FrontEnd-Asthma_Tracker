import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import MeasurePage from './MeasurePage';
import ChartsPage from './ChartsPage';
import UserPage from './UserPage';

function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Основное содержимое */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MeasurePage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </div>
      {/* Нижняя панель навигации для смартфона */}
      <BottomNav />
    </div>
  );
}

export default Dashboard;
