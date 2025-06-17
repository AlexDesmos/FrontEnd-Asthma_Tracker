import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function AuthPage({ onSuccessLogin }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch(
        `${API_URL}/patients/validate?oms=${oms}&password=${password}`,
        { method: 'GET' }
      );
      const isValid = await response.json();

      if (response.ok && isValid === true) {
        const patientResponse = await fetch(`${API_URL}/patients?oms=${oms}`);
        const patients = await patientResponse.json();

        if (Array.isArray(patients) && patients.length > 0) {
          const userId = patients[0].id;
          onSuccessLogin({ oms, userId });
        } else {
          setErrorMessage('Не найден пациент с таким ОМС');
        }
      } else {
        setErrorMessage('ОМС или пароль неверные');
      }
    } catch {
      setErrorMessage('Ошибка подключения к серверу');
    }
  };

  const goToRegister = () => navigate('/register');
  const goToDoctorLogin = () => navigate('/doctor-login');

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
      {/* Логотип и надпись */}
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

      {/* Блок авторизации */}
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
          Авторизация
        </h2>

        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{errorMessage}</p>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Полис ОМС:</label>
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
            Войти
          </button>
        </form>

        <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

        <button
          onClick={goToRegister}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 6,
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          Регистрация
        </button>

        <button
          onClick={goToDoctorLogin}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 6,
            backgroundColor: '#fffbe6',
            border: '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          🩺 Вход для врача
        </button>

        {deferredPrompt && isMobile && (
          <button
            onClick={handleInstall}
            style={{
              marginTop: 20,
              width: '100%',
              padding: 12,
              fontSize: 16,
              borderRadius: 6,
              border: '1px solid #3c763d',
              backgroundColor: '#dff0d8',
              color: '#3c763d',
              cursor: 'pointer'
            }}
          >
            📲 Скачать приложение
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
