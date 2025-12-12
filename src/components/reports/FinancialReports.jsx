import React, {useState} from 'react';
import {
    FaMoneyBillWave,
    FaChartLine,
    FaReceipt,
    FaUser,
    FaUserCog,
    FaRupeeSign
} from 'react-icons/fa';
import {reportsService} from '@/services/reportsService';
import {TIME_PERIODS, EXPORT_FORMATS, REPORT_TYPES} from './constants/reportsConstants';
import { customerService } from "@/services/customerService";
import { userService } from "@/services/userService";
import {toast} from "react-toastify";
import ExportControls from "./ExportControls";
import DataVisualizer from "./DataVisualizer";
import TimePeriodFilter from "./TimePeriodFilter";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const FinancialReports = () => {
    const [criteria, setCriteria] = useState({
        reportType: REPORT_TYPES.FINANCIAL,
        timePeriod: TIME_PERIODS.MONTHLY,
        startDate: '',
        endDate: '',
        mechanicId: '',
        customerId: '',
        format: EXPORT_FORMATS.JSON
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [mechanics, setMechanics] = useState([]);

    // Load customers and mechanics
    React.useEffect(() => {
        loadCustomersAndMechanics()
    }, []);

    const loadCustomersAndMechanics = async () => {
        try {
            const response = await customerService.listAll();
            if (response?.data?.content) {
                setCustomers(response.data.content);
            } else {
                toast.error('Failed to fetch customers - ', response?.data?.message || 'Unknown error');
            }
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        }

        try {
            const response = await userService.getByRole("MECHANIC");
            const results = response?.data || [];
            if (response?.status === 200 && results.length > 0) {
                setMechanics(results);
            } else {
                setMechanics([]);
                console.error('No Technician available in system');
            }
        } catch (error) {
            toast.error('Failed to fetch technician details');
            console.error('Error fetching technicians:', error);
        }
    }

    const handleCriteriaChange = (field, value) => {
        setCriteria(prev => ({
            ...prev,
            [field]: value
        }));
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
                customerId: criteria.customerId && criteria.customerId !== 'all' ? parseInt(criteria.customerId) : undefined,
                format: criteria.format
            };

            const response = await reportsService.getFinancialSummaryReport(requestBody);
            if (response?.status === 200 && response?.data?.success) {
                setReportData(response.data.data);
            } else {
                toast.error('No data found for the selected criteria.');
                setReportData(null);
            }
        } catch (error) {
            console.error('Error generating financial report:', error);
            alert('Failed to generate report. Please try again.');
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
            mechanicId: criteria.mechanicId ? Number.parseInt(criteria.mechanicId) : undefined,
            customerId: criteria.customerId ? Number.parseInt(criteria.customerId) : undefined,
        };
    };

    const revenueByCategoryConfig = {
        table: {
            columns: [
                { header: 'Service Category', accessor: 'serviceType' },
                { header: 'Count', accessor: 'serviceCount' },
                { header: 'Revenue', accessor: 'totalRevenue', render: (row) => `₹${row.totalRevenue?.toFixed(2)}` },
                { header: 'Percentage', render: (row, data) => {
                        const total = data.reduce((sum, item) => sum + item.totalRevenue, 0);
                        return `${((row.totalRevenue / total) * 100).toFixed(1)}%`;
                    }}
            ]
        },
        pie: { dataKey: 'totalRevenue', nameKey: 'serviceType' },
        bar: {
            xAxisKey: 'serviceType',
            bars: [{ dataKey: 'totalRevenue', name: 'Revenue' }]
        },
        tooltipFormatter: (value) => `₹${Number(value).toFixed(2)}`
    };


    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Financial Summary Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>
                                <FaUser className="inline-block mr-2" /> Customer
                            </Label>
                            <Select
                                value={criteria.customerId}
                                onValueChange={(value) => handleCriteriaChange('customerId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.firstName} {customer.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                <FaUserCog className="inline-block mr-2" /> Mechanic
                            </Label>
                            <Select
                                value={criteria.mechanicId}
                                onValueChange={(value) => handleCriteriaChange('mechanicId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Mechanic" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Mechanics</SelectItem>
                                    {mechanics.map(mechanic => (
                                        <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                                            {mechanic.firstName} {mechanic.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                </CardContent>
            </Card>

            {reportData && (
                <div className="report-results space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <FaRupeeSign className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{reportData.totalRevenue?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                        <FaMoneyBillWave className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{reportData.totalExpenses?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                        <FaChartLine className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{reportData.netProfit?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Invoices Processed</CardTitle>
                                        <FaReceipt className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Paid</TableHead>
                                                    <TableHead>Overdue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>{reportData.totalInvoices || 0}</TableCell>
                                                    <TableCell>{reportData.paidInvoices || 0}</TableCell>
                                                    <TableCell>{reportData.overdueInvoices || 0}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    <DataVisualizer
                        title="Revenue by Category"
                        data={reportData.revenueByServices ? Object.values(reportData.revenueByServices) : []}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={revenueByCategoryConfig}
                    />

                    {reportData.monthlyTrends && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Expenses</TableHead>
                                            <TableHead>Profit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.monthlyTrends.map((monthData, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{monthData.month}</TableCell>
                                                <TableCell>₹{monthData.revenue.toFixed(2)}</TableCell>
                                                <TableCell>₹{monthData.expenses.toFixed(2)}</TableCell>
                                                <TableCell>₹{monthData.profit.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialReports;