import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter, Phone, Mail, Car, MoreVertical } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'react-toastify';
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
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveActions from "@/components/common/ResponsiveActions";

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await customerService.getAll(currentPage, 10, searchTerm);
            setCustomers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchCustomers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to delete customer');
            console.error('Delete error:', error);
        }
    };

    const getCustomerActions = (customer) => [
        {
            label: "View Profile",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => navigate(`/customers/${customer.id}`),
            variant: "outline"
        },
        {
            label: "Edit Details",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => navigate(`/customers/edit/${customer.id}`),
            variant: "outline"
        },
        {
            label: "Delete Account",
            icon: <Trash className="h-4 w-4" />,
            onClick: () => handleDelete(customer.id),
            variant: "destructive"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Intelligent Header Transformation */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase">Staff Hub: Clients</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Managing node for registered workshop customers.</p>
                </div>
                <Button asChild className="h-12 px-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 w-full lg:w-auto">
                    <Link to="/customers/new"><Plus className="mr-2 h-4 w-4" /> Register New Account</Link>
                </Button>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, phone or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pl-10 bg-background/50 border-border/50 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-xl">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <Button variant="outline" className="h-11 px-4 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl border-border/50">
                            <Filter className="h-3.5 w-3.5" /> 
                            <span className="hidden sm:inline">Refine Results</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Information Matrix (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-b border-border/30">
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Identification</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Communication</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-center">Fleet Hub</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">System Controls</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/20">
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="4" className="h-40 text-center text-muted-foreground italic font-medium">
                                            Zero nodes matching current criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={customer.id} className="hover:bg-primary/[0.02] transition-colors group border-b border-border/10">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {customer.firstName} {customer.lastName}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground opacity-60 uppercase">UID: {customer.id.toString().padStart(6, '0')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                        <Phone className="h-3 w-3 opacity-30" /> {customer.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                                                        <Mail className="h-3 w-3 opacity-30" /> {customer.email || 'NO_RECORD'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-center">
                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 font-black rounded-lg">
                                                    {customer.vehicleCount || 0} UNITS
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-right">
                                                <ResponsiveActions actions={getCustomerActions(customer)} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Unit Decomposition (Cards) */}
                    <div className="md:hidden p-4 space-y-4">
                        {customers.length === 0 ? (
                            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                            </div>
                        ) : (
                            customers.map((customer) => (
                                <Card key={customer.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                                    {customer.firstName} {customer.lastName}
                                                </CardTitle>
                                                <p className="text-[9px] font-black tracking-widest text-primary uppercase opacity-70">Client ID: #{customer.id.toString().padStart(4, '0')}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary font-black text-[9px] px-2 py-0.5 rounded-full border border-primary/20">
                                                    {customer.vehicleCount || 0} UNITS
                                                </Badge>
                                                <ResponsiveActions actions={getCustomerActions(customer)} side="horizontal" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Hotline Node</p>
                                                <p className="font-bold flex items-center gap-2 text-foreground break-all">
                                                    <Phone className="h-3 w-3 text-primary" /> {customer.phone}
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Digital Node</p>
                                                <p className="font-bold flex items-center justify-end gap-2 text-foreground truncate">
                                                    {customer.email || '-'} <Mail className="h-3 w-3 text-primary shrink-0" />
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
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

export default CustomerList;
