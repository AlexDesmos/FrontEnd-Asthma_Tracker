import React, { useState } from 'react';

function MeasurePage({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [peakFlow, setPeakFlow] = useState('');

  const handleAttackClick = () => {
    setShowModal(true);
  };

  const handleSelectScale = async (scale) => {
    setShowModal(false);

    try {
      const now = new Date();
      const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const isoString = moscowTime.toISOString().slice(0, 19);

      const attackData = {
        patient_id: userId,
        date_time: isoString,
        scale
      };

      const response = await fetch(`${API_URL}/attacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attackData)
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
      const now = new Date();
      const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const isoString = moscowTime.toISOString().slice(0, 19);

      const body = {
        patient_id: userId,
        result: value,
        date_time: isoString
      };

      const response = await fetch(`${API_URL}/spirometry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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

  return (
    <div style={{ padding: '20px', paddingBottom: '120px', textAlign: 'center' }}>
      <h2>Передать показания</h2>

      {/* Поле ввода пикфлоуметрии */}
      <div style={{
        position: 'fixed',
        bottom: 260,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: 300,
        zIndex: 1000,
      }}>
        <label htmlFor="peakFlow" style={{ fontWeight: 'bold', display: 'block', marginBottom: 8, textAlign: 'center' }}>
          Показания пикфлоуметрии
        </label>
        <div style={{
          display: 'flex',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <input
            id="peakFlow"
            type="number"
            value={peakFlow}
            onChange={(e) => setPeakFlow(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 16,
              border: 'none',
              outline: 'none'
            }}
            placeholder="Введите значение"
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

      {/* Кнопка "Приступ" */}
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
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: '#e53935',
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 'normal',
            padding: 10,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            wordBreak: 'break-word'
          }}
        >
          Приступ
        </button>
      </div>

      {/* Модалка выбора силы приступа */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            textAlign: 'center',
            width: '90%',
            maxWidth: 300
          }}>
            <h3>Насколько сильный приступ?</h3>
            <p>1 — не сильный, 5 — очень сильный</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleSelectScale(num)}
                  style={{
                    width: 40,
                    height: 40,
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

      {/* Уведомление "Отправлено!" */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 3000
        }}>
          Отправлено!
        </div>
      )}
    </div>
  );
}

export default MeasurePage;
