import React from 'react';
import { NavLink } from 'react-router-dom';
import { ReactComponent as IconChart } from '../assets/icons/chart.svg';
import { ReactComponent as IconUser } from '../assets/icons/user.svg';

function DoctorBottomNav() {
    const navStyle = {
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: 60,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        borderTop: '1px solid #ccc', background: '#fff', zIndex: 1000,
    };
    const getLinkStyle = ({ isActive }) => ({
        flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: isActive ? '#1976d2' : '#333',
        borderRight: '1px solid #ccc', height: '100%',
    });
    const iconStyle = { width: 24, height: 24, marginBottom: 4 };

    return (
        <nav style={navStyle}>
            <NavLink to="/" end style={getLinkStyle}>
                <IconChart style={iconStyle} />
                <span>Графики</span>
            </NavLink>

            <NavLink
                to="/doctor/profile"
                style={({ isActive }) => ({
                    ...getLinkStyle({ isActive }),
                    borderRight: 'none',
                })}
            >
                <IconUser style={iconStyle} />
                <span>Профиль</span>
            </NavLink>
        </nav>
    );
}

export default DoctorBottomNav;
