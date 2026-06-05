import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Package, 
    UserCog, 
    History, 
    X,
    Loader2,
    BarChart3,
    PieChart as PieIcon,
    Table as TableIcon
} from 'lucide-react';
import { reportsService } from '@/services/reportsService';
import { dashboardService } from '@/services/dashboardService';
import DataVisualizer from '../reports/DataVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

const DynamicWidget = ({ widget, onUnpin }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWidgetData();
    }, [widget]);

    const fetchWidgetData = async () => {
        setLoading(true);
        try {
            const config = JSON.parse(widget.configJson || '{}');
            let response;

            switch (widget.reportType) {
                case 'FINANCIAL':
                    response = await reportsService.getFinancialSummaryReport(config);
                    setData(response.data.data.revenueByServices || []);
                    break;
                case 'INVENTORY':
                    response = await reportsService.getInventoryStatusReport(config);
                    setData(response.data.data.lowStockItems || []);
                    break;
                case 'MECHANIC_PERFORMANCE':
                    response = await reportsService.getMechanicPerformanceReport(config);
                    setData(response.data.data.performances || []);
                    break;
                case 'CUSTOMER_HISTORY':
                    response = await reportsService.getCustomerHistoryReport(config);
                    setData(response.data.data.vehicles || []);
                    break;
                default:
                    console.error('Unknown report type for widget:', widget.reportType);
            }
        } catch (error) {
            console.error('Failed to fetch widget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnpin = async () => {
        try {
            await dashboardService.unpinWidget(widget.id);
            toast.success('Widget removed from dashboard');
            onUnpin?.(widget.id);
        } catch (error) {
            toast.error('Failed to remove widget');
        }
    };

    const getIcon = () => {
        switch (widget.reportType) {
            case 'FINANCIAL': return <TrendingUp className="text-emerald-500" />;
            case 'INVENTORY': return <Package className="text-amber-500" />;
            case 'MECHANIC_PERFORMANCE': return <UserCog className="text-blue-500" />;
            case 'CUSTOMER_HISTORY': return <History className="text-purple-500" />;
            default: return <BarChart3 className="text-emerald-500" />;
        }
    };

    const getViewConfig = () => {
        // These configs should ideally be shared with the main report components
        switch (widget.reportType) {
            case 'FINANCIAL':
                return {
                    table: {
                        columns: [
                            { header: 'Category', accessor: 'serviceType' },
                            { header: 'Revenue', render: (row) => `₹${row.totalRevenue?.toFixed(0)}` }
                        ]
                    },
                    pie: { dataKey: 'totalRevenue', nameKey: 'serviceType' },
                    bar: { xAxisKey: 'serviceType', bars: [{ dataKey: 'totalRevenue', name: 'Revenue' }] },
                    tooltipFormatter: (val) => `₹${val}`
                };
            case 'INVENTORY':
                return {
                    table: {
                        columns: [
                            { header: 'Part', accessor: 'partName' },
                            { header: 'Stock', accessor: 'currentStock' }
                        ]
                    },
                    bar: { xAxisKey: 'partName', bars: [{ dataKey: 'currentStock', name: 'Stock Level' }] },
                    tooltipFormatter: (val) => `${val} units`
                };
            case 'MECHANIC_PERFORMANCE':
                return {
                    table: {
                        columns: [
                            { header: 'Tech', accessor: 'mechanicName' },
                            { header: 'Jobs', accessor: 'completedJobs' }
                        ]
                    },
                    pie: { dataKey: 'completedJobs', nameKey: 'mechanicName' },
                    bar: { xAxisKey: 'mechanicName', bars: [{ dataKey: 'completedJobs', name: 'Completed' }] },
                    tooltipFormatter: (val) => `${val} jobs`
                };
            default:
                return { table: { columns: [] } };
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl group h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 p-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted/50">
                        {getIcon()}
                    </div>
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-tight">{widget.title}</CardTitle>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {widget.chartType} visualization
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleUnpin}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                >
                    <X size={14} />
                </Button>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500 opacity-20" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Synthesizing...</span>
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="h-full">
                        <DataVisualizer 
                            title={null} 
                            data={data} 
                            availableViews={[widget.chartType.toLowerCase()]} 
                            viewConfig={getViewConfig()} 
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <BarChart3 size={32} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Data</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DynamicWidget;
