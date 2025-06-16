import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import DoctorAuthPage from './pages/DoctorAuthPage';
import Dashboard from './pages/DashBoard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const [auth, setAuth] = useState(
    JSON.parse(localStorage.getItem('auth')) || { role: null, data: {} }
  );
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const handlePatientLogin = ({ oms, userId }) => {
    setAuth({ role: 'patient', data: { oms, userId } });
  };

  const handleDoctorLogin = ({ personnelNumber }) => {
    setAuth({ role: 'doctor', data: { personnelNumber } });
  };

  const handleLogout = () => setShowConfirmLogout(true);

  const confirmLogout = () => {
    setAuth({ role: null, data: {} });
    localStorage.removeItem('auth');
    setShowConfirmLogout(false);
  };

  const cancelLogout = () => setShowConfirmLogout(false);

  const isAuthenticated = !!auth.role;

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <>
          <Routes>
            {auth.role === 'patient' ? (
              <Route
                path="*"
                element={
                  <Dashboard
                    userOms={auth.data.oms}
                    userId={auth.data.userId}
                    onLogout={handleLogout}
                  />
                }
              />
            ) : (
              <>
                <Route
                  path="/doctor/*"
                  element={
                    <DoctorDashboard
                      personnelNumber={auth.data.personnelNumber}
                      onLogout={handleLogout}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/doctor" replace />} />
              </>
            )}
          </Routes>


          {showConfirmLogout && (
            <div style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center',
              alignItems: 'center', zIndex: 2000
            }}>
              <div style={{
                backgroundColor: '#fff', borderRadius: 16, padding: '24px 20px',
                width: '90%', maxWidth: 360, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  Выйти из аккаунта?
                </h3>
                <div style={{
                  marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center'
                }}>
                  <button onClick={confirmLogout} style={{
                    padding: '10px 24px', borderRadius: 12, backgroundColor: '#e53935',
                    color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Да
                  </button>
                  <button onClick={cancelLogout} style={{
                    padding: '10px 24px', borderRadius: 12, backgroundColor: '#e0e0e0',
                    color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage onSuccessLogin={handlePatientLogin} />} />
          <Route path="/doctor-login" element={<DoctorAuthPage onSuccessDoctorLogin={handleDoctorLogin} />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
