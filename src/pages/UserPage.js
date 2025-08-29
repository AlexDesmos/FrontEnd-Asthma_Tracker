import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { differenceInYears, parseISO, isValid } from 'date-fns';

function UserPage({ userOms, onLogout }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicines, setMedicines] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  useEffect(() => {
    if (!userOms) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        setPatient(null);

        const response = await fetch(`${API_URL}/patients?oms=${encodeURIComponent(userOms)}`);
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
    if (!patient?.id) return;

    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${API_URL}/medicine/by-patient?patient_id=${patient.id}`);
        if (!response.ok) throw new Error('Ошибка загрузки лекарств');

        const data = await response.json();
        setMedicines(Array.isArray(data) ? data.slice(0, 2) : []);
      } catch (err) {
        console.error('Ошибка при получении лекарств:', err);
        setMedicines([]);
      }
    };

    fetchMedicines();
  }, [patient, API_URL]);

  const handleLogoutClick = () => {
    onLogout();
  };

  const getInitials = () => {
    if (!patient) return '';
    const name = (patient.name || '').trim();
    const surname = (patient.surname || '').trim();
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const getYearWord = (age) => {
    if (age % 100 >= 11 && age % 100 <= 14) return 'лет';
    const lastDigit = age % 10;
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
  };

  const safeAge = () => {
    if (!patient?.birthday) return '';
    try {
      const d = parseISO(patient.birthday);
      if (!isValid(d)) return '';
      const age = differenceInYears(new Date(), d);
      return `${age} ${getYearWord(age)}`;
    } catch {
      return '';
    }
  };

  const prettyPhone = (p) => {
    if (!p) return '—';
    const digits = String(p).replace(/\D/g, '');
    if (digits.length === 11 && digits[0] === '8') {
      return digits.replace(/(\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($2) $3-$4-$5');
    }
    if (digits.length === 11 && digits[0] === '7') {
      return digits.replace(/7(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($1) $2-$3-$4');
    }
    return p;
  };

  const heightValue = (h) => {
    if (h === null || h === undefined || h === '') return '—';
    const num = Number(h);
    if (Number.isFinite(num)) return `${num} см`;
    return `${h}`;
  };

  return (
    <>
      <Header />
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 12px',
          boxSizing: 'border-box',
          height: 'calc(100vh - 220px)',
        }}
      >
        <div
          style={{
            overflowY: 'auto',
            height: '100%',
            width: 'min(95vw, 860px)',
            margin: '0 auto',
            padding: '24px 16px 140px',
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 'clamp(72px, 10vw, 96px)',
                height: 'clamp(72px, 10vw, 96px)',
                borderRadius: '50%',
                backgroundColor: '#e9e9ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(24px, 5vw, 32px)',
                fontWeight: 700,
                color: '#3c3c43',
                marginBottom: 12,
                userSelect: 'none',
              }}
            >
              {getInitials()}
            </div>
            <h2
              style={{
                fontSize: 'clamp(18px, 3.5vw, 22px)',
                fontWeight: 700,
                margin: 0,
              }}
            >
              Профиль
            </h2>
          </div>

          {loading && <p>Загрузка...</p>}
          {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

          {patient && (
            <>
              <div
                style={{
                  backgroundColor: '#f6f7fb',
                  borderRadius: 14,
                  padding: 'clamp(14px, 2vw, 20px)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 'clamp(10px, 1.6vw, 14px)',
                }}
              >
                <Info label="👤 ФИО" value={`${patient.surname} ${patient.name} ${patient.patronymic}`} />
                <Info label="♀️♂️ Пол" value={patient.sex || '—'} />
                <Info
                  label="🎂 Дата рождения / возраст"
                  value={
                    patient.birthday
                      ? `${patient.birthday} / ${safeAge() || '—'}`
                      : '—'
                  }
                />
                <Info label="📏 Рост" value={heightValue(patient.height)} />
                <Info label="📞 Телефон" value={prettyPhone(patient.phone_number)} />
                <Info label="🩺 ОМС" value={patient.oms} />
              </div>

              <div style={{ marginTop: 10 }}>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, margin: '0 0 12px' }}>
                  💊 Назначенные лекарства
                </h3>
                {medicines.length === 0 ? (
                  <div style={{ fontSize: 'clamp(14px, 2.6vw, 16px)', color: '#6b7280', textAlign: 'center' }}>
                    Вам ничего не назначено 😊
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {medicines.map((med, idx) => (
                      <div
                        key={`${med.name}-${idx}`}
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #eee',
                          borderRadius: 12,
                          padding: 'clamp(12px, 2vw, 14px)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 2.8vw, 15px)' }}>{med.name}</div>
                        <div style={{ fontSize: 'clamp(12px, 2.4vw, 13px)', color: '#4b5563' }}>{med.mkg} мкг</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={handleLogoutClick}
          style={{
            maxWidth: 480,
            width: '100%',
            padding: '14px 0',
            fontSize: 'clamp(15px, 3vw, 16px)',
            fontWeight: 700,
            borderRadius: 14,
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
            pointerEvents: 'auto',
          }}
        >
          Выйти
        </button>
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 'clamp(12px, 2.3vw, 13px)',
          color: '#6b7280',
          marginBottom: 4,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
        title={typeof label === 'string' ? label : undefined}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 'clamp(14px, 2.8vw, 15px)',
          wordBreak: 'break-word',
        }}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export default UserPage;
