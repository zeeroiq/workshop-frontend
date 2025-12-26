import React, {useEffect, useState, useCallback} from 'react';
import {
    Calendar,
    Edit,
    Eye,
    FileText,
    Plus,
    IndianRupee,
    Trash,
    Search
} from 'lucide-react';
import {formatDateAsEnUS} from "../helper/utils";
import {getStatusBadge} from "./helper/utils";
import {JOB_FILTER_OPTIONS} from "./helper/constants";
import {jobService} from "@/services/jobService";
import {toast} from "react-toastify";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

import PaginationComponent from "@/components/common/PaginationComponent";

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (searchTerm) {
                response = await jobService.getJobLikeJobNumber(searchTerm);
                if (response?.data) {
                    setJobs(response.data.content.map(transformJobData));
                    setTotalPages(response.data.totalPages || 1);
                } else {
                    setJobs([]);
                    setTotalPages(1);
                }
            } else {
                const jobStatus = activeTab === 'all' ? '' : activeTab.toUpperCase().replaceAll('-', '_');
                response = await jobService.getAllJobs(currentPage, 10, jobStatus, searchTerm);
                if (response?.data?.content?.length > 0) {
                    setJobs(response.data.content.map(transformJobData));
                    setTotalPages(response.data.totalPages || 1);
                } else {
                    setJobs([]);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            toast.error('Failed to load jobs');
            setJobs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeTab, searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                loadJobs();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, loadJobs]);

    useEffect(() => {
        if (!searchTerm) {
            loadJobs();
        }
    }, [currentPage, activeTab, searchTerm, loadJobs]);

    const handleSearch = () => {
        loadJobs();
    };

    const transformJobData = (apiJob) => {
        const [vehicle, license] = (apiJob.vehicleDetails || ' - ').split(' - ');
        const serviceItems = apiJob.items?.filter(item => item.type === 'LABOR')
            .map(item => item.description)
            .join(', ');

        return {
            id: apiJob.id,
            jobNumber: apiJob.jobNumber,
            customer: apiJob.customerName,
            customerId: apiJob.customerId,
            vehicle: vehicle?.trim(),
            license: license?.trim(),
            service: serviceItems || apiJob.description,
            technicianId: apiJob.technicianId,
            technician: apiJob.technicianName,
            status: apiJob?.status?.toLowerCase()?.replace(/_/g, '-'), // e.g., 'IN_PROGRESS' -> 'in-progress'
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, // Using completedAt or updatedAt as a fallback
            cost: apiJob.totalCost,
            createdAt: apiJob.createdAt,
            description: apiJob.description,
            notes: apiJob.notes || [],
            items: apiJob.items || [],
        };
    };

    const createInvoice = async (jobId) => {
        try {
            const response = await jobService.createInvoice(jobId);
            if (response?.status === 200 || response?.data?.success && response.data) {
                toast.dark(`${response.data.jobNumber} updated`);
                toast.dark(`Created Invoice ${response.data.invoiceNumber}`);
            } else {
                toast.error("Failed to create invoice");
            }
        } catch (error) {
            toast(error.response?.data?.message || error.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Jobs</h1>
                    <p className="text-muted-foreground">Manage all the jobs in your workshop</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onShowCalendar}><Calendar className="mr-2 h-4 w-4" /> Calendar View</Button>
                    <Button onClick={onCreateJob}><Plus className="mr-2 h-4 w-4" /> New Job</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search jobs by job number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="max-w-sm"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={activeTab} onValueChange={setActiveTab}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {
                                    JOB_FILTER_OPTIONS.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <Tabs value={activeTab}>
                        <TabsContent value={activeTab}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Technician</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Est. Completion</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        loading ? (
                                        <TableRow>
                                            <TableCell colSpan="9" className="h-24 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                                            </TableCell>
                                        </TableRow>
                                    ) : jobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan="9" className="h-24 text-center">
                                                No jobs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        jobs.map(job => (
                                            <TableRow key={job.jobNumber}>
                                                <TableCell className="font-medium">{job.jobNumber}</TableCell>
                                                <TableCell>{job.customer}</TableCell>
                                                <TableCell>
                                                    <div>{job.vehicle}</div>
                                                    <div className="text-sm text-muted-foreground">{job.license}</div>
                                                </TableCell>
                                                <TableCell>{job.service}</TableCell>
                                                <TableCell>{job.technician}</TableCell>
                                                <TableCell>{getStatusBadge(job.status)}</TableCell>
                                                <TableCell>{formatDateAsEnUS(job.estimatedCompletion)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-4 w-4 mr-1" />
                                                        {job.cost?.toFixed(2)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => onViewJob(job)}><Eye className="h-4 w-4" /></Button>
                                                        <Button variant="outline" size="icon" onClick={() => onEditJob(job)}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="destructive" size="icon" onClick={() => onDeleteJob(job.id)}><Trash className="h-4 w-4" /></Button>
                                                        <Button variant="outline" size="icon" onClick={() => createInvoice(job.id)}><FileText className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default JobList;