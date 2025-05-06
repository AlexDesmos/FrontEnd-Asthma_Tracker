import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserPage({ userOms, onLogout }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  useEffect(() => {
    if (!userOms) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        setPatient(null);

        const response = await fetch(`${API_URL}/patients?oms=${userOms}`);
        if (!response.ok) throw new Error('Ошибка при запросе к серверу');

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
  }, [userOms, API_URL]);

  useEffect(() => {
    if (!patient) return;

    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${API_URL}/medicine/by_patient?patient_id=${patient.id}`);
        if (!response.ok) throw new Error('Ошибка загрузки лекарств');

        const data = await response.json();
        setMedicines(data.slice(0, 2)); // максимум 2 лекарства
      } catch (err) {
        console.error('Ошибка при получении лекарств:', err);
        setMedicines([]);
      }
    };

    fetchMedicines();
  }, [patient, API_URL]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const getInitials = () => {
    if (!patient) return '';
    const name = patient.name || '';
    const surname = patient.surname || '';
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <div style={{ padding: '24px 16px 120px', maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        {/* Аватар */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: '#ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 600,
            color: '#444',
            marginBottom: 12
          }}
        >
          {getInitials()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Профиль</h2>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      {patient && (
        <>
          <div
            style={{
              backgroundColor: '#f6f6f6',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <Info label="👤 ФИО" value={`${patient.surname} ${patient.name} ${patient.patronymic}`} />
            <Info label="🎂 Дата рождения" value={patient.birthday} />
            <Info label="📞 Телефон" value={patient.phone_number} />
            <Info label="🩺 ОМС" value={patient.oms} />
          </div>

          {/* Лекарства */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>💊 Назначенные лекарства</h3>
            {medicines.length === 0 ? (
              <div style={{ fontSize: 16, color: '#777', textAlign: 'center' }}>
                Вам ничего не назначено 😊
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #eee',
                      borderRadius: 10,
                      padding: 14,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{med.name}</div>
                    <div style={{ fontSize: 13, color: '#555' }}>{med.mkg} мкг</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Кнопка выхода */}
      <div
        style={{
          position: 'fixed',
          bottom: 70,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={handleLogoutClick}
          style={{
            maxWidth: 400,
            width: '100%',
            padding: '14px 0',
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 12,
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default UserPage;
