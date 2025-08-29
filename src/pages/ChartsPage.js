import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import CustomPefChart from '../components/CustomPefChart';
import CustomAttacksChart from '../components/CustomAttacksChart';
import pefExact from '../data/pef_zones_exact_normalized.json';
import '../css/ChartsPage.css';

function ChartsPage({ userOms }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [errorPatient, setErrorPatient] = useState('');

  const [spirometryData, setSpirometryData] = useState([]);
  const [attacksData, setAttacksData] = useState([]);

  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const pefHeight = vw < 360 ? 260 : vw < 768 ? 300 : 360;
  const attHeight = vw < 360 ? 220 : vw < 768 ? 240 : 280;
  const pefPxPerPoint = vw < 360 ? 64 : vw < 768 ? 56 : 48;
  const attPxPerPoint = vw < 360 ? 50 : vw < 768 ? 44 : 40;
  const pefMaxXTicks  = vw < 360 ? 6 : vw < 768 ? 8 : 10;
  const attMaxXTicks  = vw < 360 ? 6 : vw < 768 ? 8 : 10;

  useEffect(() => {
    if (!userOms) {
      setErrorPatient('Не найден ОМС пользователя: передай prop userOms из авторизации.');
      setPatient(null);
      return;
    }
    const fetchPatient = async () => {
      try {
        setLoadingPatient(true);
        setErrorPatient('');
        const resp = await fetch(`${API_URL}/patients?oms=${encodeURIComponent(userOms)}`);
        if (!resp.ok) throw new Error('Ошибка при запросе данных пациента');
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) setPatient(data[0]);
        else throw new Error('Пациент с таким ОМС не найден');
      } catch (e) {
        setErrorPatient(e.message);
        setPatient(null);
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [userOms, API_URL]);

  const getAge = (isoDate) => {
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
  const normSex = (s) => {
    const x = String(s || '').trim().toLowerCase();
    if (['м', 'муж', 'мужской', 'male', 'm'].includes(x)) return 'муж';
    if (['ж', 'жен', 'женский', 'female', 'f'].includes(x)) return 'жен';
    return x;
  };

  const pickExactNorm = (sex, ageYears, heightCm) => {
    const rows = pefExact?.rows ?? [];
    if (!rows.length) return null;

    const sx = normSex(sex);
    let candidates = rows.filter(r => normSex(r.sex) === sx);
    if (!candidates.length) return null;

    let ageMatches = candidates.filter(r => Number(r.age_years) === Number(ageYears));
    if (!ageMatches.length) {
      const withAgeScore = candidates.map(r => ({ ...r, __ageDiff: Math.abs(Number(r.age_years) - Number(ageYears)) }));
      const minAgeDiff = Math.min(...withAgeScore.map(x => x.__ageDiff));
      ageMatches = withAgeScore.filter(x => x.__ageDiff === minAgeDiff);
    }

    let bestByHeight = ageMatches.filter(r => Number(r.height_cm) === Number(heightCm));
    if (!bestByHeight.length) {
      const scored = ageMatches
        .map(r => ({ ...r, __hDiff: Math.abs(Number(r.height_cm) - Number(heightCm)) }))
        .sort((a, b) => a.__hDiff - b.__hDiff);
      bestByHeight = scored.length ? [scored[0]] : [];
    }
    return bestByHeight[0] || null;
  };

  // Форматтеры дат
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

  useEffect(() => {
    if (!patient?.id) return;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const fmtISODate = (d) => d.toISOString().slice(0, 10);

    const load = async () => {
      try {
        const aRes = await fetch(`${API_URL}/attacks?patient_id=${patient.id}&start_date=${fmtISODate(startDate)}&end_date=${fmtISODate(now)}`);
        const attacks = await aRes.json();
        setAttacksData(attacks.map(it => {
          const label = fmtShortDate(it.date_time);
          const labelFull = fmtFullDateTime(it.date_time);
          return { label, labelFull, value: it.scale };
        }));
      } catch { setAttacksData([]); }

      try {
        const sRes = await fetch(`${API_URL}/spirometry?patient_id=${patient.id}&start_date=${fmtISODate(startDate)}&end_date=${fmtISODate(now)}`);
        const results = await sRes.json();
        setSpirometryData(results.map(it => {
          const label = fmtShortDate(it.date_time);
          const labelFull = fmtFullDateTime(it.date_time);
          return { label, labelFull, value: it.result };
        }));
      } catch { setSpirometryData([]); }
    };
    load();
  }, [patient, API_URL]);

  const normEntry = useMemo(() => {
    if (!patient) return null;
    const age = getAge(patient.birthday);
    const sex = patient.sex;
    const height = Number(patient.height);
    if (!Number.isFinite(age) || !sex || !Number.isFinite(height)) return null;
    return pickExactNorm(sex, age, height);
  }, [patient]);

  const zones = useMemo(() => {
    if (!normEntry) return null;
    const pefPred = normEntry.pef_pred_l_min;
    const redFrom = normEntry.red_from ?? 0;
    const redTo = normEntry.red_to ?? (pefPred ? 0.5 * pefPred : null);
    const yellowFrom = normEntry.yellow_from ?? (pefPred ? 0.5 * pefPred : null);
    const yellowTo = normEntry.yellow_to ?? (pefPred ? 0.8 * pefPred : null);
    const greenFrom = normEntry.green_from ?? (pefPred ? 0.8 * pefPred : null);
    const greenTo = normEntry.green_to ?? pefPred ?? null;
    if (![pefPred, redFrom, redTo, yellowFrom, yellowTo, greenFrom, greenTo].every(v => Number.isFinite(v))) return null;
    return { red: [redFrom, redTo], yellow: [yellowFrom, yellowTo], green: [greenFrom, greenTo], norm: pefPred };
  }, [normEntry]);

  const pefData = useMemo(
    () => spirometryData.map(d => ({ label: d.label, labelFull: d.labelFull, value: d.value })),
    [spirometryData]
  );
  const attacksChartData = useMemo(
    () => attacksData.map(d => ({ label: d.label, labelFull: d.labelFull, value: d.value })),
    [attacksData]
  );

  return (
    <>
      <Header />
      {/* скроллируемый по вертикали центрированный контейнер */}
      <div className="charts-page">
        <div className="charts-container">
          {/* График приступов */}
          <div className="card">
            <div className="card-title">График приступов</div>
            {loadingPatient && <p className="center muted">Загрузка данных…</p>}
            {errorPatient && <p className="center error">{errorPatient}</p>}
            {attacksChartData.length === 0 ? (
              <p className="center muted">Нет данных для отображения.</p>
            ) : (
              <CustomAttacksChart
                data={attacksChartData}
                height={attHeight}
                minPxPerPoint={attPxPerPoint}
                maxXTicks={attMaxXTicks}
              />
            )}
          </div>

          {/* График ПЭФ */}
          <div className="card">
            <div className="card-title">Показания пикфлоуметрии</div>
            {pefData.length === 0 ? (
              <p className="center muted">Нет данных для отображения.</p>
            ) : (
              <CustomPefChart
                data={pefData}
                zones={zones}
                height={pefHeight}
                minPxPerPoint={pefPxPerPoint}
                maxXTicks={pefMaxXTicks}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChartsPage;
