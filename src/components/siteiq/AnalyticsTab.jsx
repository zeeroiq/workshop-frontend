import React, { useState, useEffect } from 'react';
import { 
    BarChart,
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {MessageSquare, Users, Clock, Loader2, Calendar, BarChart3} from 'lucide-react';
import { chatbotApi } from '@/services/siteiq/chatbotApi';

const AnalyticsTab = ({ chatbotId }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState(30); // days

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!chatbotId) return;
            setLoading(true);
            try {
                // Calculate date range
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - dateRange);
                
                const fromStr = from.toISOString().split('T')[0];
                const toStr = to.toISOString().split('T')[0];
                
                const data = await chatbotApi.getAnalytics(chatbotId, fromStr, toStr);
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [chatbotId, dateRange]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-2xl h-64">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Loading analytics data...</p>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-2xl">
                Failed to load analytics data
            </div>
        );
    }

    // Format chart data
    const chartData = Object.entries(analyticsData.messagesByDate || {}).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: count
    }));

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Chats</p>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-foreground">{analyticsData.totalChats}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active sessions in range</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">User Messages</p>
                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-foreground">{analyticsData.totalMessages}</div>
                        <p className="text-xs text-muted-foreground mt-1">Queries processed</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Avg Response Time</p>
                            <Clock className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-foreground">
                            {analyticsData.averageResolutionTime ? (analyticsData.averageResolutionTime / 1000).toFixed(2) : "0.0"}s
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">AI processing latency</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-500" /> 
                            Message Volume
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                            Daily user queries over the last {dateRange} days
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-8 pb-4">
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                                    />
                                    <RechartsTooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))', 
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="messages" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorMessages)" 
                                        name="Messages"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                                <Calendar className="w-8 h-8 opacity-20" />
                                <p className="text-sm font-medium">No activity in this date range</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsTab;
