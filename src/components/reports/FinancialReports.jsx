import { cn } from '@/lib/utils';
import React, {useState} from 'react';
import {
    FaMoneyBillWave,
    FaChartLine,
    FaReceipt,
    FaUser,
    FaUserCog,
    FaRupeeSign,
    FaFilter,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import {reportsService} from '@/services/reportsService';
import {TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES} from './constants/reportsConstants';
import { customerService } from "@/services/customerService";
import { userService } from "@/services/userService";
import {toast} from "react-toastify";
import ExportControls from "./ExportControls";
import DataVisualizer from "./DataVisualizer";
import TimePeriodFilter from "./TimePeriodFilter";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


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
                mechanicId: criteria.mechanicId && criteria.mechanicId !== 'all' ? parseInt(criteria.mechanicId) : undefined,
                customerId: criteria.customerId && criteria.customerId !== 'all' ? parseInt(criteria.customerId) : undefined,
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
                { header: 'Revenue', accessor: 'totalRevenue', render: (row) => `₹${row.totalRevenue?.toFixed(2)}` },
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
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <FaMoneyBillWave className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Financial Summary</h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Revenue & Profit Analysis</p>
                    </div>
                </div>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="border-border/50 bg-muted/5">
                <CardHeader className="pb-4 border-b border-border/30">
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <FaFilter className="text-xs opacity-50" /> Intelligence Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest opacity-70">Time Horizon</Label>
                            <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest opacity-70">Client Profile</Label>
                            <Select
                                value={criteria.customerId}
                                onValueChange={(value) => handleCriteriaChange('customerId', value)}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="All Customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.firstName} {customer.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest opacity-70">Tech Analyst</Label>
                            <Select
                                value={criteria.mechanicId}
                                onValueChange={(value) => handleCriteriaChange('mechanicId', value)}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="All Mechanics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Mechanics</SelectItem>
                                    {mechanics.map(mechanic => (
                                        <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                                            {mechanic.firstName} {mechanic.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full font-black uppercase tracking-widest text-xs h-10 shadow-lg shadow-primary/20"
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Synthesizing...' : 'Generate Analysis'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reportData ? (
                <div className="report-results animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricSummaryCard 
                            title="Gross Revenue" 
                            value={`₹${reportData.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            icon={<FaRupeeSign />}
                            color="text-emerald-500"
                        />
                        <MetricSummaryCard 
                            title="Operational Expenses" 
                            value={`₹${reportData.totalExpenses?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            icon={<FaMoneyBillWave />}
                            color="text-red-400"
                        />
                        <MetricSummaryCard 
                            title="Net Liquidity" 
                            value={`₹${reportData.netProfit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            icon={<FaChartLine />}
                            color="text-cyan-400"
                        />
                        <Card className="bg-card border-border/50 shadow-sm">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    Volume Activity <FaReceipt className="opacity-50" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-end justify-between gap-2 mt-2">
                                    <div className="space-y-0.5">
                                        <p className="text-2xl font-black">{reportData.totalInvoices || 0}</p>
                                        <p className="text-[8px] font-bold uppercase opacity-50">Total Units</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-500">{reportData.paidInvoices || 0}</p>
                                            <p className="text-[7px] font-bold uppercase opacity-50 tracking-tighter">Settled</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-amber-500">{reportData.overdueInvoices || 0}</p>
                                            <p className="text-[7px] font-bold uppercase opacity-50 tracking-tighter">At Risk</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <DataVisualizer
                            title="Revenue Distribution"
                            data={reportData.revenueByServices ? Object.values(reportData.revenueByServices) : []}
                            availableViews={['pie', 'bar', 'table']}
                            viewConfig={revenueByCategoryConfig}
                        />

                        {reportData.monthlyTrends && (
                            <Card className="border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border/30">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                        <FaChartLine className="text-xs opacity-50" /> Temporal Progression
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest">Time Period</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Revenue</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Profit</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData.monthlyTrends.map((monthData, index) => (
                                                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="text-xs font-bold">{monthData.month}</TableCell>
                                                        <TableCell className="text-xs text-right font-medium">₹{monthData.revenue.toLocaleString()}</TableCell>
                                                        <TableCell className="text-xs text-right font-black text-emerald-500">₹{monthData.profit.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                    <FaFileInvoiceDollar className="text-5xl text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-bold text-muted-foreground/60 uppercase tracking-widest">Awaiting Analysis Parameters</h3>
                    <p className="text-sm text-muted-foreground/40 mt-1">Configure filters above to synthesize financial datasets.</p>
                </div>
            )}
        </div>
    );
};

const MetricSummaryCard = ({ title, value, icon, color }) => (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden group">
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                {title} <span className={cn("opacity-50", color)}>{icon}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className={cn("text-2xl font-black tracking-tight", color)}>{value}</p>
        </CardContent>
        <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-300 w-0 group-hover:w-full", color.replace('text', 'bg'))} />
    </Card>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default FinancialReports;
