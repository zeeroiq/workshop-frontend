import React, { useState } from 'react';
import {
    FaUserCog,
    FaWrench,
    FaRupeeSign,
    FaFilter,
    FaTrophy,
    FaClock,
    FaPercentage
} from 'react-icons/fa';
import { reportsService } from '@/services/reportsService';
import { TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES } from './constants/reportsConstants';
import ExportControls from './ExportControls';
import DataVisualizer from './DataVisualizer';
import TimePeriodFilter from "./TimePeriodFilter";
import {userService} from "@/services/userService";
import {toast} from "react-toastify";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const MechanicPerformance = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.MECHANIC,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: '',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mechanics, setMechanics] = useState([]);

    React.useEffect(() => {
        loadMechanics();
    }, []);

    const loadMechanics = async () => {
        try {
            const response = await userService.getByRole("MECHANIC");
            const results = response?.data || [];
            if (response?.status === 200 && results.length > 0) {
                setMechanics(results);
            }
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    }

    const summary = React.useMemo(() => {
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
                mechanicId: criteria.mechanicId && criteria.mechanicId !== 'all' ? parseInt(criteria.mechanicId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getMechanicPerformanceReport(requestBody);
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
            } else {
                toast.dark('Operational data not available for criteria');
            }
        } catch (error) {
            console.error('Error generating mechanic performance report:', error);
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
            mechanicId: criteria.mechanicId ? parseInt(criteria.mechanicId) : undefined,
        };
    };

    const jobsByTypeConfig = {
        table: {
            columns: [
                { header: 'Service Classification', accessor: 'type', render: (row) => <span className="font-bold text-primary">{row.type}</span> },
                { header: 'Throughput', accessor: 'count' },
                { header: 'Total Man-Hours', accessor: 'totalHours', render: (row) => <span className="font-medium">{row.totalHours?.toFixed(1) || '0.0'} h</span> },
                { header: 'Revenue Yield', accessor: 'totalRevenue', render: (row) => <span className="font-black text-emerald-500">₹{row.totalRevenue?.toFixed(2) || '0.00'}</span> },
                { header: 'Avg Duration', accessor: 'averageTime', render: (row) => <span className="text-[10px] opacity-60 italic">{row.averageTime?.toFixed(1) || '0.0'} h / unit</span> }
            ]
        },
        pie: { dataKey: 'count', nameKey: 'type' },
        bar: { xAxisKey: 'type', bars: [{ dataKey: 'count', name: 'Job Volume' }] }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <FaTrophy className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Personnel Performance Audit</h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Efficiency & Revenue Intelligence</p>
                    </div>
                </div>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="border-border/50 bg-muted/5">
                <CardHeader className="pb-4 border-b border-border/30">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <FaFilter className="text-xs opacity-50" /> Analytical Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Time Horizon</Label>
                            <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Target Analyst (Technician)</Label>
                            <Select
                                value={criteria.mechanicId}
                                onValueChange={(value) => handleCriteriaChange('mechanicId', value)}
                            >
                                <SelectTrigger className="bg-background/50 h-11">
                                    <SelectValue placeholder="All Mechanics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Global Fleet Analysis</SelectItem>
                                    {mechanics.map(mechanic => (
                                        <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                                            {mechanic.firstName} {mechanic.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/10"
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Run Diagnostics'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reportData && (
                <div className="report-results animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <MetricCard title="Active Personnel" value={summary.totalMechanics || 0} icon={<FaUserCog />} color="text-primary" />
                        <MetricCard title="Fulfilled Missions" value={summary.totalJobs || 0} icon={<FaWrench />} color="text-amber-500" />
                        <MetricCard title="Aggregate Revenue" value={`₹${summary.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<FaRupeeSign />} color="text-emerald-500" />
                    </div>

                    {reportData.performances && (
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Individual Performance Matrix</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Desktop Table */}
                                <div className="hidden xl:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Technician Node</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Settled Jobs</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">In-Queue</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Total Yield</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Efficiency</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Avg Duration</th>
                                            </tr>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-border/30">
                                            {reportData.performances.map((mechanic, index) => (
                                                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="px-6 py-4 font-bold text-primary">{mechanic.mechanicName}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center font-black">{mechanic.completedJobs}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center font-medium opacity-60">{mechanic.inProgressJobs}</TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-black text-emerald-500">₹{mechanic.totalRevenue?.toFixed(2) || '0.00'}</TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: `${mechanic.efficiencyRating || 0}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-black">{mechanic.efficiencyRating ? `${mechanic.efficiencyRating.toFixed(1)}%` : '0%'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right text-xs font-medium">{mechanic.averageJobTime ? `${mechanic.averageJobTime.toFixed(1)} hrs` : 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Mobile Cards */}
                                <div className="xl:hidden divide-y divide-border/30">
                                    {reportData.performances.map((mechanic, index) => (
                                        <div key={index} className="p-5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-black text-primary">{mechanic.mechanicName}</p>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">Technician Profile</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <MetricItem label="Settled Jobs" value={mechanic.completedJobs} icon={<FaWrench />} />
                                                <MetricItem label="In-Queue" value={mechanic.inProgressJobs} icon={<FaClock />} />
                                                <MetricItem label="Total Yield" value={`₹${mechanic.totalRevenue?.toFixed(2)}`} icon={<FaRupeeSign />} highlight />
                                                <MetricItem label="Efficiency" value={`${mechanic.efficiencyRating?.toFixed(1) || 0}%`} icon={<FaPercentage />} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <DataVisualizer
                        title="Operational Load by Service Type"
                        data={reportData.jobsByType}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={jobsByTypeConfig}
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

const MetricItem = ({ label, value, icon, highlight }) => (
    <div className="space-y-1 bg-muted/10 p-2.5 rounded-xl border border-border/50">
        <p className="text-[8px] font-black uppercase text-muted-foreground opacity-60 flex items-center gap-1.5">
            {icon} {label}
        </p>
        <p className={cn("text-sm font-black", highlight ? "text-emerald-500" : "text-foreground")}>{value}</p>
    </div>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default MechanicPerformance;
