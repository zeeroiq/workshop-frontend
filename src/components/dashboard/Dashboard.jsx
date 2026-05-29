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
    Clock
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

    const getJobTrend = (response) => {
        return response.data?.data?.totalJobs
            ? ((response.data?.data.totalJobs - response.data?.data.completedJobs) / response.data?.data.totalJobs * 100).toFixed(2)
            : 5; // default to 5% if no jobs
    }

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getStats(timeRange);
            if (response?.data?.success) {
                setStats({
                    ...response.data.data,
                    jobTrend: getJobTrend(response),
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
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome to <span className="text-primary font-semibold">{user?.workshopName}</span>. 
                        Here's your operational overview.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="weekly">This Week</SelectItem>
                            <SelectItem value="monthly">This Month</SelectItem>
                            <SelectItem value="quarterly">This Quarter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                <StatsCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={<Users className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: 12, isPositive: true }}
                    link="/customers"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats?.inProgressJobs || 0}
                    icon={<Wrench className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: stats?.jobTrend, isPositive: true }}
                    link="/jobs"
                />
                <StatsCard
                    title="Vehicles Serviced"
                    value={stats?.totalVehicles || 0}
                    icon={<Car className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: 8, isPositive: true }}
                    link="/vehicles"
                />
                <StatsCard
                    title="Revenue"
                    value={`₹${stats?.revenue || 0.00}`}
                    icon={<LineChart className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: 15, isPositive: true }}
                />
                <StatsCard
                    title="Pending Invoices"
                    value={stats?.pendingInvoices || 0}
                    icon={<FileText className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: 3, isPositive: false }}
                    link="/invoices"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats?.lowStockItems || 0}
                    icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
                    trend={{ value: 2, isPositive: false }}
                    link="/inventory"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Recent Activity</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/activity" className="text-xs font-medium">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/customers/new">
                                <Users className="h-5 w-5" />
                                <span className="text-xs">Add Customer</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/jobs/new">
                                <Wrench className="h-5 w-5" />
                                <span className="text-xs">Create Job</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/invoices/new">
                                <FileText className="h-5 w-5" />
                                <span className="text-xs">Create Invoice</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/inventory">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-xs">Check Inventory</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/calendar">
                                <Calendar className="h-5 w-5" />
                                <span className="text-xs">Calendar</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link to="/reports">
                                <LineChart className="h-5 w-5" />
                                <span className="text-xs">Reports</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
