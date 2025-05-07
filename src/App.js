import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/DashBoard';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: '24px 20px',
  width: '90%',
  maxWidth: 360,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  textAlign: 'center',
};

const btnRowStyle = {
  marginTop: 24,
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
};

const confirmBtnStyle = {
  padding: '10px 24px',
  borderRadius: 12,
  backgroundColor: '#e53935',
  color: '#fff',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
};

const cancelBtnStyle = {
  padding: '10px 24px',
  borderRadius: 12,
  backgroundColor: '#e0e0e0',
  color: '#333',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || { oms: '', id: null }
  );
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    localStorage.setItem('user', JSON.stringify(user));
  }, [isAuthenticated, user]);

  const handleLoginSuccess = ({ oms, userId }) => {
    setUser({ oms, id: userId });
    setIsAuthenticated(true);
  };

  const handleLogout = () => setShowConfirmLogout(true);

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setUser({ oms: '', id: null });
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setShowConfirmLogout(false);
  };

  const cancelLogout = () => setShowConfirmLogout(false);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <>
          <Dashboard userOms={user.oms} userId={user.id} onLogout={handleLogout} />

          {showConfirmLogout && (
            <div style={overlayStyle}>
              <div style={modalStyle}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Выйти из аккаунта?</h3>
                <div style={btnRowStyle}>
                  <button onClick={confirmLogout} style={confirmBtnStyle}>
                    Да
                  </button>
                  <button onClick={cancelLogout} style={cancelBtnStyle}>
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage onSuccessLogin={handleLoginSuccess} />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
