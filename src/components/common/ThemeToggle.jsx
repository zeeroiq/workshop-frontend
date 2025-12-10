import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../../styles/ThemeToggle.css';

const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
    );
};

export default ThemeToggle;