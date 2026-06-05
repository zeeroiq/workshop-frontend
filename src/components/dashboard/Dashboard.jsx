import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Car,
    Wrench,
    FileText,
    TrendingUp,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Zap,
    BarChart3,
    PieChart as PieChartIcon,
    IndianRupee,
    Clock
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import DynamicWidget from './DynamicWidget';
import { dashboardService } from '@/services/dashboardService';
import { authService } from '@/services/authService';
import { workshopService } from '@/services/workshopService';
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
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar 
} from 'recharts';
import { cn } from '@/lib/utils';
import SetupWizard from '../workshop/SetupWizard';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        inProgressJobs: 0,
        totalVehicles: 0,
        revenue: 0.0,
        pendingInvoices: 0,
        lowStockItems: 0,
        revenueTrend: [],
        jobDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('monthly');
    const [showSetup, setShowSetup] = useState(false);
    const [pinnedWidgets, setPinnedWidgets] = useState([]);
    const user = authService.getUser();

    useEffect(() => {
        fetchDashboardStats();
        checkSetupStatus();
        fetchPinnedWidgets();
    }, [timeRange]);

    const checkSetupStatus = async () => {
        try {
            const status = await workshopService.getSetupStatus();
            if (!status.isSetupComplete && user?.roles?.includes('ROLE_ADMIN')) {
                setShowSetup(true);
            }
        } catch (error) {
            console.error('Failed to check setup status:', error);
        }
    };

    const fetchPinnedWidgets = async () => {
        try {
            const response = await dashboardService.getPinnedWidgets();
            if (response.data && response.data.success) {
                setPinnedWidgets(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch pinned widgets:", error);
        }
    };

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getStats(timeRange);
            if (response?.data?.success) {
                const data = response.data.data;
                
                const mockRevenueTrend = [
                    { name: 'Mon', value: 4500 },
                    { name: 'Tue', value: 5200 },
                    { name: 'Wed', value: 4800 },
                    { name: 'Thu', value: 6100 },
                    { name: 'Fri', value: 5900 },
                    { name: 'Sat', value: 7200 },
                    { name: 'Sun', value: 6800 },
                ];

                const mockJobDist = [
                    { name: 'Completed', value: data.completedJobs || 12, color: '#10b981' },
                    { name: 'In Progress', value: data.inProgressJobs || 5, color: '#3b82f6' },
                    { name: 'Pending', value: 3, color: '#f59e0b' }
                ];

                setStats({
                    ...data,
                    revenueTrend: data.revenueTrend || mockRevenueTrend,
                    jobDistribution: data.jobDistribution || mockJobDist
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to sync real-time metrics');
        } finally {
            setLoading(false);
        }
    };

    const handleUnpin = (id) => {
        setPinnedWidgets(prev => prev.filter(w => w.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Mission Control...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl space-y-8 mx-auto pb-10">
            {showSetup && <SetupWizard onComplete={() => setShowSetup(false)} />}

            {/* Header Section */}
            <div className="flex flex-col gap-4 pb-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Operational Pulse: Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Workshop Command</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">
                        System authorized for <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user?.workshopName}</span>. Analyzing live metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-48 bg-background/50 border-border/50 text-foreground font-bold rounded-xl backdrop-blur-sm">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                            <SelectItem value="today">Real-time (Today)</SelectItem>
                            <SelectItem value="weekly">Weekly Analysis</SelectItem>
                            <SelectItem value="monthly">Monthly Overview</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Pinned Intelligent Widgets */}
            {pinnedWidgets.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-emerald-500" />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intelligent Insights</h2>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {pinnedWidgets.map(widget => (
                            <div key={widget.id} className="h-[400px]">
                                <DynamicWidget widget={widget} onUnpin={handleUnpin} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatsCard title="Customers" value={stats.totalCustomers} icon={<Users />} trend={{ value: 12, isPositive: true }} link="/customers" />
                <StatsCard title="Active Jobs" value={stats.inProgressJobs} icon={<Wrench />} trend={{ value: 5, isPositive: true }} link="/jobs" />
                <StatsCard title="Fleet Size" value={stats.totalVehicles} icon={<Car />} trend={{ value: 8, isPositive: true }} link="/vehicles" />
                <StatsCard title="Revenue" value={`₹${stats.revenue?.toLocaleString()}`} icon={<Zap />} trend={{ value: 100, isPositive: true }} />
                <StatsCard title="Invoices" value={stats.pendingInvoices} icon={<FileText />} trend={{ value: 3, isPositive: false }} link="/invoices" />
                <StatsCard title="Alerts" value={stats.lowStockItems} icon={<AlertTriangle />} trend={{ value: 2, isPositive: false }} link="/inventory" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Revenue Analytics */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 p-6">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <BarChart3 size={18} className="text-emerald-500" /> Revenue Stream
                            </CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Performance Analysis (Daily)</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
                            <TrendingUp size={12} />
                            +12.4% GROWTH
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))', 
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                        formatter={(val) => [`₹${val}`, "Revenue"]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Distribution */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-border/50 p-6">
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <PieChartIcon size={18} className="text-emerald-500" /> Job Flow
                        </CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active vs Completed Status</p>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center">
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.jobDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.jobDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))', 
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '10px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 w-full gap-3 mt-4">
                            {stats.jobDistribution.map((item) => (
                                <div key={item.name} className="flex flex-col p-2 rounded-xl bg-muted/30 border border-border/40">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black">{item.value} <span className="text-[10px] font-medium text-muted-foreground/60">units</span></span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Activity Feed */}
                <Card className="lg:col-span-2 bg-card border-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b border-border/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black text-foreground uppercase tracking-tight">Recent Activity Stream</CardTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Updates & Logged Events</p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="border-border bg-background hover:bg-accent text-muted-foreground font-bold rounded-lg text-xs">
                            <Link to="/activity" className="flex items-center gap-2">
                                FULL LOG <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <RecentActivity />
                    </CardContent>
                </Card>

                {/* Mission Control Quick Actions */}
                <Card className="bg-card border-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                    <CardHeader className="p-6 border-b border-border/50">
                        <CardTitle className="text-lg font-black text-foreground uppercase tracking-tight">Mission Control</CardTitle>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accelerated Operational Tasks</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2">
                            <QuickAction to="/customers/new" icon={<Users />} label="Add Customer" color="hover:text-blue-500 hover:border-blue-500/30" />
                            <QuickAction to="/jobs/new" icon={<Wrench />} label="Create Job" color="hover:text-emerald-500 hover:border-emerald-500/30" />
                            <QuickAction to="/invoices/new" icon={<FileText />} label="Create Invoice" color="hover:text-purple-500 hover:border-purple-500/30" />
                            <QuickAction to="/inventory" icon={<AlertTriangle />} label="Check Stock" color="hover:text-amber-500 hover:border-amber-500/30" />
                            <QuickAction to="/calendar" icon={<Calendar />} label="Calendar" color="hover:text-rose-500 hover:border-rose-500/30" />
                            <QuickAction to="/reports" icon={<BarChart3 />} label="Analytics" color="hover:text-cyan-500 hover:border-cyan-500/30" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const QuickAction = ({ to, icon, label, color }) => (
    <Link
        to={to}
        className={cn(
            "group flex min-h-24 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-3 py-4 text-center text-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-muted/30 shadow-sm",
            color
        )}
    >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-background group-hover:shadow-inner transition-all">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className="w-full text-[9px] font-black uppercase tracking-widest leading-tight">
            {label}
        </span>
    </Link>
);

export default Dashboard;
