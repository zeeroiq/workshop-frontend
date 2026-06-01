import React, { useState, useEffect, useMemo } from 'react';
import { 
    UserCog, 
    Wrench, 
    IndianRupee, 
    Timer, 
    Zap, 
    ShieldCheck, 
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import { reportsService } from '@/services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from "./TimePeriodFilter";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

const MechanicPerformance = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.MECHANIC,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: 'all',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mechanics, setMechanics] = useState([]);

    useEffect(() => {
        loadMechanics();
    }, []);

    const loadMechanics = async () => {
        try {
            const response = await userService.getByRole("MECHANIC");
            if (response?.status === 200) {
                setMechanics(response.data || []);
            }
        } catch (error) {
            console.error('Error loading mechanics:', error);
            toast.error('Failed to load technicians');
        }
    }

    const summary = useMemo(() => {
        if (!reportData || !reportData.performances) {
            return { totalMechanics: 0, totalJobs: 0, totalRevenue: 0 };
        }
        const totalJobs = reportData.performances.reduce((sum, p) => sum + p.completedJobs, 0);
        const totalRevenue = reportData.performances.reduce((sum, p) => sum + p.totalRevenue, 0);
        return {
            totalMechanics: reportData.performances.length,
            totalJobs,
            totalRevenue
        };
    }, [reportData]);

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
                format: criteria.format
            };

            const response = await reportsService.getMechanicPerformanceReport(requestBody);
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
                toast.success('Technician performance audit complete');
            }
        } catch (error) {
            console.error('Error generating mechanic report:', error);
            toast.error('Failed to analyze technician performance');
        } finally {
            setLoading(false);
        }
    };

    const jobsByTypeConfig = {
        table: {
            columns: [
                { header: 'Service Type', cell: (row) => <span className="font-bold uppercase text-xs">{row.type}</span> },
                { header: 'Job Count', accessor: 'count' },
                { header: 'Work Hours', render: (row) => <span className="text-muted-foreground font-mono">{row.totalHours?.toFixed(1)} hrs</span> },
                { header: 'Output Value', render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.totalRevenue?.toFixed(2)}</span> },
                { header: 'Avg. Time', render: (row) => <span className="text-xs">{row.averageTime?.toFixed(1)} hrs/job</span> }
            ]
        },
        pie: { dataKey: 'count', nameKey: 'type' },
        bar: { xAxisKey: 'type', bars: [{ dataKey: 'count', name: 'Job Volume' }] },
        tooltipFormatter: (value) => `${value} Jobs`
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
                        <Zap className="text-emerald-500 h-6 w-6" /> Workforce Analytics
                    </h3>
                    <p className="text-sm text-muted-foreground">Technician efficiency and output benchmarking</p>
                </div>
                <ExportControls getCriteria={() => ({
                    ...criteria,
                    mechanicId: criteria.mechanicId !== 'all' ? Number(criteria.mechanicId) : undefined,
                })} />
            </div>

            <Card className="border-border/50 bg-muted/20 shadow-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Resource Filter</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                    <div className="flex-1">
                        <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <UserCog size={14} className="text-emerald-500" /> Select Technician
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
                        {loading ? 'Crunching Stats...' : 'Run Efficiency Audit'}
                    </Button>
                </CardContent>
            </Card>

            {reportData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <MetricCard title="Workforce Depth" value={summary.totalMechanics} unit="Engineers" icon={<UserCog />} color="text-blue-500" />
                        <MetricCard title="Operational Output" value={summary.totalJobs} unit="Jobs" icon={<Wrench />} color="text-emerald-500" />
                        <MetricCard title="Workload Revenue" value={summary.totalRevenue} unit="₹" icon={<IndianRupee />} color="text-emerald-500" isCurrency />
                    </div>

                    {reportData.performances && (
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                                    <BarChart3 size={18} className="text-emerald-500" /> Performance Benchmarks
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Engineer</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Completed</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Revenue Output</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center w-[200px]">Efficiency Index</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Avg. Cycle</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.performances.map((m, i) => (
                                                <TableRow key={i} className="hover:bg-emerald-500/[0.02] border-border/40 group">
                                                    <TableCell className="font-bold text-foreground">{m.mechanicName}</TableCell>
                                                    <TableCell className="text-center font-black">{m.completedJobs}</TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">₹{m.totalRevenue?.toFixed(0)}</TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                                                                <span className="text-muted-foreground">Rating</span>
                                                                <span className="text-emerald-500">{m.efficiencyRating?.toFixed(1) || 0}%</span>
                                                            </div>
                                                            <Progress value={m.efficiencyRating || 0} className="h-1.5 bg-emerald-500/10" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-medium text-muted-foreground">{m.averageJobTime ? `${m.averageJobTime.toFixed(1)} hrs` : 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <DataVisualizer
                        title="Specialization Distribution"
                        data={reportData.jobsByType}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={jobsByTypeConfig}
                    />
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, unit, icon, color, isCurrency }) => (
    <div className="bg-card/50 border border-border/50 p-6 rounded-2xl flex items-center gap-5 transition-all duration-300">
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
                {!isCurrency && <span className="text-xs font-bold text-muted-foreground ml-1 uppercase">{unit}</span>}
            </div>
        </div>
    </div>
);

export default MechanicPerformance;
