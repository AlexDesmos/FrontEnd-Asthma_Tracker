import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

function RegistrationPage() {
  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oms, password })
      });

      if (response.ok) {
        setSuccessMessage('Регистрация успешно завершена!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка при запросе /register:', error);
      setErrorMessage('Произошла ошибка при подключении к серверу');
    }
  };

  const goBackToAuth = () => navigate('/');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 20,
        background: 'linear-gradient(135deg, #e2ebf0 0%, #cfd9df 100%)',
        boxSizing: 'border-box',
        gap: isMobile ? 20 : 40
      }}
    >
      {/* Логотип */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: isMobile ? '100%' : 300
        }}
      >
        <img
          src={logo}
          alt="Логотип"
          draggable={false}
          style={{
            width: isMobile ? 150 : 170,
            height: 'auto',
            marginBottom: 10
          }}
        />
      </div>

      {/* Форма регистрации */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#fff',
          padding: isMobile ? 20 : 30,
          border: '1px solid #ddd',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: 24,
            fontSize: isMobile ? 22 : 26,
            fontWeight: 500
          }}
        >
          Регистрация
        </h2>

        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center', marginBottom: 20 }}>{successMessage}</p>
        )}
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{errorMessage}</p>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>ОМС:</label>
            <input
              type="text"
              value={oms}
              onChange={(e) => setOms(e.target.value)}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 6,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 6,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              borderRadius: 6,
              backgroundColor: '#4CAF50',
              border: 'none',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Зарегистрироваться
          </button>
        </form>

        <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

        <button
          onClick={goBackToAuth}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 6,
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}

export default RegistrationPage;
