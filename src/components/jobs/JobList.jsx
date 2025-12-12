import React, {useEffect, useState} from 'react';
import { Calendar, Car, Clock, Edit, Eye, FileText, Filter, Plus, IndianRupee, Search, Trash, User, Wrench } from 'lucide-react';
import {formatDateAsEnUS} from "../helper/utils";
import {getStatusBadge} from "./helper/utils";
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
import { Badge } from '@/components/ui/badge';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadJobs();
    }, [currentPage, activeTab]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const response = await jobService.getAllJobs(currentPage, 10, activeTab === 'all' ? '' : activeTab);
            if (response?.data?.content?.length > 0) {
                setJobs(response.data.content.map(transformJobData));
                setTotalPages(response.data.totalPages || 1);
            } else {
                setJobs([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
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
            vehicle: vehicle.trim(),
            license: license.trim(),
            service: serviceItems || apiJob.description,
            technicianId: apiJob.technicianId,
            technician: apiJob.technicianName,
            status: apiJob.status.toLowerCase().replace(/_/g, '-'), // e.g., 'IN_PROGRESS' -> 'in-progress'
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, // Using completedAt or updatedAt as a fallback
            cost: apiJob.totalCost,
            createdAt: apiJob.createdAt,
            description: apiJob.description,
            notes: apiJob.notes || [],
            items: apiJob.items || [],
        };
    };


    const filteredJobs = jobs.filter(job =>
        job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.license.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createInvoice = async (jobId) => {
        const response = await jobService.createInvoice(jobId);
        if (response.status === 200 && response.data) {
            toast.dark("Invoice created successfully");
        } else {
            toast.error("Failed to create invoice");
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
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All Jobs</TabsTrigger>
                            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
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
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan="9" className="h-24 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredJobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan="9" className="h-24 text-center">
                                                No jobs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredJobs.map(job => (
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
                                                        {job.cost.toFixed(2)}
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
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage - 1); }}
                                disabled={currentPage === 0}
                            />
                        </PaginationItem>
                        {[...Array(totalPages).keys()].map(page => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                                    isActive={currentPage === page}
                                >
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage + 1); }}
                                disabled={currentPage === totalPages - 1}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default JobList;