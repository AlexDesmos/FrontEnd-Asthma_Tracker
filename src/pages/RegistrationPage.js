import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function RegistrationPage() {
  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oms, password })
      });

      if (response.ok) {
        setSuccessMessage('Регистрация успешно завершена!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка при запросе /register:', error);
      setErrorMessage('Произошла ошибка при подключении к серверу');
    }
  };

  const goBackToAuth = () => {
    navigate('/');
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
          Регистрация
        </h2>

        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>
        )}
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}

        <form onSubmit={handleRegister}>
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
            Зарегистрироваться
          </button>
        </form>

        <hr style={{ margin: '20px 0' }} />

        <button onClick={goBackToAuth} style={{
          width: '100%',
          padding: 10,
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #aaa',
          backgroundColor: '#eee',
          cursor: 'pointer'
        }}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default RegistrationPage;

