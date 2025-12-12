import React, { useState } from 'react';
import {
    FaBox,
    FaExclamationTriangle,
    FaArrowUp,
    FaTools
} from 'react-icons/fa';
import { reportsService } from '@/services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from './TimePeriodFilter';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


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

    const getStockStatusBadge = (currentStock, minStockLevel) => {
        let variant;
        let text;
        if (currentStock === 0) {
            variant = 'destructive';
            text = 'Out of Stock';
        } else if (currentStock <= minStockLevel) {
            variant = 'warning'; // Assuming a warning variant exists or can be defined
            text = 'Low Stock';
        } else {
            variant = 'success'; // Assuming a success variant exists
            text = 'In Stock';
        }
        return <Badge variant={variant}>{text}</Badge>;
    };


    const inventoryByCategoryConfig = {
        table: {
            columns: [
                { header: 'Category', accessor: 'category', render: (row) => <div className="flex items-center"><FaTools className="mr-2" />{row.category}</div> },
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
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Inventory Status Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[180px]">
                        <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                    </div>

                    <Button
                        className="w-full md:w-auto flex-shrink-0"
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                </CardContent>
            </Card>

            {reportData && reportData.data && (
                <div className="report-results space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
                                        <FaBox className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{reportData.data.totalParts || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Low Stock Parts</CardTitle>
                                        <FaExclamationTriangle className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{reportData.data.lowStockParts || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                                        <FaArrowUp className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹ {reportData.data.totalInventoryValue?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {reportData.data.lowStockItems && reportData.data.lowStockItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Low Stock Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Part Name</TableHead>
                                            <TableHead>Part Number</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Minimum Stock Level</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.data.lowStockItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.partName}</TableCell>
                                                <TableCell>{item.partNumber}</TableCell>
                                                <TableCell>{item.currentStock}</TableCell>
                                                <TableCell>{item.minStockLevel}</TableCell>
                                                <TableCell>₹ {item.value?.toFixed(2) || '0.00'}</TableCell>
                                                <TableCell>
                                                    {getStockStatusBadge(item.currentStock, item.minStockLevel)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
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
                <div className="text-red-500 p-4">
                    <p>{reportData.message || 'Failed to generate report'}</p>
                </div>
            )}
        </div>
    );
};

export default InventoryReports;