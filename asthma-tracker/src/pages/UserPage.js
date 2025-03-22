import React, { useState, useEffect } from 'react';

function UserPage({ userOms }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userOms) {
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        setPatient(null);

        const response = await fetch(`http://localhost:8080/api/patients?oms=${userOms}`);
        if (!response.ok) {
          throw new Error('Ошибка при запросе к серверу');
        }
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setPatient(data[0]);
        } else {
          setError('Пациент с таким ОМС не найден');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [userOms]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Пользователь</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Если пациент найден, показываем его поля */}
      {patient && (
        <div>
          <p><strong>ФИО:</strong> {patient.surname} {patient.name} {patient.patronymic}</p>
          <p><strong>Дата рождения:</strong> {patient.birthday}</p>
          <p><strong>Телефон:</strong> {patient.phone_number}</p>
          <p><strong>ОМС:</strong> {patient.oms}</p>
          {/* Добавьте другие поля, если они возвращаются бэкендом */}
        </div>
      )}
    </div>
  );
}

export default UserPage;
