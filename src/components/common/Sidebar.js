import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaCar,
    FaWrench,
    FaBoxes,
    FaFileInvoiceDollar,
    FaChartBar,
    FaCalendarAlt,
    FaCog,
    FaTimes
} from 'react-icons/fa';
import './../../styles/Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/customers', icon: <FaUsers />, label: 'Customers' },
        { path: '/vehicles', icon: <FaCar />, label: 'Vehicles' },
        { path: '/jobs', icon: <FaWrench />, label: 'Jobs' },
        { path: '/calendar', icon: <FaCalendarAlt />, label: 'Calendar' },
        { path: '/inventory', icon: <FaBoxes />, label: 'Inventory' },
        { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
        { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
        { path: '/settings', icon: <FaCog />, label: 'Settings' }
    ];

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Menu</h2>
                    <button className="sidebar-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={location.pathname === item.path ? 'active' : ''}
                                    onClick={onClose}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    <span className="sidebar-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <p>Workshop Management v1.0</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;