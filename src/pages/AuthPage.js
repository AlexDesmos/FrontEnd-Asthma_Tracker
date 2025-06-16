import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function AuthPage({ onSuccessLogin }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleResize = () => setIsMobile(window.innerWidth < 600);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
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
    } catch (error) {
      setErrorMessage('Ошибка подключения к серверу');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  const goToDoctorLogin = () => {
    navigate('/doctor-login');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e2ebf0 0%, #cfd9df 100%)'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <img
          src={logo}
          alt="Логотип"
          draggable={false}
          style={{ width: isMobile ? 150 : 200, height: 'auto', marginBottom: 10 }}
        />
      </div>

      <div style={{
        width: isMobile ? '100%' : 320,
        maxWidth: 400,
        padding: 30,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: 10,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 20,
          fontWeight: 'normal',
          userSelect: 'none'
        }}>
          Авторизация
        </h2>

        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{errorMessage}</p>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, userSelect: 'none' }}>Полис ОМС:</label>
            <input
              type="text"
              value={oms}
              onChange={(e) => setOms(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 5, userSelect: 'none' }}>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: 10,
            fontSize: 16,
            borderRadius: 4,
            border: '1px solid #aaa',
            backgroundColor: '#eee',
            cursor: 'pointer'
          }}>
            Войти
          </button>
        </form>

        <hr style={{ margin: '20px 0' }} />

        <button onClick={goToRegister} style={{
          width: '100%',
          padding: 10,
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #aaa',
          backgroundColor: '#eee',
          cursor: 'pointer'
        }}>
          Регистрация
        </button>

        <button onClick={goToDoctorLogin} style={{
          marginTop: 16,
          width: '100%',
          padding: 10,
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #aaa',
          backgroundColor: '#fff9e6',
          cursor: 'pointer'
        }}>
          🩺 Вход для врача
        </button>

        {deferredPrompt && isMobile && (
          <button onClick={handleInstall} style={{
            marginTop: 20,
            width: '100%',
            padding: 10,
            fontSize: 16,
            borderRadius: 4,
            border: '1px solid #3c763d',
            backgroundColor: '#dff0d8',
            color: '#3c763d',
            cursor: 'pointer'
          }}>
            📲 Скачать приложение
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
