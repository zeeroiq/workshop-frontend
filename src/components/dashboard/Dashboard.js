import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaUsers,
    FaCar,
    FaWrench,
    FaFileInvoiceDollar,
    FaChartLine,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaClock,
    // FaArrowUp,
    // FaArrowDown
} from 'react-icons/fa';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';
import './../../styles/Dashboard.css';
import {toast} from "react-toastify";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        customerTrend: 0,
        totalJobs: 0,
        inProgressJobs: 0,
        completedJobs: 0,
        jobTrend: 0,
        totalVehicles: 0,
        totalInventoryValue: 0,
        revenue: 0.0,
        accountsReceivable: 0,
        lowStockItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('monthly');

    useEffect(() => {
        fetchDashboardStats();
    }, [timeRange]);

    // todo: fix would be needed as there might be other jobs like completed, pending payment etc
    const getJobTrend = (response) => {
        return response.data?.data?.totalJobs
            ? ((response.data?.data.totalJobs - response.data?.data.completedJobs) / response.data?.data.totalJobs * 100).toFixed(2)
            : 5; // default to 5% if no jobs
    }

    const fetchDashboardStats = async () => {

        try {
            const response = await dashboardService.getStats(timeRange);
            if (response?.data?.success) {
                setStats({
                    ...response.data.data,
                    jobTrend: getJobTrend(response),
                });
            } else {
                toast.error('Error fetching dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your workshop today.</p>
                </div>
                <div className="time-range-selector">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-dropdown"
                    >
                        <option value="today">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="quarterly">This Quarter</option>
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={<FaUsers />}
                    color="var(--primary-color)"
                    trend={{ value: 12, isPositive: true }}
                    link="/customers"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats?.inProgressJobs || 0}
                    icon={<FaWrench />}
                    color="var(--warning-color)"
                    trend={{ value: `${stats?.jobTrend}`, isPositive: true }}
                    link="/jobs"
                />
                <StatsCard
                    title="Vehicles Serviced"
                    value={stats?.totalVehicles || 0}
                    icon={<FaCar />}
                    color="var(--success-color)"
                    trend={{ value: 8, isPositive: true }}
                    link="/vehicles"
                />
                <StatsCard
                    title="Revenue"
                    value={`₹${stats?.revenue || 0.00}`}
                    icon={<FaChartLine />}
                    color="var(--info-color)"
                    trend={{ value: 15, isPositive: true }}
                />
                <StatsCard
                    title="Pending Invoices"
                    value={stats?.pendingInvoices || 0}
                    icon={<FaFileInvoiceDollar />}
                    color="var(--danger-color)"
                    trend={{ value: 3, isPositive: false }}
                    link="/invoices"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats?.lowStockItems || 0}
                    icon={<FaExclamationTriangle />}
                    color="var(--accent-color)"
                    trend={{ value: 2, isPositive: false }}
                    link="/inventory"
                />
            </div>

            <div className="dashboard-content">
                <div className="dashboard-column">
                    <div className="card">
                        <div className="card-header">
                            <h2>Recent Activity</h2>
                            <Link to="/activity" className="view-all-link">View All</Link>
                        </div>
                        <div className="card-body">
                            <RecentActivity />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2>Upcoming Appointments</h2>
                            <Link to="/calendar" className="view-all-link">View Calendar</Link>
                        </div>
                        <div className="card-body">
                            <div className="upcoming-appointments">
                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <FaClock />
                                        <span>10:00 AM</span>
                                    </div>
                                    <div className="appointment-details">
                                        <h4>John Doe - Oil Change</h4>
                                        <p>Honda Civic 2018</p>
                                    </div>
                                    <div className="appointment-status confirmed">Confirmed</div>
                                </div>
                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <FaClock />
                                        <span>1:30 PM</span>
                                    </div>
                                    <div className="appointment-details">
                                        <h4>Jane Smith - Brake Service</h4>
                                        <p>Toyota Camry 2020</p>
                                    </div>
                                    <div className="appointment-status pending">Pending</div>
                                </div>
                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <FaClock />
                                        <span>3:45 PM</span>
                                    </div>
                                    <div className="appointment-details">
                                        <h4>Robert Johnson - Tire Rotation</h4>
                                        <p>Ford F-150 2019</p>
                                    </div>
                                    <div className="appointment-status confirmed">Confirmed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-column">
                    <div className="card">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="card-body">
                            <div className="quick-actions-grid">
                                <Link to="/customers/new" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaUsers />
                                    </div>
                                    <span>Add Customer</span>
                                </Link>
                                <Link to="/jobs/new" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaWrench />
                                    </div>
                                    <span>Create Job</span>
                                </Link>
                                <Link to="/invoices/new" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaFileInvoiceDollar />
                                    </div>
                                    <span>Create Invoice</span>
                                </Link>
                                <Link to="/inventory" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaExclamationTriangle />
                                    </div>
                                    <span>Check Inventory</span>
                                </Link>
                                <Link to="/calendar" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaCalendarAlt />
                                    </div>
                                    <span>View Calendar</span>
                                </Link>
                                <Link to="/reports" className="quick-action-btn">
                                    <div className="action-icon">
                                        <FaChartLine />
                                    </div>
                                    <span>Generate Reports</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card performance-card">
                        <div className="card-header">
                            <h2>Performance Metrics</h2>
                        </div>
                        <div className="card-body">
                            <div className="metric">
                                <div className="metric-info">
                                    <span className="metric-label">Mechanic Efficiency</span>
                                    <span className="metric-value">87%</span>
                                </div>
                                <div className="metric-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: '87%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-info">
                                    <span className="metric-label">Customer Satisfaction</span>
                                    <span className="metric-value">92%</span>
                                </div>
                                <div className="metric-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: '92%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-info">
                                    <span className="metric-label">On-Time Completion</span>
                                    <span className="metric-value">78%</span>
                                </div>
                                <div className="metric-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: '78%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;