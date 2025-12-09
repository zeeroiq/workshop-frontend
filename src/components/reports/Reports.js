import React, { useState } from 'react';
import FinancialReports from './FinancialReports';
import InventoryReports from './InventoryReports';
import MechanicPerformance from './MechanicPerformance';
import { FaChartLine, FaChartBar, FaChartPie, FaUserCog } from 'react-icons/fa';
import '../../styles/Reports.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('financial');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'financial':
                return <FinancialReports />;
            case 'inventory':
                return <InventoryReports />;
            case 'mechanic':
                return <MechanicPerformance />;
            default:
                return <FinancialReports />;
        }
    };

    return (
        <div className="reports-module">
            <div className="module-header">
                <FaChartLine className="module-icon" />
                <h2>Reports & Analytics</h2>
            </div>

            <div className="reports-tabs">
                <button
                    className={activeTab === 'financial' ? 'active' : ''}
                    onClick={() => setActiveTab('financial')}
                >
                    <FaChartBar /> Financial Reports
                </button>
                <button
                    className={activeTab === 'inventory' ? 'active' : ''}
                    onClick={() => setActiveTab('inventory')}
                >
                    <FaChartPie /> Inventory Reports
                </button>
                <button
                    className={activeTab === 'mechanic' ? 'active' : ''}
                    onClick={() => setActiveTab('mechanic')}
                >
                    <FaUserCog /> Mechanic Performance
                </button>
            </div>

            <div className="reports-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Reports;