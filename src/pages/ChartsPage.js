import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ChartsPage({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchAttacks = async () => {
      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

        const formatDate = (date) => date.toISOString().slice(0, 10);

        const response = await fetch(
          `${API_URL}/attacks?patient_id=${userId}&start_date=${formatDate(startDate)}&end_date=${formatDate(now)}`
        );
        const attacks = await response.json();

        const formatted = attacks.map(item => ({
          date: new Date(item.date_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          scale: item.scale
        }));

        setData(formatted);
      } catch (error) {
        console.error('Ошибка загрузки приступов:', error);
      }
    };

    fetchAttacks();
  }, [userId, API_URL]); // исправлено предупреждение ESLint

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>График приступов</h2>

      {data.length === 0 ? (
        <p>Нет данных для отображения.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip />
            <Line type="monotone" dataKey="scale" stroke="#e53935" strokeWidth={3} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ChartsPage;
