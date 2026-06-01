import React, {useEffect, useState, useCallback} from 'react';
import {
    Calendar,
    Edit,
    Eye,
    FileText,
    Plus,
    IndianRupee,
    Trash,
    Search,
    User,
    Wrench
} from 'lucide-react';
import {getStatusBadge} from "./helper/utils";
import {JOB_FILTER_OPTIONS} from "./helper/constants";
import {jobService} from "@/services/jobService";
import {toast} from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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
            status: apiJob?.status?.toLowerCase()?.replace(/_/g, '-'), 
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, 
            cost: apiJob.totalCost,
            createdAt: apiJob.createdAt,
            description: apiJob.description,
            notes: apiJob.notes || [],
            items: apiJob.items || [],
        };
    };

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

    const createInvoice = async (jobId) => {
        try {
            const response = await jobService.createInvoice(jobId);
            if (response?.status === 200 || response?.data?.success && response.data) {
                toast.success(`Created Invoice ${response.data.invoiceNumber}`);
            } else {
                toast.error("Failed to create invoice");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const columns = [
        {
            header: "Job ID",
            accessor: "jobNumber",
            cell: (row) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.jobNumber}</span>
        },
        {
            header: "Customer",
            accessor: "customer",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.customer}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{row.vehicle}</span>
                </div>
            )
        },
        {
            header: "Service",
            accessor: "service",
            cell: (row) => <div className="text-xs text-muted-foreground max-w-[150px] truncate">{row.service}</div>
        },
        {
            header: "Technician",
            accessor: "technician",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    <span className="text-sm">{row.technician || 'Not assigned'}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "status",
            cell: (row) => getStatusBadge(row.status)
        },
        {
            header: "Cost",
            accessor: "cost",
            cell: (row) => (
                <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <IndianRupee size={14} className="mr-0.5" />
                    {row.cost?.toFixed(2)}
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onViewJob(row)}>
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {!isTablet && <span className="ml-2">View</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onEditJob(row)}>
                        <Edit className="h-4 w-4 text-primary" />
                        {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => createInvoice(row.id)}>
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {!isTablet && <span className="ml-2">Invoice</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2 text-destructive" onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob(row.id);
                    }}>
                        <Trash className="h-4 w-4" />
                        {!isTablet && <span className="ml-2">Delete</span>}
                    </Button>
                </div>
            )
        }
    ];

    const renderJobCard = (job) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewJob(job)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-mono font-bold group-hover:text-emerald-500 transition-colors">
                        {job.jobNumber}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                </div>
                {getStatusBadge(job.status)}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Customer</p>
                        <div className="flex items-center gap-2">
                            <User size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium">{job.customer}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Cost</p>
                        <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                            <IndianRupee size={12} className="mr-0.5" />
                            {job.cost?.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Vehicle</p>
                        <div className="flex items-center gap-2">
                            <Wrench size={12} className="text-primary" />
                            <span className="font-medium truncate">{job.vehicle}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Tech</p>
                        <div className="flex items-center gap-2">
                            <User size={12} className="text-muted-foreground" />
                            <span className="font-medium">{job.technician || 'None'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2" onClick={(e) => { e.stopPropagation(); onViewJob(job); }}>
                        <Eye size={18} />
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2" onClick={(e) => { e.stopPropagation(); onEditJob(job); }}>
                        <Edit size={18} />
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-emerald-600 dark:text-emerald-400" onClick={(e) => { e.stopPropagation(); createInvoice(job.id); }}>
                        <FileText size={18} />
                    </Button>
                    <Button variant="destructive" size="lg" className="flex-1 h-12 gap-2 bg-destructive/10 text-destructive border-none" onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}>
                        <Trash size={18} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const filters = (
        <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by Job Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                />
            </div>
            <div className="flex gap-2">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full sm:w-48 bg-muted/30 border-border/50">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {JOB_FILTER_OPTIONS.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" className="border-border/50" onClick={onShowCalendar}>
                    <Calendar size={16} className="mr-2" />
                    <span className="hidden sm:inline">Calendar</span>
                </Button>
            </div>
        </div>
    );

    const actions = (
        <Button onClick={onCreateJob} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus size={16} className="mr-2" />
            <span>New Job</span>
        </Button>
    );

    return (
        <div className="pb-10">
            <ResponsiveDataContainer
                title="Jobs"
                description="Manage and track active service jobs"
                actions={actions}
                filters={filters}
                columns={columns}
                data={jobs}
                renderCard={renderJobCard}
                onRowClick={onViewJob}
                loading={loading}
                emptyMessage="No jobs found matching your criteria."
            />
            
            {!loading && jobs.length > 0 && (
                <div className="mt-6">
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default JobList;
