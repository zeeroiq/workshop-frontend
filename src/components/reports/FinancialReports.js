import React, { useState } from 'react';
import {
    FaFilter,
    FaDownload,
    FaMoneyBillWave,
    FaChartLine,
    FaDollarSign,
    FaReceipt,
    FaClock,
    FaUser,
    FaUserCog
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import './../../styles/Reports.css';

const FinancialReports = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.FINANCIAL,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: '',
        customerId: '',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [mechanics, setMechanics] = useState([]);

    // Load customers and mechanics (in a real app, this would come from APIs)
    React.useEffect(() => {
        // Mock data - replace with API calls
        setCustomers([
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Sarah Wilson' },
            { id: 3, name: 'Robert Davis' }
        ]);

        setMechanics([
            { id: 1, name: 'Mike Johnson' },
            { id: 2, name: 'Emily Chen' },
            { id: 3, name: 'Carlos Rodriguez' }
        ]);
    }, []);

    const handleCriteriaChange = (field, value) => {
        setCriteria(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReport = async () => {
        try {
            setLoading(true);

            // Prepare the request body
            const requestBody        = {
                reportType: criteria.reportType,
                timePeriod: criteria.timePeriod,
                startDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.startDate : undefined,
                endDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.endDate : undefined,
                mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
                customerId: criteria.customerId ? parseInt(criteria.customerId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getFinancialSummaryReport(requestBody);
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating financial report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        try {
            const exportRequest = {
                reportType: criteria.reportType,
                timePeriod: criteria.timePeriod,
                startDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.startDate : undefined,
                endDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.endDate : undefined,
                mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
                customerId: criteria.customerId ? parseInt(criteria.customerId) : undefined,
                format
            };

            const response = await reportsService.exportReport(exportRequest);

            // Create a blob from the response
            const blob = new Blob([response.data], {
                type: format === EXPORT_FORMATS.PDF ? 'application/pdf' :
                    format === EXPORT_FORMATS.EXCEL ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                        'text/csv'
            });

            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    return (
        <div className="financial-reports">
            <div className="report-header">
                <h3>Financial Summary Report</h3>
                <div className="export-buttons">
                    <button onClick={() => exportReport(EXPORT_FORMATS.PDF)}>
                        <FaDownload /> PDF
                    </button>
                    <button onClick={() => exportReport(EXPORT_FORMATS.EXCEL)}>
                        <FaDownload /> Excel
                    </button>
                    <button onClick={() => exportReport(EXPORT_FORMATS.CSV)}>
                        <FaDownload /> CSV
                    </button>
                </div>
            </div>

            <div className="report-filters">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>
                            <FaFilter /> Time Period
                        </label>
                        <select
                            value={criteria.timePeriod}
                            onChange={(e) => handleCriteriaChange('timePeriod', e.target.value)}
                        >
                            <option value={TIME_PERIODS.DAILY}>Daily</option>
                            <option value={TIME_PERIODS.WEEKLY}>Weekly</option>
                            <option value={TIME_PERIODS.MONTHLY}>Monthly</option>
                            <option value={TIME_PERIODS.QUARTERLY}>Quarterly</option>
                            <option value={TIME_PERIODS.YEARLY}>Yearly</option>
                            <option value={TIME_PERIODS.CUSTOM}>Custom Range</option>
                        </select>
                    </div>

                    {criteria.timePeriod === TIME_PERIODS.CUSTOM && (
                        <>
                            <div className="filter-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={criteria.startDate}
                                    onChange={(e) => handleCriteriaChange('startDate', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={criteria.endDate}
                                    onChange={(e) => handleCriteriaChange('endDate', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>
                            <FaUser /> Customer
                        </label>
                        <select
                            value={criteria.customerId}
                            onChange={(e) => handleCriteriaChange('customerId', e.target.value)}
                        >
                            <option value="">All Customers</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>
                            <FaUserCog /> Mechanic
                        </label>
                        <select
                            value={criteria.mechanicId}
                            onChange={(e) => handleCriteriaChange('mechanicId', e.target.value)}
                        >
                            <option value="">All Mechanics</option>
                            {mechanics.map(mechanic => (
                                <option key={mechanic.id} value={mechanic.id}>
                                    {mechanic.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    className="generate-btn"
                    onClick={generateReport}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {reportData && (
                <div className="report-results">
                    <div className="financial-summary">
                        <h4>Financial Summary</h4>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaDollarSign />
                                </div>
                                <div className="card-content">
                                    <h5>Total Revenue</h5>
                                    <p>${reportData.totalRevenue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaMoneyBillWave />
                                </div>
                                <div className="card-content">
                                    <h5>Total Expenses</h5>
                                    <p>${reportData.totalExpenses?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaChartLine />
                                </div>
                                <div className="card-content">
                                    <h5>Net Profit</h5>
                                    <p>${reportData.netProfit?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaReceipt />
                                </div>
                                <div className="card-content">
                                    <h5>Invoices Processed</h5>
                                    <p>{reportData.invoicesProcessed || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData.revenueByCategory && (
                        <div className="revenue-by-category">
                            <h4>Revenue by Category</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Service Category</th>
                                    <th>Revenue</th>
                                    <th>Percentage</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(reportData.revenueByCategory).map(([category, revenue]) => (
                                    <tr key={category}>
                                        <td>{category}</td>
                                        <td>${revenue.toFixed(2)}</td>
                                        <td>
                                            {((revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {reportData.monthlyTrends && (
                        <div className="monthly-trends">
                            <h4>Monthly Trends</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Revenue</th>
                                    <th>Expenses</th>
                                    <th>Profit</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.monthlyTrends.map((monthData, index) => (
                                    <tr key={index}>
                                        <td>{monthData.month}</td>
                                        <td>${monthData.revenue.toFixed(2)}</td>
                                        <td>${monthData.expenses.toFixed(2)}</td>
                                        <td>${monthData.profit.toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialReports;