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
    Zap
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
                toast.error('Error fetching dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Systems Online</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Workshop Control Center</h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                        Welcome back, <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user?.workshopName}</span>. Analyzing live operational metrics.
                    </p>
                </div>
                <div className="flex items-center w-full md:w-auto gap-3">
                    <div className="relative group w-full md:w-auto">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-full md:w-[180px] bg-background border-border text-foreground font-bold rounded-xl focus:ring-emerald-500/20 transition-all">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="today">Real-time (Today)</SelectItem>
                                <SelectItem value="weekly">Weekly Analysis</SelectItem>
                                <SelectItem value="monthly">Monthly Overview</SelectItem>
                                <SelectItem value="quarterly">Quarterly Report</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatsCard
                    title="Total Customers"
                    value={stats.totalCustomers || 0}
                    icon={<Users className="h-4 w-4" />}
                    trend={{ value: 12.4, isPositive: true }}
                    link="/customers"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats.inProgressJobs || 0}
                    icon={<Wrench className="h-4 w-4" />}
                    trend={{ value: stats.jobTrend, isPositive: true }}
                    link="/jobs"
                />
                <StatsCard
                    title="Fleet Serviced"
                    value={stats.totalVehicles || 0}
                    icon={<Car className="h-4 w-4" />}
                    trend={{ value: 8.1, isPositive: true }}
                    link="/vehicles"
                />
                <StatsCard
                    title="Revenue"
                    value={stats.revenue ? "₹" + stats.revenue.toLocaleString() : "₹0"}
                    icon={<Zap className="h-4 w-4" />}
                    trend={{ value: 100.0, isPositive: true }}
                />
                <StatsCard
                    title="Pending Invoices"
                    value={stats.pendingInvoices || 0}
                    icon={<FileText className="h-4 w-4" />}
                    trend={{ value: 3.2, isPositive: false }}
                    link="/invoices"
                />
                <StatsCard
                    title="Low Stock"
                    value={stats.lowStockItems || 0}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    trend={{ value: 2.0, isPositive: false }}
                    link="/inventory"
                />
            </div>

            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
                {/* Activity Feed */}
                <Card className="lg:col-span-2 bg-card border-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 border-b border-border/50">
                        <div className="space-y-1">
                            <CardTitle className="text-base md:text-lg font-black text-foreground uppercase tracking-tight">Recent Activity Stream</CardTitle>
                            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Updates & Logged Events</p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="border-border bg-background hover:bg-accent text-muted-foreground font-bold rounded-lg text-[10px] md:text-xs px-2 md:px-3">
                            <Link to="/activity" className="flex items-center gap-2">
                                FULL LOG <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <RecentActivity />
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-card border-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                    <CardHeader className="p-4 md:p-6 border-b border-border/50">
                        <CardTitle className="text-base md:text-lg font-black text-foreground uppercase tracking-tight">Mission Control</CardTitle>
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Accelerated Operational Tasks</p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-4">
                        <QuickAction 
                            to="/customers/new" 
                            icon={<Users className="h-5 w-5" />} 
                            label="Add Customer" 
                            color="hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30"
                        />
                        <QuickAction 
                            to="/jobs/new" 
                            icon={<Wrench className="h-5 w-5" />} 
                            label="Create Job" 
                            color="hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30"
                        />
                        <QuickAction 
                            to="/invoices/new" 
                            icon={<FileText className="h-5 w-5" />} 
                            label="Create Invoice" 
                            color="hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/30"
                        />
                        <QuickAction 
                            to="/inventory" 
                            icon={<AlertTriangle className="h-5 w-5" />} 
                            label="Check Stock" 
                            color="hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30"
                        />
                        <QuickAction 
                            to="/calendar" 
                            icon={<Calendar className="h-5 w-5" />} 
                            label="Calendar" 
                            color="hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30"
                        />
                        <QuickAction 
                            to="/reports" 
                            icon={<LineChart className="h-5 w-5" />} 
                            label="Analytics" 
                            color="hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const QuickAction = ({ to, icon, label, color }) => (
    <Button asChild variant="outline" className="h-20 md:h-24 flex-col gap-2 md:gap-3 bg-background border-border rounded-xl transition-all duration-300 hover:bg-accent hover:-translate-y-1 group hover:text-inherit" style={{ color: "inherit" }}>
        <Link to={to} className={color}>
            <div className="p-1.5 md:p-2 rounded-lg bg-muted group-hover:bg-transparent transition-colors">
                {icon}
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
        </Link>
    </Button>
);

export default Dashboard;
