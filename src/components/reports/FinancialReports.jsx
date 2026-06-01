import React, { useState, useEffect, useMemo } from 'react';
import { 
    IndianRupee, 
    TrendingUp, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    Receipt, 
    User, 
    UserCog,
    FileText,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon
} from 'lucide-react';
import { reportsService } from '@/services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import { customerService } from "@/services/customerService";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";
import ExportControls from "./ExportControls";
import DataVisualizer from "./DataVisualizer";
import TimePeriodFilter from "./TimePeriodFilter";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const FinancialReports = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.FINANCIAL,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: 'all',
        customerId: 'all',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [mechanics, setMechanics] = useState([]);

    useEffect(() => {
        loadCustomersAndMechanics();
    }, []);

    const loadCustomersAndMechanics = async () => {
        try {
            const [custRes, mechResponse] = await Promise.all([
                customerService.listAll(),
                userService.getByRole("MECHANIC")
            ]);

            if (custRes?.data?.content) {
                setCustomers(custRes.data.content);
            }
            
            if (mechResponse?.status === 200) {
                setMechanics(mechResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading report filters:', error);
            toast.error('Failed to load filter options');
        }
    }

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
                mechanicId: criteria.mechanicId !== 'all' ? parseInt(criteria.mechanicId) : undefined,
                customerId: criteria.customerId !== 'all' ? parseInt(criteria.customerId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getFinancialSummaryReport(requestBody);
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
                toast.success('Report generated successfully');
            } else {
                toast.error('No data found for the selected criteria.');
                setReportData(null);
            }
        } catch (error) {
            console.error('Error generating financial report:', error);
            toast.error('Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const revenueByCategoryConfig = {
        table: {
            columns: [
                { header: 'Service Category', accessor: 'serviceType' },
                { header: 'Count', accessor: 'serviceCount' },
                { header: 'Revenue', render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.totalRevenue?.toFixed(2)}</span> },
                { header: 'Share', render: (row, data) => {
                        const total = data.reduce((sum, item) => sum + item.totalRevenue, 0);
                        return `${((row.totalRevenue / total) * 100).toFixed(1)}%`;
                    }}
            ]
        },
        pie: { dataKey: 'totalRevenue', nameKey: 'serviceType' },
        bar: {
            xAxisKey: 'serviceType',
            bars: [{ dataKey: 'totalRevenue', name: 'Revenue (₹)' }]
        },
        tooltipFormatter: (value) => `₹${Number(value).toFixed(2)}`
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
                        <TrendingUp className="text-emerald-500 h-6 w-6" /> Financial Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">Comprehensive revenue and expense analysis</p>
                </div>
                <ExportControls getCriteria={() => ({
                    ...criteria,
                    mechanicId: criteria.mechanicId !== 'all' ? Number(criteria.mechanicId) : undefined,
                    customerId: criteria.customerId !== 'all' ? Number(criteria.customerId) : undefined,
                })} />
            </div>

            <Card className="border-border/50 bg-muted/20 shadow-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Report Engine Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="lg:col-span-1">
                        <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <User size={14} className="text-emerald-500" /> Customer
                        </Label>
                        <Select value={criteria.customerId} onValueChange={(v) => handleCriteriaChange('customerId', v)}>
                            <SelectTrigger className="bg-background border-border/50 h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Customers</SelectItem>
                                {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <UserCog size={14} className="text-emerald-500" /> Technician
                        </Label>
                        <Select value={criteria.mechanicId} onValueChange={(v) => handleCriteriaChange('mechanicId', v)}>
                            <SelectTrigger className="bg-background border-border/50 h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Technicians</SelectItem>
                                {mechanics.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.firstName} {m.lastName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 font-bold" onClick={generateReport} disabled={loading}>
                        {loading ? 'Analyzing Data...' : 'Run Analytics'}
                    </Button>
                </CardContent>
            </Card>

            {reportData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard title="Gross Revenue" value={reportData.totalRevenue} icon={<IndianRupee />} color="text-emerald-500" />
                        <MetricCard title="Total Expenses" value={reportData.totalExpenses} icon={<ArrowDownCircle />} color="text-rose-500" />
                        <MetricCard title="Net Profit" value={reportData.netProfit} icon={<ArrowUpCircle />} color="text-blue-500" />
                        <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Invoices</span>
                                <Receipt className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="flex items-end justify-between mt-4">
                                <div className="text-2xl font-black">{reportData.totalInvoices || 0}</div>
                                <div className="text-[10px] space-x-2">
                                    <span className="text-emerald-500 font-bold">{reportData.paidInvoices} PAID</span>
                                    <span className="text-rose-500 font-bold">{reportData.overdueInvoices} OVERDUE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DataVisualizer
                            title="Revenue by Category"
                            data={reportData.revenueByServices ? Object.values(reportData.revenueByServices) : []}
                            availableViews={['table', 'pie', 'bar']}
                            viewConfig={revenueByCategoryConfig}
                        />

                        {reportData.monthlyTrends && (
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="border-b border-border/50">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-500" /> Monthly Growth Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Month</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Revenue</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Profit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.monthlyTrends.map((m, i) => (
                                                <TableRow key={i} className="hover:bg-emerald-500/[0.02] border-border/40">
                                                    <TableCell className="font-bold">{m.month}</TableCell>
                                                    <TableCell className="text-emerald-600 dark:text-emerald-400 font-bold">₹{m.revenue.toFixed(0)}</TableCell>
                                                    <TableCell className={cn("font-bold", m.profit >= 0 ? "text-blue-500" : "text-rose-500")}>₹{m.profit.toFixed(0)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-muted/50 shadow-inner", color)}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-black">₹{value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</h4>
        </div>
    </div>
);

export default FinancialReports;
