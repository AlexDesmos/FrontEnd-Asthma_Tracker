import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/DashBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userOms, setUserOms] = useState(''); // Запоминаем ОМС вошедшего пользователя

  // Колбэк для AuthPage: сохранить OМС и выставить isAuthenticated
  const handleLoginSuccess = (oms) => {
    setUserOms(oms);
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        // Если авторизованы — показываем Dashboard и передаём userOms
        <Dashboard userOms={userOms} />
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <AuthPage onSuccessLogin={handleLoginSuccess} />
            }
          />
          <Route
            path="/register"
            element={<RegistrationPage />}
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
