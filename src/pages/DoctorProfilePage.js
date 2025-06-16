import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

function DoctorProfilePage({ personnelNumber, onLogout }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'https://астматрекер.рф/api';

    useEffect(() => {
        if (!personnelNumber) return;
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${API_URL}/doctors/doctor?personnel_number=${personnelNumber}`);
                if (!res.ok) throw new Error('Ошибка при получении профиля врача');
                const data = await res.json();
                setDoctor(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [personnelNumber, API_URL]);

    const getInitials = () => {
        if (!doctor) return '';
        const name = doctor.name || '';
        const surname = doctor.surname || '';
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    return (
        <>
            <Header />
            <div style={{ padding: '24px 16px 120px', maxWidth: 600, margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 90, height: 90, borderRadius: '50%', background: '#ddd',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 600, color: '#444', marginBottom: 12
                    }}>{getInitials()}</div>
                    <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Профиль врача</h2>
                </div>

                {loading && <p>Загрузка…</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {doctor && (
                    <div style={{
                        background: '#f6f6f6', borderRadius: 12, padding: 20,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                        <Info label="👤 ФИО" value={`${doctor.surname} ${doctor.name}`} />
                        <Info label="💳 Табельный №" value={doctor.personnel_number} />
                    </div>
                )}

                {/* logout button */}
                <div style={{
                    position: 'fixed',
                    bottom: 70,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '0 16px',
                    boxSizing: 'border-box',
                }}>
                    <button
                        onClick={onLogout}
                        style={{
                            maxWidth: 400,
                            width: '100%',
                            padding: '14px 0',
                            fontSize: 16,
                            fontWeight: 600,
                            borderRadius: 12,
                            backgroundColor: '#e53935',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                    >Выйти</button>
                </div>
            </div>
        </>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 500 }}>{value}</div>
        </div>
    );
}

export default DoctorProfilePage;
