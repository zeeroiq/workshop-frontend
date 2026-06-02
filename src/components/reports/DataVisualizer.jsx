import React, { useState } from 'react';
import { Table as TableIcon, ChartPie, ChartBar } from 'lucide-react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from './constants/reportsConstants';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const DataVisualizer = ({ title, data, availableViews = ['table'], viewConfig }) => {
    const [activeView, setActiveView] = useState(availableViews[0] || 'table');

    if (!data || data.length === 0) {
        return null;
    }

    const { table: tableConfig, pie: pieConfig, bar: barConfig, tooltipFormatter } = viewConfig;

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground">{title}</CardTitle>
                {availableViews.length > 1 && (
                    <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
                        <TabsList className="bg-muted/30 border-border/50 h-9 p-1">
                            {availableViews.includes('table') && (
                                <TabsTrigger value="table" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold h-7">
                                    <TableIcon size={14} className="mr-2" />Table
                                </TabsTrigger>
                            )}
                            {availableViews.includes('pie') && (
                                <TabsTrigger value="pie" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold h-7">
                                    <ChartPie size={14} className="mr-2" />Pie
                                </TabsTrigger>
                            )}
                            {availableViews.includes('bar') && (
                                <TabsTrigger value="bar" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold h-7">
                                    <ChartBar size={14} className="mr-2" />Bar
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                {activeView === 'table' && tableConfig && (
                    <div className="overflow-x-auto rounded-xl border border-border/50 shadow-inner bg-muted/10">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                    {tableConfig.columns.map(col => (
                                        <TableHead key={col.header} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground h-10">
                                            {col.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, rowIndex) => (
                                    <TableRow key={rowIndex} className="border-border/40 hover:bg-emerald-500/[0.02] transition-colors group">
                                        {tableConfig.columns.map((col, colIndex) => (
                                            <TableCell key={colIndex} className="py-3 font-medium">
                                                {col.render ? col.render(row, data) : row[col.accessor]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {activeView === 'pie' && pieConfig && (
                    <div className="h-[350px] w-full animate-in fade-in zoom-in-95 duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data} 
                                    dataKey={pieConfig.dataKey} 
                                    nameKey={pieConfig.nameKey} 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={120} 
                                    innerRadius={60}
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                            className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={tooltipFormatter} 
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeView === 'bar' && barConfig && (
                    <div className="h-[350px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <XAxis 
                                    dataKey={barConfig.xAxisKey} 
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    formatter={tooltipFormatter} 
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" />
                                {barConfig.bars.map(bar => (
                                    <Bar 
                                        key={bar.dataKey} 
                                        dataKey={bar.dataKey} 
                                        name={bar.name} 
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DataVisualizer;
