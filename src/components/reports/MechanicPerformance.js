import React, { useState } from 'react';
import {
    FaFilter,
    FaDownload,
    FaUserCog,
    FaStar,
    FaClock,
    FaWrench,
    FaDollarSign
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import './../../styles/Reports.css';

const MechanicPerformance = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.MECHANIC,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: '',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mechanics, setMechanics] = useState([]);

    // Load mechanics (in a real app, this would come from an API)
    React.useEffect(() => {
        // Mock data - replace with API call
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
            const requestBody = {
                reportType: criteria.reportType,
                timePeriod: criteria.timePeriod,
                startDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.startDate : undefined,
                endDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.endDate : undefined,
                mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getMechanicPerformanceReport(requestBody);
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating mechanic performance report:', error);
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
            link.setAttribute('download', `mechanic-performance-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    const calculateEfficiency = (mechanic) => {
        if (!mechanic.estimatedHours || !mechanic.actualHours) return 0;
        return ((mechanic.estimatedHours / mechanic.actualHours) * 100).toFixed(1);
    };

    return (
        <div className="mechanic-performance">
            <div className="report-header">
                <h3>Mechanic Performance Report</h3>
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
                    <div className="performance-summary">
                        <h4>Performance Summary</h4>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaUserCog />
                                </div>
                                <div className="card-content">
                                    <h5>Total Mechanics</h5>
                                    <p>{reportData.totalMechanics || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaWrench />
                                </div>
                                <div className="card-content">
                                    <h5>Jobs Completed</h5>
                                    <p>{reportData.totalJobs || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaClock />
                                </div>
                                <div className="card-content">
                                    <h5>Total Hours</h5>
                                    <p>{reportData.totalHours?.toFixed(1) || '0.0'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaDollarSign />
                                </div>
                                <div className="card-content">
                                    <h5>Total Revenue</h5>
                                    <p>${reportData.totalRevenue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData.mechanics && (
                        <div className="mechanic-details">
                            <h4>Mechanic Details</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Mechanic</th>
                                    <th>Jobs Completed</th>
                                    <th>Estimated Hours</th>
                                    <th>Actual Hours</th>
                                    <th>Efficiency</th>
                                    <th>Revenue Generated</th>
                                    <th>Average Rating</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.mechanics.map((mechanic, index) => (
                                    <tr key={index}>
                                        <td>{mechanic.name}</td>
                                        <td>{mechanic.jobsCompleted}</td>
                                        <td>{mechanic.estimatedHours?.toFixed(1) || '0.0'}</td>
                                        <td>{mechanic.actualHours?.toFixed(1) || '0.0'}</td>
                                        <td className={calculateEfficiency(mechanic) >= 100 ? 'positive' : 'negative'}>
                                            {calculateEfficiency(mechanic)}%
                                        </td>
                                        <td>${mechanic.revenueGenerated?.toFixed(2) || '0.00'}</td>
                                        <td>
                                            <div className="rating">
                                                <FaStar className="star" />
                                                {mechanic.averageRating?.toFixed(1) || '0.0'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {reportData.jobsByType && (
                        <div className="jobs-by-type">
                            <h4>Jobs by Type</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Job Type</th>
                                    <th>Count</th>
                                    <th>Total Hours</th>
                                    <th>Total Revenue</th>
                                    <th>Average Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.jobsByType.map((jobType, index) => (
                                    <tr key={index}>
                                        <td>{jobType.type}</td>
                                        <td>{jobType.count}</td>
                                        <td>{jobType.totalHours?.toFixed(1) || '0.0'}</td>
                                        <td>${jobType.totalRevenue?.toFixed(2) || '0.00'}</td>
                                        <td>{jobType.averageTime?.toFixed(1) || '0.0'} hrs</td>
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

export default MechanicPerformance;