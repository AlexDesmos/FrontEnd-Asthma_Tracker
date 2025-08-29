import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import CustomPefChart from '../components/CustomPefChart';
import CustomAttacksChart from '../components/CustomAttacksChart';
import { buildPefZonesForPatient } from '../utils/pefZones';
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

  const zones = useMemo(() => buildPefZonesForPatient(patient), [patient]);

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
      <div className="charts-page">
        <div className="charts-container">
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
