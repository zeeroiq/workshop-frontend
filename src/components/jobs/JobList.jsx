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
    Car,
    Wrench,
    Clock,
    Filter
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
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

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
            status: apiJob?.status?.toLowerCase()?.replace(/_/g, '-'),
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt,
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
                toast.dark(`Created Invoice ${response.data.invoiceNumber}`);
            } else {
                toast.error("Failed to create invoice");
            }
        } catch (error) {
            toast(error.response?.data?.message || error.message);
        }
    }

    const getJobActions = (job) => [
        {
            label: "Review Job",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onViewJob(job),
            variant: "outline"
        },
        {
            label: "Edit Order",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => onEditJob(job),
            variant: "outline"
        },
        {
            label: "Gen Invoice",
            icon: <FileText className="h-4 w-4" />,
            onClick: () => createInvoice(job.id),
            variant: "outline"
        },
        {
            label: "Purge Job",
            icon: <Trash className="h-4 w-4" />,
            onClick: () => onDeleteJob(job.id),
            variant: "destructive"
        }
    ];

    if (loading && jobs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Header Node */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase">Operational Stream: Jobs</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Managing active service pipelines and work orders.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button variant="outline" onClick={onShowCalendar} className="h-12 px-6 font-black uppercase tracking-widest text-xs border-border/50 bg-background/50 hover:bg-accent transition-all active:scale-95">
                        <Calendar className="mr-2 h-4 w-4" /> Timeline View
                    </Button>
                    <Button onClick={onCreateJob} className="h-12 px-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Initialize Job
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
                        <form onSubmit={(e) => {e.preventDefault(); handleSearch();}} className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input
                                    type="text"
                                    placeholder="Search by job ID, client or asset..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pl-10 bg-background/50 border-border/50 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-xl">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        
                        <div className="flex items-center gap-3">
                            <Select value={activeTab} onValueChange={setActiveTab}>
                                <SelectTrigger className="h-11 w-full sm:w-[240px] bg-background/50 border-border/50 font-black uppercase tracking-widest text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 opacity-50" />
                                        <SelectValue placeholder="Status Filter" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                                    <SelectItem value="all" className="font-bold uppercase tracking-widest text-[10px]">All Operational States</SelectItem>
                                    {JOB_FILTER_OPTIONS.map(status => (
                                        <SelectItem key={status.value} value={status.value} className="font-bold uppercase tracking-widest text-[10px]">
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value={activeTab} className="mt-0">
                            {/* Desktop Matrix */}
                            <div className="hidden xl:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="hover:bg-transparent border-b border-border/30">
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Job ID</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Client Node</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Asset Spec</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Service Load</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Analyst</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Status</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">Valuation</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">Controls</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border/20">
                                        {jobs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan="8" className="h-40 text-center text-muted-foreground italic font-medium">
                                                    Zero active job nodes matching current filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            jobs.map(job => (
                                                <TableRow key={job.jobNumber} className="hover:bg-primary/[0.02] transition-colors group border-b border-border/10">
                                                    <TableCell className="px-6 py-5 font-black text-xs tracking-tighter text-foreground">{job.jobNumber}</TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-foreground uppercase tracking-tight">{job.customer}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-foreground">{job.vehicle}</span>
                                                            <span className="text-[9px] font-mono text-muted-foreground opacity-60 uppercase tracking-widest mt-0.5">{job.license}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 max-w-[150px]">{job.service}</p>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{job.technician || 'UNASSIGNED'}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        {getStatusBadge(job.status)}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right font-black text-emerald-500 text-xs">
                                                        ₹{job.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right">
                                                        <ResponsiveActions actions={getJobActions(job)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Unit Decomposition */}
                            <div className="xl:hidden p-4 space-y-4">
                                {jobs.length === 0 ? (
                                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                                    </div>
                                ) : (
                                    jobs.map(job => (
                                        <Card key={job.jobNumber} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg font-black tracking-tighter text-foreground leading-none">
                                                            {job.jobNumber}
                                                        </CardTitle>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">{job.customer}</p>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-2">
                                                        {getStatusBadge(job.status)}
                                                        <ResponsiveActions actions={getJobActions(job)} side="horizontal" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-5">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5"><Car className="h-3 w-3" /> Target Asset</p>
                                                        <p className="font-bold text-foreground text-xs leading-tight">{job.vehicle}</p>
                                                        <p className="text-[9px] font-mono text-muted-foreground opacity-60 uppercase">{job.license}</p>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><Wrench className="h-3 w-3" /> Tech Node</p>
                                                        <p className="font-black text-foreground text-xs uppercase tracking-tight">{job.technician || 'UNASSIGNED'}</p>
                                                    </div>
                                                    <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics (SLA Target)</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-xs flex items-center gap-2 text-foreground">
                                                                <Clock className="h-3 w-3 text-primary opacity-50" /> {formatDateAsEnUS(job.estimatedCompletion)}
                                                            </p>
                                                            <p className="font-black text-emerald-500 text-sm">₹{job.cost?.toFixed(2)}</p>
                                                        </div>
                                                    </div>
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

            <div className="pt-4 flex justify-center">
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default JobList;
