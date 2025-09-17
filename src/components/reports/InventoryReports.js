import React, { useState } from 'react';
import {
    FaFilter,
    FaDownload,
    FaBox,
    FaExclamationTriangle,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { reportsService } from '../../services/reportsService';
import { EXPORT_FORMATS } from './constants/reportsConstants';
import './../../styles/Reports.css';

const InventoryReports = () => {
    const [reportType, setReportType] = useState('STATUS');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        try {
            setLoading(true);
            const criteria = { reportType };
            const response = await reportsService.getInventoryStatusReport(criteria);
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
                reportType: 'INVENTORY_STATUS',
                format,
                criteria: { reportType }
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

    const getStockStatus = (quantity, minQuantity) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= minQuantity) return 'low-stock';
        return 'in-stock';
    };

    const getStockStatusText = (quantity, minQuantity) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= minQuantity) return 'Low Stock';
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
                <div className="filter-group">
                    <label>
                        <FaFilter /> Report Type
                    </label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="STATUS">Current Status</option>
                        <option value="LOW_STOCK">Low Stock Items</option>
                        <option value="MOVEMENT">Inventory Movement</option>
                    </select>
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
                    <div className="inventory-summary">
                        <h4>Inventory Summary</h4>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaBox />
                                </div>
                                <div className="card-content">
                                    <h5>Total Items</h5>
                                    <p>{reportData.totalItems || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaExclamationTriangle />
                                </div>
                                <div className="card-content">
                                    <h5>Low Stock Items</h5>
                                    <p>{reportData.lowStockItems || 0}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaArrowUp />
                                </div>
                                <div className="card-content">
                                    <h5>Total Value</h5>
                                    <p>${reportData.totalValue?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">
                                    <FaArrowDown />
                                </div>
                                <div className="card-content">
                                    <h5>Out of Stock</h5>
                                    <p>{reportData.outOfStockItems || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData.items && (
                        <div className="inventory-items">
                            <h4>Inventory Items</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Part Name</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Min Quantity</th>
                                    <th>Status</th>
                                    <th>Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.items.map((item, index) => (
                                    <tr key={index} className={getStockStatus(item.quantity, item.minQuantity)}>
                                        <td>{item.name}</td>
                                        <td>{item.sku}</td>
                                        <td>{item.category}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.minQuantity}</td>
                                        <td>
                        <span className={`status-badge ${getStockStatus(item.quantity, item.minQuantity)}`}>
                          {getStockStatusText(item.quantity, item.minQuantity)}
                        </span>
                                        </td>
                                        <td>${item.value?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {reportData.movement && (
                        <div className="inventory-movement">
                            <h4>Inventory Movement</h4>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Part Name</th>
                                    <th>Starting Quantity</th>
                                    <th>Received</th>
                                    <th>Used</th>
                                    <th>Ending Quantity</th>
                                    <th>Change</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.movement.map((movement, index) => (
                                    <tr key={index}>
                                        <td>{movement.name}</td>
                                        <td>{movement.startingQuantity}</td>
                                        <td className="positive">{movement.received}</td>
                                        <td className="negative">{movement.used}</td>
                                        <td>{movement.endingQuantity}</td>
                                        <td className={movement.change >= 0 ? 'positive' : 'negative'}>
                                            {movement.change >= 0 ? '+' : ''}{movement.change}
                                        </td>
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

export default InventoryReports;