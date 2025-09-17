import React, { useState } from 'react';
import {
    FaFilter,
    FaDownload,
    FaMoneyBillWave,
    FaChartLine,
    FaDollarSign,
    FaReceipt,
    FaClock
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { DATE_RANGES, EXPORT_FORMATS } from './constants/reportsConstants';
import './../../styles/Reports.css';

const FinancialReports = () => {
    const [dateRange, setDateRange] = useState(DATE_RANGES.THIS_MONTH);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        try {
            setLoading(true);
            const criteria = {
                dateRange,
                startDate: dateRange === DATE_RANGES.CUSTOM ? startDate : undefined,
                endDate: dateRange === DATE_RANGES.CUSTOM ? endDate : undefined
            };

            const response = await reportsService.getFinancialSummaryReport(criteria);
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
                reportType: 'FINANCIAL_SUMMARY',
                format,
                criteria: {
                    dateRange,
                    startDate: dateRange === DATE_RANGES.CUSTOM ? startDate : undefined,
                    endDate: dateRange === DATE_RANGES.CUSTOM ? endDate : undefined
                }
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
                <div className="filter-group">
                    <label>
                        <FaFilter /> Date Range
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value={<DATE_RANGES></DATE_RANGES>.TODAY}>Today</option>
                        <option value={DATE_RANGES.THIS_WEEK}>This Week</option>
                        <option value={DATE_RANGES.THIS_MONTH}>This Month</option>
                        <option value={DATE_RANGES.THIS_QUARTER}>This Quarter</option>
                        <option value={DATE_RANGES.THIS_YEAR}>This Year</option>
                        <option value={DATE_RANGES.CUSTOM}>Custom Range</option>
                    </select>
                </div>

                {dateRange === DATE_RANGES.CUSTOM && (
                    <div className="custom-date-range">
                        <div className="filter-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                )}

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