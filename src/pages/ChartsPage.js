import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function ChartsPage({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';
  const [attacksData, setAttacksData] = useState([]);
  const [spirometryData, setSpirometryData] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const formatDate = (date) => date.toISOString().slice(0, 10);

    const fetchAttacks = async () => {
      try {
        const response = await fetch(
          `${API_URL}/attacks?patient_id=${userId}&start_date=${formatDate(startDate)}&end_date=${formatDate(now)}`
        );
        const attacks = await response.json();

        const formatted = attacks.map(item => ({
          date: new Date(item.date_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          scale: item.scale
        }));

        setAttacksData(formatted);
      } catch (error) {
        console.error('Ошибка загрузки приступов:', error);
      }
    };

    const fetchSpirometry = async () => {
      try {
        const response = await fetch(
          `${API_URL}/spirometry?patient_id=${userId}&start_date=${formatDate(startDate)}&end_date=${formatDate(now)}`
        );
        const results = await response.json();

        const formatted = results.map(item => ({
          date: new Date(item.date_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          result: item.result
        }));

        setSpirometryData(formatted);
      } catch (error) {
        console.error('Ошибка загрузки пикфлоуметрии:', error);
      }
    };

    fetchAttacks();
    fetchSpirometry();
  }, [userId, API_URL]);

  const chartContainerStyle = {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '16px 12px',
    marginBottom: 24,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  };

  return (
    <div style={{ padding: '16px 12px', maxWidth: 600, margin: '0 auto' }}>
      {/* График приступов */}
      <div style={chartContainerStyle}>
        <div style={titleStyle}>График приступов</div>
        {attacksData.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Нет данных для отображения.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attacksData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="scale" stroke="#e53935" strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* График пикфлоуметрии */}
      <div style={chartContainerStyle}>
        <div style={titleStyle}>Показания пикфлоуметрии</div>
        {spirometryData.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Нет данных для отображения.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={spirometryData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="result" stroke="#4caf50" strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ChartsPage;
