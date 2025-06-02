import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function MeasurePage({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  // ------------------- state -------------------
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [peakFlow, setPeakFlow] = useState('');
  const [medicines, setMedicines] = useState([]); // 👈 новое состояние для лекарств

  // ------------------- side-effects -------------------
  useEffect(() => {
    if (!userId) return;

    // Загружаем максимум 2 назначенных лекарства для пациента
    const fetchMedicines = async () => {
      try {
        const res = await fetch(`${API_URL}/medicine/by-patient?patient_id=${userId}`);
        if (!res.ok) throw new Error('Ошибка получения лекарств');
        const data = await res.json();
        setMedicines(data.slice(0, 3));
      } catch (err) {
        console.error('Ошибка при загрузке лекарств:', err);
      }
    };

    fetchMedicines();
  }, [userId, API_URL]);

  // ------------------- helpers -------------------
  const getIsoMoscow = () => {
    const now = new Date();
    const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return moscowTime.toISOString().slice(0, 19);
  };

  // ------------------- handlers -------------------
  const handleAttackClick = () => setShowModal(true);

  const handleSelectScale = async (scale) => {
    setShowModal(false);
    try {
      const attackData = { patient_id: userId, date_time: getIsoMoscow(), scale };
      const response = await fetch(`${API_URL}/attacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attackData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert('Ошибка при отправке приступа.');
      }
    } catch (error) {
      console.error('Ошибка отправки запроса:', error);
      alert('Ошибка подключения к серверу.');
    }
  };

  const handleSendSpirometry = async () => {
    const value = parseInt(peakFlow, 10);
    if (!value || value <= 0) {
      alert('Введите корректное значение пикфлоуметрии');
      return;
    }

    try {
      const body = { patient_id: userId, result: value, date_time: getIsoMoscow() };
      const response = await fetch(`${API_URL}/spirometry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setPeakFlow('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert('Ошибка при отправке данных пикфлоуметрии.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка подключения к серверу.');
    }
  };

  // 👇 обработка приёма лекарства
  const handleTakeMedication = async (medicineId) => {
    try {
      const body = {
        patient_id: userId,
        medicine_id: medicineId,
        date_time: getIsoMoscow(),
      };

      const response = await fetch(`${API_URL}/medicine/taking-medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert('Ошибка при регистрации приёма лекарства.');
      }
    } catch (error) {
      console.error('Ошибка отправки запроса:', error);
      alert('Ошибка подключения к серверу.');
    }
  };

  // ------------------- render -------------------
  return (
    <>
      <Header />
      <div style={{ padding: '20px', paddingBottom: '160px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', marginBottom: 16 }}>Передать показания</h2>

        {/* ---------- Блок лекарств ---------- */}
        {medicines.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {medicines.map((med) => (
              <div
                key={med.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{med.name}</div>
                <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>{med.mkg} мкг</div>
                <button
                  onClick={() => handleTakeMedication(med.id)}
                  style={{
                    padding: '8px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: '#1976d2',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                >
                  Принять
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---------- Блок пикфлоуметрии ---------- */}
        <div style={{
          position: 'fixed',
          bottom: 260,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          maxWidth: 360,
          zIndex: 1000,
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 16,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <label htmlFor="peakFlow" style={{
            fontWeight: 'bold',
            display: 'block',
            marginBottom: 10,
            fontSize: 16
          }}>
            Показания пикфлоуметрии
          </label>
          <div style={{
            display: 'flex',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #ccc'
          }}>
            <input
              id="peakFlow"
              type="number"
              value={peakFlow}
              onChange={(e) => setPeakFlow(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                fontSize: 16,
                border: 'none',
                outline: 'none'
              }}
              placeholder="Напр. 400"
            />
            <button onClick={handleSendSpirometry} style={{
              backgroundColor: '#4caf50',
              color: '#fff',
              padding: '0 16px',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer'
            }}>
              ➔
            </button>
          </div>
        </div>

        {/* ---------- Кнопка "Приступ" ---------- */}
        <div style={{
          position: 'fixed',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
        }}>
          <button
            onClick={handleAttackClick}
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: '#e53935',
              color: '#fff',
              fontSize: 15,
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Приступ
          </button>
        </div>

        {/* ---------- Модалка выбора силы приступа ---------- */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 16,
              width: '90%',
              maxWidth: 320,
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: 8 }}>Насколько сильный приступ?</h3>
              <p style={{ marginBottom: 20, fontSize: 14 }}>1 — не сильный, 5 — очень сильный</p>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleSelectScale(num)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: '#e53935',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Уведомление "Отправлено!" ---------- */}
        {showSuccess && (
          <div style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '14px 22px',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 3000,
            animation: 'fadeInOut 2s ease'
          }}>
            Отправлено!
          </div>
        )}
      </div>
    </>
  );
}

export default MeasurePage;
