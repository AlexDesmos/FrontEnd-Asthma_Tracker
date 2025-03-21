import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage({ onSuccessLogin }) {
  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Пример с GET-запросом (oms и password как query-параметры).
      // Если ваш бэкенд принимает POST, замените на POST и добавьте body.
      const response = await fetch(
        `http://localhost:8080/api/patients/validate?oms=${oms}&password=${password}`, 
        {
          method: 'GET'
        }
      );
      // Предположим, бэкенд возвращает JSON: true/false.
      const isValid = await response.json();

      if (response.ok && isValid === true) {
        onSuccessLogin(); // Авторизация успешна, вызываем колбэк из App.js
      } else {
        // Либо response.ok=false, либо сервер вернул false
        setErrorMessage('ОМС или пароль неверные');
      }
    } catch (error) {
      console.error('Ошибка при запросе /validate:', error);
      setErrorMessage('Произошла ошибка при подключении к серверу');
    }
  };

  const goToRegister = () => {
    // Переход на страницу регистрации
    navigate('/register');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Авторизация</h2>
      {errorMessage && (
        <p style={{ color: 'red' }}>{errorMessage}</p>
      )}
      <form onSubmit={handleLogin}>
        <div>
          <label>ОМС:</label><br />
          <input
            type="text"
            value={oms}
            onChange={(e) => setOms(e.target.value)}
          />
        </div>
        <div>
          <label>Пароль:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Войти</button>
      </form>

      <hr />

      <button onClick={goToRegister}>Регистрация</button>
    </div>
  );
}

export default AuthPage;
