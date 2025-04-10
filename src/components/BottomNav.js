import React from 'react';
import { NavLink } from 'react-router-dom';
import { ReactComponent as IconMeasure } from '../assets/icons/measure.svg';
import { ReactComponent as IconChart } from '../assets/icons/chart.svg';
import { ReactComponent as IconUser } from '../assets/icons/user.svg';

function BottomNav() {
  const navStyle = {
    display: 'flex',
    borderTop: '1px solid #ccc',
    backgroundColor: '#fff',
    height: 60
  };

  const getLinkStyle = ({ isActive }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '12px',
    color: isActive ? '#1976d2' : '#333',
    backgroundColor: isActive ? '#e3f2fd' : '#fff',
    borderRight: '1px solid #ccc',
    height: '100%'
  });

  const iconStyle = {
    width: 24,
    height: 24,
    marginBottom: 4
  };

  return (
    <div style={navStyle}>
      <NavLink to="/" style={getLinkStyle}>
        <IconMeasure style={iconStyle} />
        <span>Показания</span>
      </NavLink>
      <NavLink to="/charts" style={getLinkStyle}>
        <IconChart style={iconStyle} />
        <span>Графики</span>
      </NavLink>
      <NavLink to="/user" style={({ isActive }) => ({
        ...getLinkStyle({ isActive }),
        borderRight: 'none'
      })}>
        <IconUser style={iconStyle} />
        <span>Профиль</span>
      </NavLink>

    </div>
  );
}

export default BottomNav;

