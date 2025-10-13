import React, { useState } from 'react';
import {
    FaUserCog,
    FaWrench,
    FaRupeeSign
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import './../../styles/Reports.css';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from "./TimePeriodFilter";
import {userService} from "../../services/userService";
import {toast} from "react-toastify";

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
        loadMechanics();
    }, []);

    const loadMechanics = async () => {
        try {
            const response = await userService.getByRole("MECHANIC");
            const results = response?.data || [];
            if (response?.status === 200 && results.length > 0) {
                setMechanics(results);
            } else {
                setMechanics([]);
                console.error('No Technician available in system');
            }
        } catch (error) {
            toast.error('Failed to fetch technician details');
            console.error('Error fetching technicians:', error);
        }
    }

    // Calculate summary data from the performances array
    const summary = React.useMemo(() => {
        if (!reportData || !reportData.performances) {
            return { totalMechanics: 0, totalJobs: 0, totalRevenue: 0 };
        }
        const totalJobs = reportData.performances.reduce((sum, p) => sum + p.completedJobs, 0);
        const totalRevenue = reportData.performances.reduce((sum, p) => sum + p.totalRevenue, 0);
        return {
            totalMechanics: reportData.performances.length,
            totalJobs,
            totalRevenue
        };
    }, [reportData]);

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
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
            } else {
                toast.dark('Failed to fetch technician details');
            }
        } catch (error) {
            console.error('Error generating mechanic performance report:', error);
        } finally {
            setLoading(false);
        }
    };

    const getExportCriteria = () => {
        return {
            reportType: criteria.reportType,
            timePeriod: criteria.timePeriod,
            startDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.startDate : undefined,
            endDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.endDate : undefined,
            mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
        };
    };

    const jobsByTypeConfig = {
        table: {
            columns: [
                { header: 'Job Type', accessor: 'type' },
                { header: 'Count', accessor: 'count' },
                { header: 'Total Hours', accessor: 'totalHours', render: (row) => row.totalHours?.toFixed(1) || '0.0' },
                { header: 'Total Revenue', accessor: 'totalRevenue', render: (row) => `₹${row.totalRevenue?.toFixed(2) || '0.00'}` },
                { header: 'Average Time (hrs)', accessor: 'averageTime', render: (row) => row.averageTime?.toFixed(1) || '0.0' }
            ]
        },
        pie: { dataKey: 'count', nameKey: 'type' },
        bar: { xAxisKey: 'type', bars: [{ dataKey: 'count', name: 'Job Count' }] }
    };

    return (
        <div className="mechanic-performance">
            <div className="report-header">
                <h3>Mechanic Performance Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <div className="report-filters">
                <div className="filter-row">
                    <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
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
                                    {mechanic.firstName} {mechanic.lastName}
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
                                    <p>{summary.totalMechanics || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaWrench />
                                </div>
                                <div className="card-content">
                                    <h5>Jobs Completed</h5>
                                    <p>{summary.totalJobs || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaRupeeSign />
                                </div>
                                <div className="card-content">
                                    <h5>Total Revenue</h5>
                                    <p>₹{summary.totalRevenue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData.performances && (
                        <div className="mechanic-details">
                            <h4>Mechanic Details</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Mechanic Name</th>
                                    <th>Completed Jobs</th>
                                    <th>In-Progress Jobs</th>
                                    <th>Total Revenue</th>
                                    <th>Efficiency</th>
                                    <th>Average Job Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.performances.map((mechanic, index) => (
                                    <tr key={index}>
                                        <td>{mechanic.mechanicName}</td>
                                        <td>{mechanic.completedJobs}</td>
                                        <td>{mechanic.inProgressJobs}</td>
                                        <td>₹{mechanic.totalRevenue?.toFixed(2) || '0.00'}</td>
                                        <td className={mechanic.efficiencyRating >= 100 ? 'positive' : 'negative'}>
                                            {mechanic.efficiencyRating ? `${mechanic.efficiencyRating.toFixed(1)}%` : 'N/A'}
                                        </td>
                                        <td>{mechanic.averageJobTime ? `${mechanic.averageJobTime.toFixed(1)} hrs` : 'N/A'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <DataVisualizer
                        title="Jobs by Type"
                        data={reportData.jobsByType}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={jobsByTypeConfig}
                    />
                </div>
            )}
        </div>
    );
};

export default MechanicPerformance;