import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import CustomAttacksChart from '../components/CustomAttacksChart';
import CustomPefChart from '../components/CustomPefChart';
import { buildPefZonesForPatient } from '../utils/pefZones';

const LS_KEY = 'doctor_charts_state_v1';

function DoctorChartsPage() {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [searchOms, setSearchOms] = useState('');
  const [patient, setPatient] = useState(null);
  const [attacksData, setAttacksData] = useState([]);
  const [spirometryData, setSpirometryData] = useState([]);
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ← добавлено: состояние для лекарств
  const [medicines, setMedicines] = useState([]);

  const inputRef = useRef(null);

  const get14DaysRange = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 13);
    return [start, end];
  };
  const toIso = (d) => d.toISOString().slice(0, 10);

  const fmtShortDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }).replace(/\./g, '-');
  };
  const fmtFullDateTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '-');
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  const getAgeYears = (isoDate) => {
    if (!isoDate) return null;
    try {
      const d = new Date(isoDate);
      if (Number.isNaN(d.getTime())) return null;
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    } catch { return null; }
  };
  const ageText = useMemo(() => {
    if (!patient) return '—';
    const age = getAgeYears(patient.birthday);
    if (!Number.isFinite(age)) return '—';
    const last = age % 10, last2 = age % 100;
    const word = (last2 >= 11 && last2 <= 14) ? 'лет' : (last === 1 ? 'год' : (last >= 2 && last <= 4 ? 'года' : 'лет'));
    return `${age} ${word}`;
  }, [patient]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.patient) setPatient(saved.patient);
      if (Array.isArray(saved?.attacksData)) setAttacksData(saved.attacksData);
      if (Array.isArray(saved?.spirometryData)) setSpirometryData(saved.spirometryData);
      if (saved?.zones) setZones(saved.zones);
      if (typeof saved?.searchOms === 'string') setSearchOms(saved.searchOms);
    } catch {  }
  }, []);

  useEffect(() => {
    const stateToSave = { patient, attacksData, spirometryData, zones, searchOms };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(stateToSave));
    } catch { /* ignore quota */ }
  }, [patient, attacksData, spirometryData, zones, searchOms]);

  const handleSearch = async () => {
    setError('');
    setPatient(null);
    setAttacksData([]);
    setSpirometryData([]);
    setZones(null);
    setMedicines([]); // очистим лекарства при новом поиске
    if (!searchOms) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/patients?oms=${encodeURIComponent(searchOms)}`);
      if (!res.ok) throw new Error('Ошибка запроса пациента');
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const p = data[0];
        setPatient(p);

        const z = buildPefZonesForPatient(p);
        setZones(z);

        const [start, end] = get14DaysRange();

        const [attacksRes, spiroRes] = await Promise.all([
          fetch(`${API_URL}/attacks?patient_id=${p.id}&start_date=${toIso(start)}&end_date=${toIso(end)}`),
          fetch(`${API_URL}/spirometry?patient_id=${p.id}&start_date=${toIso(start)}&end_date=${toIso(end)}`),
        ]);

        let attacks = [];
        if (attacksRes.ok) {
          const a = await attacksRes.json();
          attacks = a.map(i => ({
            label: fmtShortDate(i.date_time),
            labelFull: fmtFullDateTime(i.date_time),
            value: i.scale,
          }));
        }
        setAttacksData(attacks);

        let spiro = [];
        if (spiroRes.ok) {
          const s = await spiroRes.json();
          spiro = s.map(i => ({
            label: fmtShortDate(i.date_time),
            labelFull: fmtFullDateTime(i.date_time),
            value: i.result,
          }));
        }
        setSpirometryData(spiro);
      } else {
        setError('Пациент не найден');
      }
    } catch (e) {
      setError(e.message || 'Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  // ← добавлено: загрузка назначенных лекарств «как в userpage»
  useEffect(() => {
    if (!patient?.id) return;

    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${API_URL}/medicine/by-patient?patient_id=${patient.id}`);
        if (!response.ok) throw new Error('Ошибка загрузки лекарств');

        const data = await response.json();
        // поведение как в UserPage: берём максимум 2 записи
        setMedicines(Array.isArray(data) ? data.slice(0, 2) : []);
      } catch (err) {
        console.error('Ошибка при получении лекарств:', err);
        setMedicines([]);
      }
    };

    fetchMedicines();
  }, [patient, API_URL]);

  const handleClear = () => {
    setPatient(null);
    setAttacksData([]);
    setSpirometryData([]);
    setZones(null);
    setMedicines([]);
    setError('');
    setSearchOms('');
    try { localStorage.removeItem(LS_KEY); } catch {}
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.focus();
    });
  };

  const PatientCard = ({ p }) => (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '12px 14px 14px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
        marginBottom: 16,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Карточка пациента</div>
        <button
          onClick={handleClear}
          aria-label="Сбросить выбранного пациента"
          title="Сбросить выбранного пациента"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            transform: 'translate(-6px, 6px)',
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            lineHeight: 1,
            fontSize: 18,
            color: '#6b7280',
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <Info label="👤 ФИО" value={`${p.surname || ''} ${p.name || ''} ${p.patronymic || ''}`.trim() || '—'} />
        <Info label="🩺 ОМС" value={p.oms || '—'} />
        <Info label="📏 Рост" value={p.height != null && p.height !== '' ? `${p.height} см` : '—'} />
        <Info label="🎂 Возраст" value={ageText} />
        <Info label="♀️♂️ Пол" value={p.sex || '—'} />
      </div>
    </div>
  );

  // ← добавлено: блок «Назначенные лекарства»
  const MedicinesBlock = () => (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '12px 14px 16px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700, textAlign: 'left', margin: '4px 0 12px', fontSize: 16 }}>
        💊 Назначенные лекарства
      </div>

      {medicines.length === 0 ? (
        <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          Нет назначенных лекарств
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                padding: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{med.name}</div>
              <div style={{ fontSize: 13, color: '#4b5563' }}>{med.mkg} мкг</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '12px 8px 16px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
        marginBottom: 18,
      }}
    >
      <div style={{ fontWeight: 700, textAlign: 'center', margin: '6px 0 10px' }}>{title}</div>
      {children}
    </div>
  );

  const Info = ({ label, value }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );

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
          height: 'calc(90vh - 90px)',
        }}
      >
        <div
          style={{
            overflowY: 'auto',
            height: '100%',
            width: 'min(96vw, 1000px)',
            margin: '0 auto',
            padding: '16px 0 140px',
          }}
        >
          {loading && <p style={{ textAlign: 'center', marginBottom: 12 }}>Загрузка…</p>}
          {error && <p style={{ textAlign: 'center', color: '#c00', marginBottom: 12 }}>{error}</p>}

          {patient && <PatientCard p={patient} />}

          {/* ← добавлено: блок лекарств сразу под карточкой пациента */}
          {patient && <MedicinesBlock />}

          {patient && (
            <>
              <ChartCard title="График приступов">
                {attacksData.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>Нет данных</p>
                ) : (
                  <CustomAttacksChart
                    data={attacksData}
                    height={250}
                    minPxPerPoint={42}
                    maxXTicks={8}
                  />
                )}
              </ChartCard>

              <ChartCard title="Пикфлоуметрия">
                {spirometryData.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>Нет данных</p>
                ) : (
                  <CustomPefChart
                    data={spirometryData}
                    zones={zones}
                    height={320}
                    minPxPerPoint={56}
                    maxXTicks={8}
                  />
                )}
              </ChartCard>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 10px rgba(0,0,0,.08)',
          padding: 12,
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          ref={inputRef}
          placeholder="Введите ОМС пациента"
          value={searchOms}
          onChange={(e) => setSearchOms(e.target.value)}
          style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            outline: 'none',
            fontSize: 16,
            padding: '10px 12px',
            borderRadius: 12,
            background: '#fff',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            padding: '0 16px',
            fontSize: 16,
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
          title="Найти"
        >
          Найти
        </button>
      </div>
    </>
  );
}

export default DoctorChartsPage;
