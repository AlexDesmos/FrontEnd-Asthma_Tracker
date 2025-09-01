import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../css/MeasurePage.css';

function MeasurePage({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [peakFlow, setPeakFlow] = useState('');
  const [medicines, setMedicines] = useState([]);

  const SCALE_HINTS = [
    { n: 1, title: 'Очень лёгкий', text: 'Лёгкое покашливание, дыхание почти как обычно.' },
    { n: 2, title: 'Лёгкий', text: 'Небольшая одышка при активности, без ночных симптомов.' },
    { n: 3, title: 'Умеренный', text: 'Регулярные симптомы, мешают делам, возможны ночные пробуждения.' },
    { n: 4, title: 'Тяжёлый', text: 'Одышка даже в покое, спасательное лекарство помогает слабо.' },
    { n: 5, title: 'Угрожающий жизни', text: 'Трудно говорить, выраженная слабость/синюшность — срочно нужна помощь.' },
  ];

  useEffect(() => {
    if (!userId) return;
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

  const getIsoMoscow = () => {
    const now = new Date();
    const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return moscowTime.toISOString().slice(0, 19);
  };

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
    if (!value || value < 50 || value > 950) {
      alert('Введите корректное значение пикфлоуметрии (от 50 до 950)');
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

  return (
    <>
      <Header />

      <div className="mp-wrap">
        <h2 className="mp-title">Передать показания</h2>

        {medicines.length > 0 && (
          <div className="mp-meds">
            {medicines.map((med) => (
              <div key={med.id} className="mp-med">
                <div className="mp-med__name">{med.name}</div>
                <div className="mp-med__dose">{med.mkg} мкг</div>
                <button className="mp-med__btn" onClick={() => handleTakeMedication(med.id)}>
                  Принять
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mp-spirometry">
          <label htmlFor="peakFlow">Показания пикфлоуметрии</label>
          <div className="mp-spirometry__row">
            <input
              id="peakFlow"
              type="number"
              min="50"
              max="950"
              value={peakFlow}
              onChange={(e) => setPeakFlow(e.target.value)}
              placeholder="50 - 950"
              inputMode="numeric"
            />
            <button className="mp-spirometry__send" onClick={handleSendSpirometry} aria-label="Отправить показание">
              ➔
            </button>
          </div>
        </div>

        <button className="mp-attack" onClick={handleAttackClick} aria-label="Сообщить о приступе">
          Приступ
        </button>

        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
          }}>
            <div style={{
              backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '92%', maxWidth: 360,
              textAlign: 'center', boxShadow: '0 12px 30px rgba(0,0,0,0.18)'
            }}>
              <h3 style={{ marginBottom: 6 }}>Насколько сильный приступ?</h3>
              <p style={{ marginBottom: 16, fontSize: 14, color: '#6b7280' }}>1 — не сильный, 5 — очень сильный</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleSelectScale(num)}
                    style={{
                      width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e53935', color: '#fff',
                      fontSize: 16, fontWeight: 'bold', border: 'none', cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(229,57,53,0.3)'
                    }}
                    aria-label={`Тяжесть ${num}`}
                    title={`Тяжесть ${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div style={{
                textAlign: 'left', borderTop: '1px solid #eee', paddingTop: 12,
                maxHeight: 220, overflowY: 'auto'
              }}>
                {SCALE_HINTS.map(hint => (
                  <div
                    key={hint.n}
                    style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr', gap: 10, alignItems: 'start',
                      padding: '8px 10px', borderRadius: 12, background: hint.n === 5 ? '#fff5f5' : '#fafafa',
                      border: '1px solid #f0f0f0', marginBottom: 8
                    }}
                  >
                    <div aria-hidden="true" style={{
                      width: 32, height: 32, borderRadius: 8, background: '#e53935', color: '#fff',
                      fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(229,57,53,0.25)'
                    }}>
                      {hint.n}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{hint.title}</div>
                      <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.35 }}>{hint.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Уведомление "Отправлено!" */}
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
