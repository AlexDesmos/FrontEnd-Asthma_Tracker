import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/DashBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        // Если авторизованы, показываем "Dashboard"
        <Dashboard />
      ) : (
        <Routes>
          {/* Страница входа */}
          <Route
            path="/"
            element={
              <AuthPage 
                onSuccessLogin={() => setIsAuthenticated(true)} 
              />
            }
          />
          {/* Страница регистрации */}
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
