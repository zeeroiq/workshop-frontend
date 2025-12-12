import React, { useState } from 'react';
import {
    FaUserCog,
    FaWrench,
    FaRupeeSign
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

    // Load mechanics (in a real app, this would come from an API)
    React.useEffect(() => {
        loadMechanics();
    }, []);

    const loadMechanics = async () => {
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

    // Calculate summary data from the performances array
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
        setCriteria(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReport = async () => {
        try {
            setLoading(true);

            // Prepare the request body
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
                toast.dark('Failed to fetch technician details');
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
                { header: 'Job Type', accessor: 'type' },
                { header: 'Count', accessor: 'count' },
                { header: 'Total Hours', accessor: 'totalHours', render: (row) => row.totalHours?.toFixed(1) || '0.0' },
                { header: 'Total Revenue', accessor: 'totalRevenue', render: (row) => `₹${row.totalRevenue?.toFixed(2) || '0.00'}` },
                { header: 'Average Time (hrs)', accessor: 'averageTime', render: (row) => row.averageTime?.toFixed(1) || '0.0' }
            ]
        },
        pie: { dataKey: 'count', nameKey: 'type' },
        bar: { xAxisKey: 'type', bars: [{ dataKey: 'count', name: 'Job Count' }] }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Mechanic Performance Report</h3>
                <ExportControls getCriteria={getExportCriteria} />
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TimePeriodFilter criteria={criteria} onCriteriaChange={handleCriteriaChange} />

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
                            <CardTitle>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Mechanics</CardTitle>
                                        <FaUserCog className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summary.totalMechanics || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                                        <FaWrench className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summary.totalJobs || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <FaRupeeSign className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{summary.totalRevenue?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {reportData.performances && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Mechanic Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mechanic Name</TableHead>
                                            <TableHead>Completed Jobs</TableHead>
                                            <TableHead>In-Progress Jobs</TableHead>
                                            <TableHead>Total Revenue</TableHead>
                                            <TableHead>Efficiency</TableHead>
                                            <TableHead>Average Job Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.performances.map((mechanic, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{mechanic.mechanicName}</TableCell>
                                                <TableCell>{mechanic.completedJobs}</TableCell>
                                                <TableCell>{mechanic.inProgressJobs}</TableCell>
                                                <TableCell>₹{mechanic.totalRevenue?.toFixed(2) || '0.00'}</TableCell>
                                                <TableCell>
                                                    {mechanic.efficiencyRating ? `${mechanic.efficiencyRating.toFixed(1)}%` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{mechanic.averageJobTime ? `${mechanic.averageJobTime.toFixed(1)} hrs` : 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    <DataVisualizer
                        title="Jobs by Type"
                        data={reportData.jobsByType}
                        availableViews={['table', 'pie', 'bar']}
                        viewConfig={jobsByTypeConfig}
                    />
                </div>
            )}
        </div>
    );
};

export default MechanicPerformance;