import React from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './../../styles/Header.css';

const Header = ({ onToggleSidebar, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="sidebar-toggle" onClick={onToggleSidebar}>
                    <FaBars />
                </button>
                <h1>Workshop Management</h1>
            </div>

            <div className="header-right">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                <button className="icon-btn notification-btn">
                    <FaBell />
                    <span className="badge">3</span>
                </button>

                <div className="user-menu">
                    <button className="user-btn">
                        <div className="user-avatar">
                            <FaUserCircle />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.firstName} {user?.lastName}</span>
                            <span className="user-role">{user?.roles?.[0]?.replace('ROLE_', '')}</span>
                        </div>
                    </button>
                    <div className="dropdown-menu">
                        <button>
                            <FaUserCircle /> Profile
                        </button>
                        <button onClick={handleLogout}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;