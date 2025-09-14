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
    FaCalendarAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/customers', icon: <FaUsers />, label: 'Customers' },
        { path: '/vehicles', icon: <FaCar />, label: 'Vehicles' },
        { path: '/jobs', icon: <FaWrench />, label: 'Jobs' },
        { path: '/calendar', icon: <FaCalendarAlt />, label: 'Calendar' },
        { path: '/inventory', icon: <FaBoxes />, label: 'Inventory' },
        { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
        { path: '/reports', icon: <FaChartBar />, label: 'Reports' }
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map(item => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={location.pathname === item.path ? 'active' : ''}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;