import React, { useState } from 'react';
import {
    FaBox,
    FaExclamationTriangle,
    FaArrowUp,
    FaTools
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from './TimePeriodFilter';
import './../../styles/Reports.css';

const InventoryReports = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.INVENTORY,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

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
                format: criteria.format
            };

            const response = await reportsService.getInventoryStatusReport(requestBody);
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating inventory report:', error);
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
        };
    };

    const getStockStatus = (currentStock, minStockLevel) => {
        if (currentStock === 0) return 'out-of-stock';
        if (currentStock <= minStockLevel) return 'low-stock';
        return 'in-stock';
    };

    const getStockStatusText = (currentStock, minStockLevel) => {
        if (currentStock === 0) return 'Out of Stock';
        if (currentStock <= minStockLevel) return 'Low Stock';
        return 'In Stock';
    };

    const inventoryByCategoryConfig = {
        table: {
            columns: [
                { header: 'Category', accessor: 'category', render: (row) => <div className="category-info"><FaTools className="category-icon" />{row.category}</div> },
                { header: 'Item Count', accessor: 'itemCount' },
                { header: 'Total Value', accessor: 'totalValue', render: (row) => `₹ ${row.totalValue?.toFixed(2) || '0.00'}` },
                { header: 'Percentage of Total', render: (row, data) => {
                        const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
                        return `${((row.totalValue / totalValue) * 100).toFixed(1)}%`;
                    }}
            ]
        },
        pie: { dataKey: 'totalValue', nameKey: 'category' },
        bar: { xAxisKey: 'category', bars: [{ dataKey: 'totalValue', name: 'Value' }] },
        tooltipFormatter: (value) => `₹ ${Number(value).toFixed(2)}`
    };


    return (
        <div className="inventory-reports">
            <div className="report-header">
                <h3>Inventory Status Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <div className="report-filters">
                <div className="filter-row">
                    <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                </div>

                <button
                    className="generate-btn"
                    onClick={generateReport}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {reportData && reportData.data && (
                <div className="report-results">
                    <div className="inventory-summary">
                        <h4>Inventory Summary</h4>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaBox />
                                </div>
                                <div className="card-content">
                                    <h5>Total Parts</h5>
                                    <p>{reportData.data.totalParts || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaExclamationTriangle />
                                </div>
                                <div className="card-content">
                                    <h5>Low Stock Parts</h5>
                                    <p>{reportData.data.lowStockParts || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaArrowUp />
                                </div>
                                <div className="card-content">
                                    <h5>Total Inventory Value</h5>
                                    <p>₹ {reportData.data.totalInventoryValue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData.data.lowStockItems && reportData.data.lowStockItems.length > 0 && (
                        <div className="low-stock-items">
                            <h4>Low Stock Items</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Part Name</th>
                                    <th>Part Number</th>
                                    <th>Current Stock</th>
                                    <th>Minimum Stock Level</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.data.lowStockItems.map((item, index) => (
                                    <tr key={index} className={getStockStatus(item.currentStock, item.minStockLevel)}>
                                        <td>{item.partName}</td>
                                        <td>{item.partNumber}</td>
                                        <td>{item.currentStock}</td>
                                        <td>{item.minStockLevel}</td>
                                        <td>₹ {item.value?.toFixed(2) || '0.00'}</td>
                                        <td>
                        <span className={`status-badge ${getStockStatus(item.currentStock, item.minStockLevel)}`}>
                          {getStockStatusText(item.currentStock, item.minStockLevel)}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <DataVisualizer
                        title="Inventory by Category"
                        data={reportData.data.categories}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={inventoryByCategoryConfig}
                    />

                </div>
            )}

            {reportData && !reportData.success && (
                <div className="error-message">
                    <p>{reportData.message || 'Failed to generate report'}</p>
                </div>
            )}
        </div>
    );
};

export default InventoryReports;