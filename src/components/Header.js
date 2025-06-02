import React from 'react';
import logo from '../assets/logo512.svg';

function Header() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #eee',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <img src={logo} alt="Логотип" style={{ width: 35, height: 35, marginRight: 10 }} />
      <span style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#333',
        fontFamily: 'entropia-light'
      }}>
      </span>
    </div>
  );
}

export default Header;
