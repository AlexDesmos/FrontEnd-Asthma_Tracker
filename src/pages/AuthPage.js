import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function AuthPage({ onSuccessLogin }) {
  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/patients/validate?oms=${oms}&password=${password}`,
        { method: 'GET' }
      );
      const isValid = await response.json();

      if (response.ok && isValid === true) {
        onSuccessLogin(oms);
      } else {
        setErrorMessage('ОМС или пароль неверные');
      }
    } catch (error) {
      console.error('Ошибка при запросе /validate:', error);
      setErrorMessage('Произошла ошибка при подключении к серверу');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      fontFamily: 'Entropia Light',
      overflow: 'hidden',
      padding: isMobile ? 20 : 0
    }}>
      <div style={{
        marginBottom: isMobile ? 20 : 0,
        marginRight: isMobile ? 0 : 60,
        textAlign: 'center',
        userSelect: 'none'
      }}>
        <img
          src={logo}
          alt="Логотип"
          draggable={false}
          style={{
            width: isMobile ? 150 : 200,
            height: 'auto',
            marginBottom: 10,
            userSelect: 'none'
          }}
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
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, userSelect: 'none' }}>ОМС:</label>
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
      </div>
    </div>
  );
}

export default AuthPage;
