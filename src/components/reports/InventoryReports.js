import React, { useState } from 'react';
import {
    FaFilter,
    FaDownload,
    FaBox,
    FaExclamationTriangle,
    FaArrowUp,
    FaArrowDown,
    FaTools
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import './../../styles/Reports.css';

const InventoryReports = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.INVENTORY_STATUS,
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
            link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
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

    return (
        <div className="inventory-reports">
            <div className="report-header">
                <h3>Inventory Status Report</h3>
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
                                    <p>${reportData.data.totalInventoryValue?.toFixed(2) || '0.00'}</p>
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
                                        <td>${item.value?.toFixed(2) || '0.00'}</td>
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

                    {reportData.data.categories && reportData.data.categories.length > 0 && (
                        <div className="categories-breakdown">
                            <h4>Inventory by Category</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Item Count</th>
                                    <th>Total Value</th>
                                    <th>Percentage of Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.data.categories.map((category, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="category-info">
                                                <FaTools className="category-icon" />
                                                {category.category}
                                            </div>
                                        </td>
                                        <td>{category.itemCount}</td>
                                        <td>${category.totalValue?.toFixed(2) || '0.00'}</td>
                                        <td>
                                            {((category.totalValue / reportData.data.totalInventoryValue) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td colSpan="1" className="total-label">Total</td>
                                    <td className="total-value">{reportData.data.totalParts}</td>
                                    <td className="total-value">${reportData.data.totalInventoryValue?.toFixed(2) || '0.00'}</td>
                                    <td className="total-value">100%</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
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