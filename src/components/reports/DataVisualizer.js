import React, { useState } from 'react';
import { FaTable, FaChartPie, FaChartBar } from 'react-icons/fa';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from './constants/reportsConstants';
import './../../styles/Reports.css';

/**
 * A reusable component to visualize data in a table, pie chart, or bar chart.
 * @param {object} props
 * @param {string} props.title - The title of the visualization section.
 * @param {Array<object>} props.data - The array of data objects to visualize.
 * @param {Array<'table'|'pie'|'bar'>} [props.availableViews=['table']] - The views to make available.
 * @param {object} props.viewConfig - Configuration for each view type.≠≠≠
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
        <div className="data-visualizer-section">
            <div className="section-header">
                <h4>{title}</h4>
                {availableViews.length > 1 && (
                    <div className="toggle-tabs">
                        {availableViews.includes('table') && (
                            <button onClick={() => setActiveView('table')} className={activeView === 'table' ? 'active' : ''}>
                                <FaTable /> Table
                            </button>
                        )}
                        {availableViews.includes('pie') && (
                            <button onClick={() => setActiveView('pie')} className={activeView === 'pie' ? 'active' : ''}>
                                <FaChartPie /> Pie
                            </button>
                        )}
                        {availableViews.includes('bar') && (
                            <button onClick={() => setActiveView('bar')} className={activeView === 'bar' ? 'active' : ''}>
                                <FaChartBar /> Bar
                            </button>
                        )}
                    </div>
                )}
            </div>

            {activeView === 'table' && tableConfig && (
                <table className="report-table">
                    <thead>
                    <tr>
                        {tableConfig.columns.map(col => <th key={col.header}>{col.header}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {tableConfig.columns.map(col => (
                                <td key={col.accessor}>
                                    {col.render ? col.render(row, data) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {activeView === 'pie' && pieConfig && (
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
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
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
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
        </div>
    );
};

export default DataVisualizer;