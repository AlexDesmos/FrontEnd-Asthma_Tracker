import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import CustomAttacksChart from '../components/CustomAttacksChart';
import CustomPefChart from '../components/CustomPefChart';
import CustomMedicineHeatmap from '../components/CustomMedicineHeatmap';
import { buildPefZonesForPatient } from '../utils/pefZones';
import { ymdLocal, fmtShortDate, fmtFullDateTime, fmtTime } from '../utils/dateUtils';
import '../css/DoctorChartsPage.css';

const LS_KEY = 'doctor_charts_state_v2';

function DoctorChartsPage() {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [searchOms, setSearchOms] = useState('');
  const [patient, setPatient] = useState(null);
  const [attacksData, setAttacksData] = useState([]);
  const [spirometryData, setSpirometryData] = useState([]);
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [medicines, setMedicines] = useState([]);
  const [medRows, setMedRows] = useState([]);
  const [medDates, setMedDates] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [assignOpen, setAssignOpen] = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef(null);

  const getDaysRange = (n = 14) => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (n - 1));
    return [start, end];
  };
  const toIso = (d) => ymdLocal(d);

  const buildLastNDates = (n = 7) => {
    const arr = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }).replace(/\./g, '-');
      const labelFull = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '-');
      arr.push({ label, labelFull, iso: ymdLocal(d) });
    }
    return arr;
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

  // load from LS
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
      if (Array.isArray(saved?.medRows)) setMedRows(saved.medRows);
      if (Array.isArray(saved?.medDates)) setMedDates(saved.medDates);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const stateToSave = { patient, attacksData, spirometryData, zones, searchOms, medRows, medDates };
    try { localStorage.setItem(LS_KEY, JSON.stringify(stateToSave)); } catch { /* ignore */ }
  }, [patient, attacksData, spirometryData, zones, searchOms, medRows, medDates]);

  const handleSearch = async () => {
    setError('');
    setPatient(null);
    setAttacksData([]); setSpirometryData([]); setZones(null);
    setMedicines([]); setMedRows([]); setMedDates([]);
    if (!searchOms) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/patients?oms=${encodeURIComponent(searchOms)}`);
      if (!res.ok) throw new Error('Ошибка запроса пациента');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError('Пациент не найден');
        return;
      }
      const p = data[0];
      setPatient(p);
      setZones(buildPefZonesForPatient(p));

      const [start14, end14] = getDaysRange(14);
      const [start7, end7] = getDaysRange(7);

      const [attacksRes, spiroRes, medsTakeRes] = await Promise.all([
        fetch(`${API_URL}/attacks?patient_id=${p.id}&start_date=${toIso(start14)}&end_date=${toIso(end14)}`),
        fetch(`${API_URL}/spirometry?patient_id=${p.id}&start_date=${toIso(start14)}&end_date=${toIso(end14)}`),
        fetch(`${API_URL}/medicine/taking-medicine?patient_id=${p.id}&start_date=${toIso(start7)}&end_date=${toIso(end7)}`),
      ]);

      if (attacksRes.ok) {
        const a = await attacksRes.json();
        setAttacksData(a.map(i => ({
          label: fmtShortDate(i.date_time),
          labelFull: fmtFullDateTime(i.date_time),
          value: i.scale,
        })));
      }
      if (spiroRes.ok) {
        const s = await spiroRes.json();
        setSpirometryData(s.map(i => ({
          label: fmtShortDate(i.date_time),
          labelFull: fmtFullDateTime(i.date_time),
          value: i.result,
        })));
      }
      if (medsTakeRes.ok) {
        const items = await medsTakeRes.json();
        const dates = buildLastNDates(7);
        setMedDates(dates);
        const map = new Map();
        for (const it of items) {
          const key = `${it.medicine_name || 'Неизвестно'}|${it.mkg ?? ''}`;
          if (!map.has(key)) {
            map.set(key, { title: it.medicine_name || 'Неизвестно', sub: it.mkg ?? '', daily: new Map() });
          }
          const bucket = map.get(key);
          const dateIso = ymdLocal(it.date_time);
          const time = fmtTime(it.date_time);
          const arr = bucket.daily.get(dateIso) || [];
          arr.push(time);
          bucket.daily.set(dateIso, arr);
        }
        const rows = Array.from(map.entries()).map(([key, val]) => {
          const dataPoints = dates.map((d) => {
            const times = val.daily.get(d.iso) || [];
            return { date: d.label, dateFull: d.labelFull, count: times.length, times: times.sort() };
          });
          return { key, title: val.title, sub: val.sub, data: dataPoints };
        });
        setMedRows(rows);
      }
    } catch (e) {
      setError(e.message || 'Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patient?.id) return;
    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${API_URL}/medicine/by-patient?patient_id=${patient.id}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setMedicines(Array.isArray(data) ? data : []);
      } catch {
        setMedicines([]);
      }
    };
    fetchMedicines();
  }, [patient, API_URL]);

  const handleClear = () => {
    setPatient(null);
    setAttacksData([]); setSpirometryData([]); setZones(null); setMedicines([]);
    setMedRows([]); setMedDates([]); setError(''); setSearchOms('');
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    if (inputRef.current) inputRef.current.focus();
  };

  // delete flow
  const handleAskDeleteMedicine = (med) => {
    setDeleteError(''); setMedToDelete(med); setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patient?.id || !medToDelete?.id) return;
    setDeleting(true); setDeleteError('');
    try {
      const url = `${API_URL}/medicine/delete-medicine?medicine_id=${medToDelete.id}&patient_id=${patient.id}`;
      const resp = await fetch(url, { method: 'DELETE' });
      if (!resp.ok) throw new Error();
      setMedicines(prev => prev.filter(m => m.id !== medToDelete.id));
      setConfirmOpen(false); setMedToDelete(null);
    } catch {
      setDeleteError('Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false); setMedToDelete(null); setDeleteError('');
  };

  const openAssignModal = async () => {
    if (!patient?.id) return;
    setAssignOpen(true); setAssignError(''); setSelectedMed(null); setDropdownOpen(false);
    setAssignLoading(true);
    try {
      const resp = await fetch(`${API_URL}/medicine/medicines`);
      if (!resp.ok) throw new Error('Не удалось загрузить список лекарств');
      const list = await resp.json();
      setAllMedicines(Array.isArray(list) ? list : []);
    } catch (e) {
      setAssignError(e.message || 'Ошибка загрузки списка');
      setAllMedicines([]);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSaveAssign = async () => {
    if (!patient?.id || !selectedMed?.id) return;
    setAssignError(''); setAssignLoading(true);
    try {
      const resp = await fetch(`${API_URL}/medicine/set-medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patient.id, medicine_id: selectedMed.id }),
      });
      if (!resp.ok) throw new Error('Не удалось назначить лекарство');

      setMedicines(prev => (prev.some(m => m.id === selectedMed.id) ? prev : [...prev, selectedMed]));
      setAssignOpen(false); setSelectedMed(null);
    } catch (e) {
      setAssignError(e.message || 'Ошибка назначения');
    } finally {
      setAssignLoading(false);
    }
  };

  const Info = ({ label, value }) => (
    <div>
      <div className="info-label">{label}</div>
      <div className="info-value">{value || '—'}</div>
    </div>
  );

  return (
    <>
      <Header />

      <div className="page-wrapper">
        <div className="page-content">
          {loading && <p className="text-center">Загрузка…</p>}
          {error && <p className="text-center text-error">{error}</p>}

          {/* Карточка пациента */}
          {patient && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Карточка пациента</div>
                <button className="btn btn-gray small" onClick={handleClear} title="Очистить">×</button>
              </div>
              <div className="info-grid">
                <Info label="👤 ФИО" value={`${patient.surname || ''} ${patient.name || ''} ${patient.patronymic || ''}`.trim()} />
                <Info label="🩺 ОМС" value={patient.oms} />
                <Info label="📏 Рост" value={patient.height ? `${patient.height} см` : '—'} />
                <Info label="🎂 Возраст" value={ageText} />
                <Info label="♀️♂️ Пол" value={patient.sex} />
              </div>
            </div>
          )}

          {/* Блок назначенных лекарств */}
          {patient && (
            <div className="medicines-block">
              <div className="medicines-header">
                <div className="medicines-title"><span>💊</span> Назначенные лекарства</div>
                <button className="btn btn-green" onClick={openAssignModal}>Назначить</button>
              </div>

              {medicines.length === 0 ? (
                <div className="empty-text">Нет назначенных лекарств</div>
              ) : (
                <div className="medicines-list">
                  {medicines.map((med) => (
                    <div key={med.id ?? `${med.name}-${med.mkg}`} className="medicine-card">
                      <button
                        className="delete-btn"
                        aria-label="Удалить лекарство"
                        title="Удалить лекарство"
                        onClick={() => handleAskDeleteMedicine(med)}
                      >
                        ×
                      </button>
                      <div className="medicine-name">{med.name}</div>
                      <div className="medicine-dose">{med.mkg}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* График приступов */}
          {patient && (
            <div className="chart-card">
              <div className="chart-title">График приступов</div>
              {attacksData.length === 0 ? (
                <p className="empty-text">Нет данных</p>
              ) : (
                <CustomAttacksChart data={attacksData} height={250} minPxPerPoint={42} maxXTicks={8} />
              )}
            </div>
          )}

          {/* Пикфлоуметрия */}
          {patient && (
            <div className="chart-card">
              <div className="chart-title">Пикфлоуметрия</div>
              {spirometryData.length === 0 ? (
                <p className="empty-text">Нет данных</p>
              ) : (
                <CustomPefChart data={spirometryData} zones={zones} height={320} minPxPerPoint={56} maxXTicks={8} />
              )}
            </div>
          )}

          {/* Приём лекарств (тепловая карта) */}
          {patient && (
            <div className="chart-card">
              <div className="chart-title">Приём лекарств (последние 7 дней)</div>
              {medRows.length === 0 ? (
                <p className="empty-text">Нет данных</p>
              ) : (
                <CustomMedicineHeatmap rows={medRows} dates={medDates} height={320} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Поисковая панель снизу */}
      <div className="search-bar">
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Введите ОМС пациента"
          value={searchOms}
          onChange={(e) => setSearchOms(e.target.value)}
        />
        <button className="btn btn-blue" onClick={handleSearch} title="Найти">Найти</button>
      </div>

      {/* Модалка подтверждения удаления */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={handleCancelDelete} role="dialog" aria-modal="true">
          <div className="modal modal-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Удалить лекарство?</div>
            <div className="modal-text">
              {medToDelete?.name ? `«${medToDelete.name}»` : 'Лекарство'} будет удалено из назначений пациента.
            </div>
            {deleteError && <div className="text-error small">{deleteError}</div>}
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={handleCancelDelete} disabled={deleting}>Нет</button>
              <button className="btn btn-red" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Удаление…' : 'Да'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка назначения лекарства */}
      {assignOpen && (
        <div className="modal-overlay" onClick={() => setAssignOpen(false)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Назначить лекарство</div>

            <div className="dropdown">
              <button
                className="dropdown-btn"
                onClick={() => !assignLoading && setDropdownOpen((v) => !v)}
                disabled={assignLoading}
              >
                {assignLoading
                  ? 'Загрузка списка…'
                  : selectedMed
                    ? `${selectedMed.name} ${selectedMed.mkg ?? ''}`.trim()
                    : 'Выберите лекарство'}
              </button>

              {dropdownOpen && !assignLoading && (
                <div className="dropdown-list">
                  {allMedicines.length === 0 ? (
                    <div className="empty-text p10">Список пуст</div>
                  ) : (
                    allMedicines.map((m) => (
                      <div
                        key={m.id}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedMed(m);
                          setDropdownOpen(false);
                        }}
                      >
                        {m.name} {m.mkg ?? ''}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {assignError && <div className="text-error small">{assignError}</div>}

            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setAssignOpen(false)} disabled={assignLoading}>
                Назад
              </button>
              <button
                className="btn btn-green"
                onClick={handleSaveAssign}
                disabled={assignLoading || !selectedMed}
              >
                {assignLoading ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorChartsPage;
