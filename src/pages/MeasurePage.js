import React, { useEffect, useState } from 'react';
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
    (async () => {
      try {
        const res = await fetch(`${API_URL}/medicine/by-patient?patient_id=${userId}`);
        if (!res.ok) throw new Error('Ошибка получения лекарств');
        const data = await res.json();
        setMedicines(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (e) {
        console.error('Ошибка лекарств:', e);
        setMedicines([]);
      }
    })();
  }, [userId, API_URL]);

  const getIsoMoscow = () => {
    const now = new Date();
    const msk = new Date(now.getTime() + 3 * 3600 * 1000);
    return msk.toISOString().slice(0, 19);
  };

  const handleAttackClick = () => setShowModal(true);

  const handleSelectScale = async (scale) => {
    setShowModal(false);
    try {
      const body = { patient_id: userId, date_time: getIsoMoscow(), scale };
      const r = await fetch(`${API_URL}/attacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      alert('Ошибка при отправке приступа.');
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
      const r = await fetch(`${API_URL}/spirometry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setPeakFlow('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      alert('Ошибка при отправке данных пикфлоуметрии.');
    }
  };

  const handleTakeMedication = async (medicineId) => {
    try {
      const body = { patient_id: userId, medicine_id: medicineId, date_time: getIsoMoscow() };
      const r = await fetch(`${API_URL}/medicine/taking-medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      alert('Ошибка при регистрации приёма лекарства.');
    }
  };

  return (
    <>
      <Header />

      <div className="page-shell">
        <main className="page-main">
          <div className="mp-wrap">
            <h2 className="mp-title">Передать показания</h2>

            {medicines.length > 0 && (
              <div className="mp-meds">
                {medicines.map((m) => (
                  <div key={m.id} className="mp-med">
                    <div className="mp-med__name">{m.name}</div>
                    <div className="mp-med__dose">{m.mkg} мкг</div>
                    <button className="mp-med__btn" onClick={() => handleTakeMedication(m.id)}>
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
                <button
                  className="mp-spirometry__send"
                  onClick={handleSendSpirometry}
                  aria-label="Отправить показание"
                >
                  ➔
                </button>
              </div>
            </div>

            <div className="mp-spacer" aria-hidden="true" />
          </div>
        </main>
      </div>

      {/* Фиксированная кнопка «Приступ» */}
      <button className="mp-attack" onClick={handleAttackClick} aria-label="Сообщить о приступе">
        Приступ
      </button>

      {/* Модальное окно выбора тяжести */}
      {showModal && (
        <div className="attack-modal-overlay">
          <div className="attack-modal">
            <h3>Насколько сильный приступ?</h3>
            <p>1 — не сильный, 5 — очень сильный</p>

            <div className="attack-buttons">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => handleSelectScale(n)}
                  aria-label={`Тяжесть ${n}`}
                  title={`Тяжесть ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="attack-hints">
              {SCALE_HINTS.map((hint) => (
                <div key={hint.n} className={`attack-hint ${hint.n === 5 ? 'danger' : ''}`}>
                  <div className="attack-hint-num">{hint.n}</div>
                  <div>
                    <div className="attack-hint-text-title">{hint.title}</div>
                    <div className="attack-hint-text-body">{hint.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="attack-close" onClick={() => setShowModal(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Уведомление */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4caf50',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 3000,
          }}
        >
          Отправлено!
        </div>
      )}
    </>
  );
}

export default MeasurePage;
