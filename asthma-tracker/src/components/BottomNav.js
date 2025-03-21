import React from 'react';
import { NavLink } from 'react-router-dom';

function BottomNav() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #ccc',
    padding: '10px 0'
  };

  const linkStyle = {
    textDecoration: 'none',
    fontSize: '14px'
  };

  return (
    <div style={navStyle}>
      <NavLink to="/" style={linkStyle}>
        {/* Иконка можно вставить через <img src="..." alt="..."/> или через Material Icons */}
        <div>Передать показания</div>
      </NavLink>
      <NavLink to="/charts" style={linkStyle}>
        <div>Графики</div>
      </NavLink>
      <NavLink to="/user" style={linkStyle}>
        <div>Пользователь</div>
      </NavLink>
    </div>
  );
}

export default BottomNav;
