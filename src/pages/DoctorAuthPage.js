import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

function DoctorAuthPage({ onSuccessDoctorLogin }) {
    const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';
    const [personnelNumber, setPersonnelNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(
                `${API_URL}/doctors/validate?personnel_number=${personnelNumber}&password=${password}`
            );
            const isValid = await res.json();
            if (res.ok && isValid === true) {
                onSuccessDoctorLogin({ personnelNumber });
            } else {
                setError('Табельный № или пароль неверны');
            }
        } catch {
            setError('Ошибка подключения к серверу');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: 20,
            background: 'linear-gradient(135deg, #e2ebf0 0%, #cfd9df 100%)',
            boxSizing: 'border-box',
            flexDirection: 'column'
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20
            }}>
                <img
                    src={logo}
                    alt="Логотип"
                    draggable={false}
                    style={{ width: window.innerWidth < 600 ? 150 : 200, height: 'auto', marginBottom: 10 }}
                />
            </div>

            <div style={{
                width: window.innerWidth < 600 ? '100%' : 320,
                maxWidth: 400,
                padding: 30,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: 10,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Вход для врача</h2>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Табельный №:</label>
                        <input
                            type="text"
                            value={personnelNumber}
                            onChange={(e) => setPersonnelNumber(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 10,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Пароль:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 10,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%',
                        padding: 10,
                        fontSize: 16,
                        borderRadius: 4,
                        border: '1px solid #aaa',
                        backgroundColor: '#eee',
                        cursor: 'pointer'
                    }}>
                        Войти
                    </button>
                </form>

                <hr style={{ margin: '20px 20px' }} />

                <button onClick={() => navigate('/')} style={{
                    width: '100%',
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 4,
                    border: '1px solid #aaa',
                    backgroundColor: '#eee',
                    cursor: 'pointer'
                }}>
                    ← Назад
                </button>
            </div>
        </div>
    );
}

export default DoctorAuthPage;
