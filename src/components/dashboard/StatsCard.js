import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, icon, color, trend, link }) => {
    const cardContent = (
        <div className="stats-card" style={{ borderLeftColor: color }}>
            <div className="stats-content">
                <div className="stats-icon" style={{ color }}>
                    {icon}
                </div>
                <div className="stats-info">
                    <h3>{title}</h3>
                    <p>{value}</p>
                </div>
            </div>
            {trend && (
                <div className={`stats-trend ${trend.isPositive ? 'trend-positive' : 'trend-negative'}`}>
                    {trend.isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    <span>{trend.value}%</span>
                </div>
            )}
        </div>
    );

    if (link) {
        return <Link to={link} style={{ textDecoration: 'none' }}>{cardContent}</Link>;
    }

    return cardContent;
};

export default StatsCard;