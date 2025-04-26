import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/DashBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ oms: '', id: null });
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLoginSuccess = ({ oms, userId }) => {
    setUser({ oms, id: userId });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setUser({ oms: '', id: null });
    setShowConfirmLogout(false);
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <>
          <Dashboard userOms={user.oms} userId={user.id} onLogout={handleLogout} />
          {showConfirmLogout && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 12,
                textAlign: 'center',
                width: '90%',
                maxWidth: 300
              }}>
                <h3>Вы уверены, что хотите выйти?</h3>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-around' }}>
                  <button
                    onClick={confirmLogout}
                    style={{
                      backgroundColor: '#e53935',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontSize: 16,
                      cursor: 'pointer'
                    }}
                  >
                    Да
                  </button>
                  <button
                    onClick={cancelLogout}
                    style={{
                      backgroundColor: '#ccc',
                      color: 'black',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontSize: 16,
                      cursor: 'pointer'
                    }}
                  >
                    Нет
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<AuthPage onSuccessLogin={handleLoginSuccess} />}
          />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
