import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaUsers,
    FaCar,
    FaWrench,
    FaFileInvoiceDollar,
    FaChartLine,
    FaExclamationTriangle
} from 'react-icons/fa';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';
import './../../styles/Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await dashboardService.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <StatsCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={<FaUsers />}
                    color="#4caf50"
                    link="/customers"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats?.activeJobs || 0}
                    icon={<FaWrench />}
                    color="#ff9800"
                    link="/jobs"
                />
                <StatsCard
                    title="Vehicles Serviced"
                    value={stats?.totalVehicles || 0}
                    icon={<FaCar />}
                    color="#2196f3"
                    link="/vehicles"
                />
                <StatsCard
                    title="Revenue This Month"
                    value={`$${stats?.monthlyRevenue || 0}`}
                    icon={<FaChartLine />}
                    color="#9c27b0"
                />
                <StatsCard
                    title="Pending Invoices"
                    value={stats?.pendingInvoices || 0}
                    icon={<FaFileInvoiceDollar />}
                    color="#f44336"
                    link="/invoices"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats?.lowStockItems || 0}
                    icon={<FaExclamationTriangle />}
                    color="#ff5722"
                    link="/inventory"
                />
            </div>

            <div className="dashboard-content">
                <div className="recent-activity">
                    <h2>Recent Activity</h2>
                    <RecentActivity />
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <Link to="/customers/new" className="action-btn">
                            <FaUsers />
                            <span>Add Customer</span>
                        </Link>
                        <Link to="/jobs/new" className="action-btn">
                            <FaWrench />
                            <span>Create Job</span>
                        </Link>
                        <Link to="/invoices/new" className="action-btn">
                            <FaFileInvoiceDollar />
                            <span>Create Invoice</span>
                        </Link>
                        <Link to="/inventory" className="action-btn">
                            <FaExclamationTriangle />
                            <span>Check Inventory</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;