import React, { useState } from 'react';
import { FaTable, FaChartPie, FaChartBar } from 'react-icons/fa';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from './constants/reportsConstants';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


/**
 * A reusable component to visualize data in a table, pie chart, or bar chart.
 * @param {object} props
 * @param {string} props.title - The title of the visualization section.
 * @param {Array<object>} props.data - The array of data objects to visualize.
 * @param {Array<'table'|'pie'|'bar'>} [props.availableViews=['table']] - The views to make available.
 * @param {object} props.viewConfig - Configuration for each view type.
 * @param {Array<{header: string, accessor: string, render?: function}>} props.viewConfig.table.columns - Columns for the table view.
 * @param {string} props.viewConfig.pie.dataKey - The key for the pie chart's value.
 * @param {string} props.viewConfig.pie.nameKey - The key for the pie chart's name/label.
 * @param {string} props.viewConfig.bar.xAxisKey - The key for the bar chart's X-axis.
 * @param {Array<{dataKey: string, name: string}>} props.viewConfig.bar.bars - Configuration for bars in the bar chart.
 * @param {function} [props.viewConfig.tooltipFormatter] - Optional formatter for chart tooltips.
 */
const DataVisualizer = ({ title, data, availableViews = ['table'], viewConfig }) => {
    const [activeView, setActiveView] = useState(availableViews[0] || 'table');

    if (!data || data.length === 0) {
        return null;
    }

    const { table: tableConfig, pie: pieConfig, bar: barConfig, tooltipFormatter } = viewConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {availableViews.length > 1 && (
                    <Tabs value={activeView} onValueChange={setActiveView} className="mb-4">
                        <TabsList>
                            {availableViews.includes('table') && <TabsTrigger value="table"><FaTable className="mr-2" />Table</TabsTrigger>}
                            {availableViews.includes('pie') && <TabsTrigger value="pie"><FaChartPie className="mr-2" />Pie</TabsTrigger>}
                            {availableViews.includes('bar') && <TabsTrigger value="bar"><FaChartBar className="mr-2" />Bar</TabsTrigger>}
                        </TabsList>
                    </Tabs>
                )}

                {activeView === 'table' && tableConfig && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {tableConfig.columns.map(col => <TableHead key={col.header}>{col.header}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {tableConfig.columns.map(col => (
                                        <TableCell key={col.accessor}>
                                            {col.render ? col.render(row, data) : row[col.accessor]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {activeView === 'pie' && pieConfig && (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey={pieConfig.dataKey} nameKey={pieConfig.nameKey} cx="50%" cy="50%" outerRadius={100} label>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={tooltipFormatter} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeView === 'bar' && barConfig && (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey={barConfig.xAxisKey} />
                                <YAxis />
                                <Tooltip formatter={tooltipFormatter} />
                                <Legend />
                                {barConfig.bars.map(bar => (
                                    <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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