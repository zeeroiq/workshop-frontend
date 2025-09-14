import React from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = () => {
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
                        <span>Admin</span>
                    </button>
                    <div className="dropdown-menu">
                        <button>
                            <FaUserCircle /> Profile
                        </button>
                        <button>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;