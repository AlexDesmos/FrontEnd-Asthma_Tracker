import React from 'react';
import { NavLink } from 'react-router-dom';
import { ReactComponent as IconMeasure } from '../assets/icons/measure.svg';
import { ReactComponent as IconChart } from '../assets/icons/chart.svg';
import { ReactComponent as IconUser } from '../assets/icons/user.svg';

function BottomNav() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #ccc',
    padding: '10px 0',
    backgroundColor: '#fff'
  };

  const linkStyle = {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '12px',
    color: '#333'
  };

  const iconStyle = {
    width: 24,
    height: 24,
    marginBottom: 4
  };

  return (
    <div style={navStyle}>
      <NavLink to="/" style={linkStyle}>
        <IconMeasure style={iconStyle} />
        <span>Показания</span>
      </NavLink>
      <NavLink to="/charts" style={linkStyle}>
        <IconChart style={iconStyle} />
        <span>Графики</span>
      </NavLink>
      <NavLink to="/user" style={linkStyle}>
        <IconUser style={iconStyle} />
        <span>Профиль</span>
      </NavLink>
    </div>
  );
}

export default BottomNav;
