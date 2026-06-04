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
    Wrench,
    Filter
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
import { cn } from "@/lib/utils";

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

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
                response = await jobService.getAllJobs(
                    currentPage, 
                    10, 
                    jobStatus, 
                    searchTerm,
                    sortConfig.key,
                    sortConfig.direction
                );
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
            toast.error('Failed to sync operations log');
            setJobs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeTab, searchTerm, sortConfig]);

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
    }, [currentPage, activeTab, sortConfig, loadJobs]);

    const createInvoice = async (jobId) => {
        try {
            const response = await jobService.createInvoice(jobId);
            if (response?.status === 200 || response?.data?.success && response.data) {
                toast.success(`Generated Invoice ${response.data.invoiceNumber}`);
            } else {
                toast.error("Failed to generate invoice");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const columns = [
        {
            header: "Job Identity",
            sortable: true,
            sortKey: "jobNumber",
            render: (row) => <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-tighter">{row.jobNumber}</span>
        },
        {
            header: "Stakeholder",
            sortable: true,
            sortKey: "customer.firstName",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">{row.customer}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{row.vehicle}</span>
                </div>
            )
        },
        {
            header: "Tech Lead",
            sortable: true,
            sortKey: "mechanic.firstName",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    <span className="text-xs font-bold">{row.technician || 'UNASSIGNED'}</span>
                </div>
            )
        },
        {
            header: "Status",
            sortable: true,
            sortKey: "status",
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: "Revenue",
            sortable: true,
            sortKey: "totalCost",
            render: (row) => (
                <div className="flex items-center font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    <IndianRupee size={12} className="mr-0.5" />
                    {row.cost?.toFixed(2)}
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => onViewJob(row)}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEditJob(row)}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-emerald-500" onClick={() => createInvoice(row.id)}>
                        <FileText size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob(row.id);
                    }}>
                        <Trash size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const renderJobCard = (job) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="font-mono font-black text-emerald-500 tracking-tighter text-sm uppercase">{job.jobNumber}</h4>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">LOGGED {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {getStatusBadge(job.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/30">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Stakeholder</p>
                    <p className="text-xs font-bold truncate">{job.customer}</p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Revenue</p>
                    <p className="text-xs font-black text-emerald-500">₹{job.cost?.toFixed(0)}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg border-border/50 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={() => onViewJob(job)}>
                    <Eye size={14} /> INTEL
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg border-border/50 p-0 text-emerald-500" onClick={() => createInvoice(job.id)}>
                    <FileText size={14} />
                </Button>
            </div>
        </div>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar flex-1">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-48 bg-card/50 border-border/50 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        <SelectValue placeholder="All Operations" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                        <SelectItem value="all">ALL OPERATIONS</SelectItem>
                        {JOB_FILTER_OPTIONS.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label.toUpperCase()}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" className="border-border/50 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2" onClick={onShowCalendar}>
                    <Calendar size={14} /> CALENDAR
                </Button>
            </div>
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search by Job ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                />
            </div>
        </div>
    );

    const actions = (
        <Button onClick={onCreateJob} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Plus size={14} strokeWidth={3} className="mr-2" /> NEW OPERATION
        </Button>
    );

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full mx-auto space-y-8 pb-10">
            <ResponsiveDataContainer
                title="Operational Intelligence"
                description="Managing high-throughput workshop service flow"
                actions={actions}
                filters={filters}
                columns={columns}
                data={jobs}
                renderCard={renderJobCard}
                onRowClick={onViewJob}
                onSort={handleSort}
                sortConfig={sortConfig}
                loading={loading && jobs.length === 0}
                emptyMessage="No service jobs found matching your criteria. Start a new job to begin tracking workshop output."
                emptyIcon={Wrench}
                emptyActionLabel="INITIATE FIRST OPERATION"
                onEmptyAction={onCreateJob}
            />
            
            {!loading && jobs.length > 0 && (
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
