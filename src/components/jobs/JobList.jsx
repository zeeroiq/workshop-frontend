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
import {jobService} from "@/services/jobService";
import {toast} from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('');
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
            const response = await jobService.getAllJobs(
                currentPage, 
                10, 
                activeFilter, 
                searchTerm,
                sortConfig.key,
                sortConfig.direction
            );
            if (response?.data?.content) {
                setJobs(response.data.content.map(transformJobData));
                setTotalPages(response.data.totalPages || 1);
            } else {
                setJobs([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            toast.error('Failed to sync operations log');
            setJobs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeFilter, searchTerm, sortConfig]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadJobs();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, loadJobs]);

    useEffect(() => {
        if (!searchTerm) {
            loadJobs();
        }
    }, [currentPage, activeFilter, sortConfig, loadJobs]);

    const handleFilter = (filterValue) => {
        if (activeFilter === filterValue) {
            setActiveFilter(''); // Toggle off
        } else {
            setActiveFilter(filterValue);
        }
        setCurrentPage(0);
    };

    const createInvoice = async (jobId) => {
        try {
            const response = await jobService.createInvoice(jobId);
            if (response?.status === 200 || response?.data?.success && response.data) {
                toast.success('Generated Invoice successfully');
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
        <Card 
            className="overflow-hidden border-border/50 hover:bg-card/80 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewJob(job)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                    <CardTitle className="text-mg font-mono font-black text-emerald-500 tracking-tighter uppercase">
                        {job.jobNumber}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">LOGGED {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(job.status)}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Stakeholder</p>
                        <p className="font-bold truncate">{job.customer}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Revenue</p>
                        <p className="font-black text-emerald-500">₹{job.cost?.toFixed(0)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Asset Info</p>
                        <p className="font-medium text-[11px] truncate uppercase">{job.vehicle}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Tech Lead</p>
                        <p className="font-bold text-muted-foreground uppercase">{job.technician || 'UNASSIGNED'}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); onViewJob(job); }}>
                        <Eye size={18} /> INTEL
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500" onClick={(e) => { e.stopPropagation(); createInvoice(job.id); }}>
                        <FileText size={18} /> BILL
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2 self-center flex items-center gap-1">
                    <Filter size={10} /> Quick Filters:
                </span>
                {[
                    { label: 'Open', value: 'OPEN' },
                    { label: 'Completed', value: 'COMPLETED' },
                    { label: 'Invoiced', value: 'INVOICED' },
                    { label: 'Paid', value: 'PAID' },
                    { label: 'Recent', value: 'RECENT' }
                ].map(filter => (
                    <button
                        key={filter.value}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                            activeFilter === filter.value
                                ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                : "bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground"
                        )}
                        onClick={() => handleFilter(filter.value)}
                    >
                        {filter.label}
                    </button>
                ))}
                <Button variant="outline" className="border-border/50 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 ml-2" onClick={onShowCalendar}>
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
        <div className="w-full mx-auto space-y-8 pb-10 pr-10">
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
                loading={loading && jobs.length == 0}
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