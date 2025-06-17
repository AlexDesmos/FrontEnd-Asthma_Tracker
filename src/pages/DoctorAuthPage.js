import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function DoctorAuthPage({ onSuccessDoctorLogin }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';
  const [personnelNumber, setPersonnelNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(
        `${API_URL}/doctors/validate?personnel_number=${personnelNumber}&password=${password}`
      );
      const isValid = await res.json();
      if (res.ok && isValid === true) {
        onSuccessDoctorLogin({ personnelNumber });
      } else {
        setError('Табельный № или пароль неверны');
      }
    } catch {
      setError('Ошибка подключения к серверу');
    }
  };

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

      {/* Форма авторизации врача */}
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
          Вход для врача
        </h2>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Табельный №:</label>
            <input
              type="text"
              value={personnelNumber}
              onChange={(e) => setPersonnelNumber(e.target.value)}
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
            Войти
          </button>
        </form>

        <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

        <button
          onClick={() => navigate('/')}
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
          Назад
        </button>
      </div>
    </div>
  );
}

export default DoctorAuthPage;
