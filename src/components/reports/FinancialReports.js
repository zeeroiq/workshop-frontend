import React, {useState} from 'react';
import {
    FaMoneyBillWave,
    FaChartLine,
    FaReceipt,
    FaUser,
    FaUserCog,
    FaRupeeSign
} from 'react-icons/fa';
import {reportsService} from '../../services/reportsService';
import {TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES} from './constants/reportsConstants';
import './../../styles/Reports.css';
import { customerService } from "../../services/customerService";
import { userService } from "../../services/userService";
import {toast} from "react-toastify";
import ExportControls from "./ExportControls";
import DataVisualizer from "./DataVisualizer";
import TimePeriodFilter from "./TimePeriodFilter";

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

    // Load customers and mechanics
    React.useEffect(() => {
        loadCustomersAndMechanics()
    }, []);

    const loadCustomersAndMechanics = async () => {
        try {
            const response = await customerService.listAll();
            if (response?.data?.content) {
                setCustomers(response.data.content);
            } else {
                toast.error('Failed to fetch customers - ', response?.data?.message || 'Unknown error');
            }
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        }

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

    const handleCriteriaChange = (field, value) => {
        setCriteria(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReport = async () => {
        try {
            setLoading(true);

            const requestBody = {
                reportType: criteria.reportType,
                timePeriod: criteria.timePeriod,
                startDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.startDate : undefined,
                endDate: criteria.timePeriod === TIME_PERIODS.CUSTOM ? criteria.endDate : undefined,
                mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
                customerId: criteria.customerId ? parseInt(criteria.customerId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getFinancialSummaryReport(requestBody);
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
            } else {
                toast.error('No data found for the selected criteria.');
                setReportData(null);
            }
        } catch (error) {
            console.error('Error generating financial report:', error);
            alert('Failed to generate report. Please try again.');
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
            mechanicId: criteria.mechanicId ? Number.parseInt(criteria.mechanicId) : undefined,
            customerId: criteria.customerId ? Number.parseInt(criteria.customerId) : undefined,
        };
    };

    const revenueByCategoryConfig = {
        table: {
            columns: [
                { header: 'Service Category', accessor: 'serviceType' },
                { header: 'Count', accessor: 'serviceCount' },
                { header: 'Revenue', accessor: 'totalRevenue', render: (row) => `₹${row.totalRevenue.toFixed(2)}` },
                { header: 'Percentage', render: (row, data) => {
                        const total = data.reduce((sum, item) => sum + item.totalRevenue, 0);
                        return `${((row.totalRevenue / total) * 100).toFixed(1)}%`;
                    }}
            ]
        },
        pie: { dataKey: 'totalRevenue', nameKey: 'serviceType' },
        bar: {
            xAxisKey: 'serviceType',
            bars: [{ dataKey: 'totalRevenue', name: 'Revenue' }]
        },
        tooltipFormatter: (value) => `₹${Number(value).toFixed(2)}`
    };


    return (
        <div className="financial-reports">
            <div className="report-header">
                <h3>Financial Summary Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <div className="report-filters">
                <div className="filter-row">
                    <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>
                            <FaUser/> Customer
                        </label>
                        <select
                            value={criteria.customerId}
                            onChange={(e) => handleCriteriaChange('customerId', e.target.value)}
                        >
                            <option value="">All Customers</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>
                            <FaUserCog/> Mechanic
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
                    <div className="financial-summary">
                        <h4>Financial Summary</h4>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaRupeeSign/>
                                </div>
                                <div className="card-content">
                                    <h5>Total Revenue</h5>
                                    <p>₹{reportData.totalRevenue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaMoneyBillWave/>
                                </div>
                                <div className="card-content">
                                    <h5>Total Expenses</h5>
                                    <p>₹{reportData.totalExpenses?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaChartLine/>
                                </div>
                                <div className="card-content">
                                    <h5>Net Profit</h5>
                                    <p>₹{reportData.netProfit?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaReceipt/>
                                </div>
                                <div className="card-content">
                                    <h5>Invoices Processed</h5>
                                    <table className="report-table">
                                        <thead>
                                        <tr>
                                            <th>Total</th>
                                            <th>Paid</th>
                                            <th>Overdue</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{reportData.totalInvoices || 0}</td>
                                            <td>{reportData.paidInvoices || 0}</td>
                                            <td>{reportData.overdueInvoices || 0}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    {/*<p>{reportData.totalInvoices || 0}</p>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*{reportData.revenueByCategory && (*/}
                    <DataVisualizer
                        title="Revenue by Category"
                        data={reportData.revenueByServices ? Object.values(reportData.revenueByServices) : []}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={revenueByCategoryConfig}
                    />

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
                                        <td>₹{monthData.revenue.toFixed(2)}</td>
                                        <td>₹{monthData.expenses.toFixed(2)}</td>
                                        <td>₹{monthData.profit.toFixed(2)}</td>
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