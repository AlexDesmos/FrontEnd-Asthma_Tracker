import React, { useState } from 'react';

function UserPage() {
  const [oms, setOms] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      setPatients([]);

      // Пример GET-запроса на backend:
      // GET /api/patients?oms=XXXX
      const response = await fetch(`http://localhost:8080/api/patients?oms=${oms}`);
      if (!response.ok) {
        throw new Error('Ошибка при запросе к серверу');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Пользователь</h2>
      <div>
        <label>Поиск по ОМС: </label>
        <input
          type="text"
          value={oms}
          onChange={(e) => setOms(e.target.value)}
        />
        <button onClick={handleSearch}>Найти</button>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {patients && patients.length > 0 ? (
        <ul>
          {patients.map((patient) => (
            <li key={patient.id}>
            ФИО: {`${patient.surname} ${patient.name} ${patient.patronymic}`}, 
            Дата рождения: {patient.birthday}, 
            Телефон: {patient.phone_number}, 
            ОМС: {patient.oms}
          </li>
          ))}
        </ul>
      ) : (
        !loading && <p>Нет данных для отображения.</p>
      )}
    </div>
  );
}

export default UserPage;
