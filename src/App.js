import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/DashBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userOms, setUserOms] = useState(''); // Запоминаем ОМС вошедшего пользователя

  const handleLoginSuccess = (oms) => {
    setUserOms(oms);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Вы уверены, что хотите выйти?');
    if (confirmed) {
      setIsAuthenticated(false);
      setUserOms('');
      alert('Вы успешно вышли');
    }
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Dashboard userOms={userOms} onLogout={handleLogout} />
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

