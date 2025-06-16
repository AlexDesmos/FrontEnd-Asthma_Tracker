import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function DoctorChartsPage() {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [searchOms, setSearchOms] = useState('');
  const [patient, setPatient] = useState(null);
  const [attacksData, setAttacksData] = useState([]);
  const [spirometryData, setSpirometryData] = useState([]);

  const get14DaysRange = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 13);
    return [start, end];
  };
  const toIso = (d) => d.toISOString().slice(0, 10);

  /** поиск пациента по ОМС */
  const handleSearch = async () => {
    setPatient(null);
    setAttacksData([]);
    setSpirometryData([]);
    if (!searchOms) return;

    try {
      const res = await fetch(`${API_URL}/patients?oms=${searchOms}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const p = data[0];
        setPatient(p);
      } else {
        alert('Пациент не найден');
      }
    } catch {
      alert('Ошибка подключения');
    }
  };

  /** когда выбран пациент — грузим графики */
  useEffect(() => {
    if (!patient) return;
    const [start, end] = get14DaysRange();

    const fetchAttacks = async () => {
      try {
        const r = await fetch(
          `${API_URL}/attacks?patient_id=${patient.id}&start_date=${toIso(start)}&end_date=${toIso(end)}`
        );
        const d = await r.json();
        setAttacksData(
          d.map((i) => ({
            date: new Date(i.date_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            scale: i.scale,
          }))
        );
      } catch {
        /* ignore */
      }
    };

    const fetchSpiro = async () => {
      try {
        const r = await fetch(
          `${API_URL}/spirometry?patient_id=${patient.id}&start_date=${toIso(start)}&end_date=${toIso(end)}`
        );
        const d = await r.json();
        setSpirometryData(
          d.map((i) => ({
            date: new Date(i.date_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            result: i.result,
          }))
        );
      } catch { /* ignore */ }
    };

    fetchAttacks();
    fetchSpiro();
  }, [patient, API_URL]);

  const chartBlock = (title, data, dataKey, stroke) => (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,.05)',
    }}>
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>{title}</div>
      {data.length === 0
        ? <p style={{ textAlign: 'center' }}>Нет данных</p>
        : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
    </div>
  );

  return (
    <>
      <Header />
      {/* ---- Инфо о пациенте ---- */}
      {patient && (
        <div style={{
          background: '#fffbe6', padding: 12, textAlign: 'center', fontWeight: 600,
          borderBottom: '1px solid #ececec',
        }}>
          {patient.surname} {patient.name} — ОМС {patient.oms}
        </div>
      )}

      <div style={{ padding: '16px 12px', maxWidth: 600, margin: '0 auto', paddingBottom: 180 }}>
        {chartBlock('График приступов', attacksData, 'scale', '#e53935')}
        {chartBlock('Пикфлоуметрия', spirometryData, 'result', '#4caf50')}
      </div>

      {/* ---- поле поиска внизу ---- */}
      <div style={{
        position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
        width: '85%', maxWidth: 400, background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,.08)', padding: 12, display: 'flex',
      }}>
        <input
          placeholder="Введите ОМС пациента"
          value={searchOms}
          onChange={(e) => setSearchOms(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: '6px 8px' }}
        />
        <button
          onClick={handleSearch}
          style={{ border: 'none', background: '#1976d2', color: '#fff', padding: '0 16px', fontSize: 20 }}
        >🔍︎
        </button>
      </div>
    </>
  );
}

export default DoctorChartsPage;
