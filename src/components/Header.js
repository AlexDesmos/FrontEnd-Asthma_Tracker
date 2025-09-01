import React from 'react';
import logo from '../assets/logo512.svg';

function Header({ onLogout }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #eee',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Логотип" style={{ width: 35, height: 35, marginRight: 10 }} />
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            padding: '8px 14px',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          Выйти
        </button>
      )}
    </div>
  );
}

export default Header;
