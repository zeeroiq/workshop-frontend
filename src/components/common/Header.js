import React from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './../../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1>Workshop Management System</h1>
            </div>

            <div className="header-right">
                <button className="icon-btn">
                    <FaBell />
                    <span className="badge">3</span>
                </button>

                <div className="user-menu">
                    <button className="user-btn">
                        <FaUserCircle />
                        <span>{user?.username}</span>
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