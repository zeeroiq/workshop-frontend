import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import {
    FaBox,
    FaExclamationTriangle,
    FaArrowUp,
    FaTools,
    FaFilter
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
import { Label } from '@/components/ui/label';

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
        if (currentStock === 0) return <Badge variant="destructive" className="font-black uppercase tracking-widest text-[9px]">Zero Stock</Badge>;
        if (currentStock <= minStockLevel) return <Badge variant="warning" className="font-black uppercase tracking-widest text-[9px]">Critical Low</Badge>;
        return <Badge variant="success" className="font-black uppercase tracking-widest text-[9px]">Optimal</Badge>;
    };

    const inventoryByCategoryConfig = {
        table: {
            columns: [
                { header: 'Category', accessor: 'category', render: (row) => <div className="flex items-center font-bold text-primary"><FaTools className="mr-2 text-[10px] opacity-50" />{row.category}</div> },
                { header: 'Item Count', accessor: 'itemCount' },
                { header: 'Total Value', accessor: 'totalValue', render: (row) => <span className="font-black text-emerald-500">₹{row.totalValue?.toFixed(2) || '0.00'}</span> },
                { header: 'Percentage of Total', render: (row, data) => {
                        const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
                        return <span className="text-[10px] font-bold opacity-60">{((row.totalValue / totalValue) * 100).toFixed(1)}%</span>;
                    }}
            ]
        },
        pie: { dataKey: 'totalValue', nameKey: 'category' },
        bar: { xAxisKey: 'category', bars: [{ dataKey: 'totalValue', name: 'Value' }] },
        tooltipFormatter: (value) => `₹${Number(value).toFixed(2)}`
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <FaBox className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Logistics & Stock Audit</h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Inventory Asset Management</p>
                    </div>
                </div>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="border-border/50 bg-muted/5">
                <CardHeader className="pb-4 border-b border-border/30">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <FaFilter className="text-xs opacity-50" /> Configuration Matrix
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-end gap-6">
                        <div className="flex-1 w-full space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Time Horizon</Label>
                            <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                        </div>
                        <Button
                            className="w-full sm:w-auto font-black uppercase tracking-widest text-xs h-11 px-8 shadow-lg shadow-primary/10"
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Synthesizing...' : 'Generate Analysis'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reportData && reportData.data && (
                <div className="report-results animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <MetricCard title="Total Inventory Units" value={reportData.data.totalParts || 0} icon={<FaBox />} color="text-primary" />
                        <MetricCard title="Critical Stock Alerts" value={reportData.data.lowStockParts || 0} icon={<FaExclamationTriangle />} color="text-amber-500" />
                        <MetricCard title="Aggregate Asset Value" value={`₹${reportData.data.totalInventoryValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<FaArrowUp />} color="text-emerald-500" />
                    </div>

                    {reportData.data.lowStockItems && reportData.data.lowStockItems.length > 0 && (
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                    <FaExclamationTriangle /> Depletion Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Part Node</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Serial #</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Current / Min</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Metric Value</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">System Status</th>
                                            </tr>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-border/30">
                                            {reportData.data.lowStockItems.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="px-6 py-4 font-bold">{item.partName}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center font-mono text-[10px] uppercase opacity-70 tracking-widest">{item.partNumber}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        <span className="font-black text-amber-500">{item.currentStock}</span>
                                                        <span className="mx-1 opacity-30">/</span>
                                                        <span className="text-xs font-medium opacity-60">{item.minStockLevel}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-black text-foreground">₹{item.value?.toFixed(2) || '0.00'}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        {getStockStatusBadge(item.currentStock, item.minStockLevel)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-border/30">
                                    {reportData.data.lowStockItems.map((item, index) => (
                                        <div key={index} className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm">{item.partName}</p>
                                                    <p className="text-[9px] font-black tracking-widest text-primary uppercase mt-1">{item.partNumber}</p>
                                                </div>
                                                {getStockStatusBadge(item.currentStock, item.minStockLevel)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 bg-muted/10 p-3 rounded-xl border border-border/50">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Stock Delta</p>
                                                    <p className="text-xs font-black"><span className="text-amber-500">{item.currentStock}</span> / {item.minStockLevel}</p>
                                                </div>
                                                <div className="text-right space-y-0.5">
                                                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Asset Value</p>
                                                    <p className="text-xs font-black">₹{item.value?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <DataVisualizer
                        title="Distribution by Logistics Category"
                        data={reportData.data.categories}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={inventoryByCategoryConfig}
                    />
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                {title} <span className={cn("opacity-50", color)}>{icon}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className={cn("text-2xl font-black tracking-tight", color)}>{value}</p>
        </CardContent>
        <div className={cn("absolute bottom-0 left-0 h-0.5 transition-all duration-300 w-0 group-hover:w-full", color.replace('text', 'bg'))} />
    </Card>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default InventoryReports;
