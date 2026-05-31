import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Car,
    Wrench,
    FileText,
    LineChart,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Zap,
    LayoutDashboard,
    Activity,
    Boxes
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { dashboardService } from '@/services/dashboardService';
import { authService } from '@/services/authService';
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        customerTrend: 0,
        totalJobs: 0,
        inProgressJobs: 0,
        completedJobs: 0,
        jobTrend: 0,
        totalVehicles: 0,
        totalInventoryValue: 0,
        revenue: 0.0,
        accountsReceivable: 0,
        lowStockItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('monthly');
    const user = authService.getUser();

    useEffect(() => {
        fetchDashboardStats();
    }, [timeRange]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getStats(timeRange);
            if (response?.data?.success) {
                const data = response.data.data;
                const trendValue = data.totalJobs ? ((data.totalJobs - data.completedJobs) / data.totalJobs * 100).toFixed(1) : "5.2";
                setStats({
                    ...data,
                    jobTrend: trendValue,
                });
            } else {
                toast.error('Operational metrics failure.');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto pb-12">
            {/* Intelligent Header Cluster */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Node Sync: Online</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight uppercase leading-none">Command Center</h1>
                    <p className="text-sm md:text-lg text-muted-foreground font-medium opacity-70">
                        Analyzing real-time operational flows for <span className="text-primary font-black uppercase">{user?.workshopName || 'NODE_VISHWAKARMA'}</span>.
                    </p>
                </div>
                
                <div className="w-full lg:w-auto">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="h-12 w-full lg:w-[220px] bg-card/50 border-border/50 font-black uppercase tracking-widest text-[10px] shadow-xl">
                            <SelectValue placeholder="Time Horizon" />
                        </SelectTrigger>
                        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                            <SelectItem value="today" className="font-bold uppercase tracking-widest text-[10px]">REAL_TIME (TODAY)</SelectItem>
                            <SelectItem value="weekly" className="font-bold uppercase tracking-widest text-[10px]">WEEKLY_ANALYSIS</SelectItem>
                            <SelectItem value="monthly" className="font-bold uppercase tracking-widest text-[10px]">MONTHLY_OVERVIEW</SelectItem>
                            <SelectItem value="quarterly" className="font-bold uppercase tracking-widest text-[10px]">QUARTERLY_MATRIX</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Metrics Decomposition Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatsCard
                    title="Staff Hub"
                    value={stats.totalCustomers || 0}
                    icon={<Users className="h-4 w-4" />}
                    trend={{ value: 12.4, isPositive: true }}
                    link="/customers"
                    className="border-blue-500/10 hover:border-blue-500/30 transition-all"
                />
                <StatsCard
                    title="Active Stream"
                    value={stats.inProgressJobs || 0}
                    icon={<Wrench className="h-4 w-4" />}
                    trend={{ value: stats.jobTrend, isPositive: true }}
                    link="/jobs"
                    className="border-emerald-500/10 hover:border-emerald-500/30 transition-all"
                />
                <StatsCard
                    title="Fleet Nodes"
                    value={stats.totalVehicles || 0}
                    icon={<Car className="h-4 w-4" />}
                    trend={{ value: 8.1, isPositive: true }}
                    link="/vehicles"
                    className="border-purple-500/10 hover:border-purple-500/30 transition-all"
                />
                <StatsCard
                    title="Revenue Yield"
                    value={stats.revenue ? "₹" + stats.revenue.toLocaleString() : "₹0"}
                    icon={<Zap className="h-4 w-4" />}
                    trend={{ value: 100.0, isPositive: true }}
                    className="border-amber-500/10 hover:border-amber-500/30 transition-all"
                />
                <StatsCard
                    title="Settlement Queue"
                    value={stats.pendingInvoices || 0}
                    icon={<FileText className="h-4 w-4" />}
                    trend={{ value: 3.2, isPositive: false }}
                    link="/invoices"
                    className="border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                />
                <StatsCard
                    title="Stock Critical"
                    value={stats.lowStockItems || 0}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    trend={{ value: 2.0, isPositive: false }}
                    link="/inventory"
                    className="border-red-500/10 hover:border-red-500/30 transition-all"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3 items-start">
                {/* Real-time Activity Stream */}
                <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-6 md:p-8 border-b border-border/30 bg-muted/20 gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Live Operational Pulse
                            </CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Synchronized Event Stream</p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="h-10 px-5 border-border/50 font-black uppercase tracking-widest text-[10px] rounded-xl active:scale-95 shadow-lg w-full sm:w-auto">
                            <Link to="/activity" className="flex items-center gap-2">
                                Inspect Full Log <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-6 md:p-8">
                            <RecentActivity />
                        </div>
                    </CardContent>
                </Card>

                {/* Mission Control Grid */}
                <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[2rem] overflow-hidden sticky top-24">
                    <CardHeader className="p-6 md:p-8 border-b border-border/30 bg-muted/20 text-center sm:text-left">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4 text-primary" /> Global Directives
                        </CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">High-Velocity Operations</p>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction 
                                to="/customers/new" 
                                icon={<Users className="h-5 w-5" />} 
                                label="Register Client" 
                                color="hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30"
                            />
                            <QuickAction 
                                to="/jobs/new" 
                                icon={<Wrench className="h-5 w-5" />} 
                                label="Initialize Job" 
                                color="hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                            />
                            <QuickAction 
                                to="/invoices/new" 
                                icon={<FileText className="h-5 w-5" />} 
                                label="Issue Invoice" 
                                color="hover:text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500/30"
                            />
                            <QuickAction 
                                to="/inventory" 
                                icon={<Boxes className="h-5 w-5" />} 
                                label="Audit Stock" 
                                color="hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30"
                            />
                            <QuickAction 
                                to="/calendar" 
                                icon={<Calendar className="h-5 w-5" />} 
                                label="Sync Schedule" 
                                color="hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30"
                            />
                            <QuickAction 
                                to="/reports" 
                                icon={<LineChart className="h-5 w-5" />} 
                                label="Data Matrix" 
                                color="hover:text-purple-500 hover:bg-purple-500/10 hover:border-purple-500/30"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const QuickAction = ({ to, icon, label, color }) => (
    <Button asChild variant="outline" className={cn(
        "h-24 md:h-28 flex-col gap-3 bg-background/50 border-border/50 rounded-2xl transition-all duration-300 group shadow-lg active:scale-95 overflow-hidden relative",
        color
    )}>
        <Link to={to} className="w-full h-full flex flex-col items-center justify-center">
            <div className="p-2.5 rounded-xl bg-muted group-hover:bg-transparent transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-center mt-1 leading-none">{label}</span>
            {/* Action Indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-2 w-2" />
            </div>
        </Link>
    </Button>
);

export default Dashboard;
