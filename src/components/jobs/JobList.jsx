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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Jobs</h1>
                    <p className="text-muted-foreground">Manage all the jobs in your workshop</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={onShowCalendar} className="flex-1 sm:flex-none"><Calendar className="mr-2 h-4 w-4" /> Calendar View</Button>
                    <Button onClick={onCreateJob} className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> New Job</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 w-full lg:max-w-sm">
                            <Input
                                type="text"
                                placeholder="Search jobs by job number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={activeTab} onValueChange={setActiveTab}>
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
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

                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value={activeTab} className="mt-0">
                            {/* Desktop View */}
                            <div className="hidden xl:block overflow-x-auto">
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
                                                            <Button variant="outline" size="icon" onClick={() => onViewJob(job)} title="View Detail"><Eye className="h-4 w-4" /></Button>
                                                            <Button variant="outline" size="icon" onClick={() => onEditJob(job)} title="Edit Job"><Edit className="h-4 w-4" /></Button>
                                                            <Button variant="destructive" size="icon" onClick={() => onDeleteJob(job.id)} title="Delete Job"><Trash className="h-4 w-4" /></Button>
                                                            <Button variant="outline" size="icon" onClick={() => createInvoice(job.id)} title="Create Invoice"><FileText className="h-4 w-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile/Tablet View */}
                            <div className="xl:hidden space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No jobs found.</p>
                                ) : (
                                    jobs.map(job => (
                                        <Card key={job.jobNumber} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{job.jobNumber}</CardTitle>
                                                        <p className="text-sm font-medium text-primary">{job.customer}</p>
                                                    </div>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Vehicle</p>
                                                        <p className="font-medium">{job.vehicle}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{job.license}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Technician</p>
                                                        <p className="font-medium">{job.technician || 'Unassigned'}</p>
                                                    </div>
                                                    <div className="col-span-2 space-y-1">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Service</p>
                                                        <p className="font-medium line-clamp-2">{job.service}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Est. Completion</p>
                                                        <p className="font-medium">{formatDateAsEnUS(job.estimatedCompletion)}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Cost</p>
                                                        <div className="flex items-center font-bold text-emerald-500">
                                                            <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                                                            {job.cost?.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border/50">
                                                    <Button variant="outline" size="sm" onClick={() => onViewJob(job)} className="flex-1 min-w-[80px]">
                                                        <Eye className="h-4 w-4 mr-2" /> View
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => onEditJob(job)} className="flex-1 min-w-[80px]">
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => createInvoice(job.id)} className="flex-1 min-w-[80px]">
                                                        <FileText className="h-4 w-4 mr-2" /> Invoice
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => onDeleteJob(job.id)} className="flex-1 min-w-[80px]">
                                                        <Trash className="h-4 w-4 mr-2" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default JobList;
