import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
  const [oms, setOms] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

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
    <div style={{ padding: 20 }}>
      <h2>Регистрация</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <form onSubmit={handleRegister}>
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
        <button type="submit">Зарегистрироваться</button>
      </form>

      <hr />
      <button onClick={goBackToAuth}>Назад</button>
    </div>
  );
}

export default RegistrationPage;
