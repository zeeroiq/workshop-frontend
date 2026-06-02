import React, { useState, useMemo } from 'react';
import { 
    Box, 
    AlertTriangle, 
    TrendingUp, 
    Package, 
    Layers, 
    ArrowUpCircle,
    ShoppingCart
} from 'lucide-react';
import { reportsService } from '@/services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from './TimePeriodFilter';
import PinToDashboard from './PinToDashboard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

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
        setCriteria(prev => ({ ...prev, [field]: value }));
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
            if (response?.data?.success) {
                setReportData(response.data);
                toast.success('Inventory analytics ready');
            }
        } catch (error) {
            console.error('Error generating inventory report:', error);
            toast.error('Failed to run inventory analytics');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatusBadge = (currentStock, minStockLevel) => {
        if (currentStock === 0) return <Badge variant="destructive" className="font-bold uppercase text-[9px]">Out of Stock</Badge>;
        if (currentStock <= minStockLevel) return <Badge variant="warning" className="font-bold uppercase text-[9px]">Low Stock</Badge>;
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px]">In Stock</Badge>;
    };

    const inventoryByCategoryConfig = {
        table: {
            columns: [
                { header: 'Category', cell: (row) => <div className="flex items-center gap-2 font-bold uppercase text-xs"><Package size={14} className="text-emerald-500" />{row.category}</div> },
                { header: 'SKU Count', accessor: 'itemCount' },
                { header: 'Inventory Value', render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.totalValue?.toFixed(2)}</span> },
                { header: 'Weight', render: (row, data) => {
                        const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
                        return `${((row.totalValue / totalValue) * 100).toFixed(1)}%`;
                    }}
            ]
        },
        pie: { dataKey: 'totalValue', nameKey: 'category' },
        bar: { xAxisKey: 'category', bars: [{ dataKey: 'totalValue', name: 'Value (₹)' }] },
        tooltipFormatter: (value) => `₹${Number(value).toFixed(2)}`
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
                        <Layers className="text-emerald-500 h-6 w-6" /> Inventory Intelligence
                    </h3>
                    <p className="text-sm text-muted-foreground">Strategic stock and procurement analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <PinToDashboard 
                        title="Inventory Allocation" 
                        reportType="INVENTORY" 
                        chartType="BAR" 
                        config={criteria} 
                    />
                    <ExportControls getCriteria={() => criteria} />
                </div>
            </div>

            <Card className="border-border/50 bg-muted/20 shadow-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Logistics Filter</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 min-w-0 w-full">
                        <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                    </div>
                    <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 font-bold px-8" onClick={generateReport} disabled={loading}>
                        {loading ? 'Processing SKU Data...' : 'Run Inventory Audit'}
                    </Button>
                </CardContent>
            </Card>

            {reportData && reportData.data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <MetricCard title="Total Catalog Size" value={reportData.data.totalParts} unit="SKUs" icon={<Box />} color="text-blue-500" />
                        <MetricCard title="Low Stock Alerts" value={reportData.data.lowStockParts} unit="Items" icon={<AlertTriangle />} color="text-rose-500" isWarning={reportData.data.lowStockParts > 0} />
                        <MetricCard title="Assets Valuation" value={reportData.data.totalInventoryValue} unit="₹" icon={<TrendingUp />} color="text-emerald-500" isCurrency />
                    </div>

                    {reportData.data.lowStockItems && reportData.data.lowStockItems.length > 0 && (
                        <Card className="border-rose-500/20 bg-rose-500/[0.02] overflow-hidden">
                            <CardHeader className="border-b border-rose-500/10 flex flex-row items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-rose-500" />
                                <CardTitle className="text-lg font-black uppercase tracking-tight text-rose-500">Critical Stock Depletion</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-rose-500/5 hover:bg-rose-500/5">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-rose-400">Part Description</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-rose-400 text-center">In Stock</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-rose-400 text-center">Min Level</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-rose-400 text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.data.lowStockItems.map((item, index) => (
                                            <TableRow key={index} className="border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                                                <TableCell>
                                                    <div className="font-bold text-foreground">{item.partName}</div>
                                                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{item.partNumber}</div>
                                                </TableCell>
                                                <TableCell className="text-center font-black">{item.currentStock}</TableCell>
                                                <TableCell className="text-center text-muted-foreground text-xs">{item.minStockLevel}</TableCell>
                                                <TableCell className="text-right">
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
                        title="Categorical Asset Distribution"
                        data={reportData.data.categories}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={inventoryByCategoryConfig}
                    />
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, unit, icon, color, isCurrency, isWarning }) => (
    <div className={cn(
        "bg-card/50 border border-border/50 p-6 rounded-2xl flex items-center gap-5 transition-all duration-300",
        isWarning && "border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
    )}>
        <div className={cn("p-4 rounded-xl bg-muted/50 shadow-inner", color)}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
                {isCurrency && <span className="text-lg font-bold text-muted-foreground">₹</span>}
                <h4 className="text-3xl font-black tracking-tighter">
                    {typeof value === 'number' ? (isCurrency ? value.toLocaleString() : value) : '0'}
                </h4>
                {!isCurrency && <span className="text-xs font-bold text-muted-foreground ml-1">{unit}</span>}
            </div>
        </div>
    </div>
);

export default InventoryReports;
