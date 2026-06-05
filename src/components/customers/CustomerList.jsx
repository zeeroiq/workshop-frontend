import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter, Users } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';
import { cn } from "@/lib/utils";

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, sortConfig, activeFilter]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await customerService.getAll(
                currentPage, 
                10, 
                searchTerm, 
                sortConfig.key, 
                sortConfig.direction,
                activeFilter
            );
            if (response.data) {
                setCustomers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            toast.error('Failed to sync customer registry');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (filterValue) => {
        if (activeFilter === filterValue) {
            setActiveFilter(''); // Toggle off
        } else {
            setActiveFilter(filterValue);
        }
        setCurrentPage(0);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchCustomers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Decommission this customer from the registry?')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer decommissioned successfully');
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to decommission customer');
            console.error('Delete error:', error);
        }
    };

    const columns = [
        {
            header: "Customer Identity",
            sortable: true,
            sortKey: "firstName",
            render: (row) => (
                <div className="font-bold text-sm text-foreground">
                    {row.firstName} {row.lastName}
                </div>
            )
        },
        {
            header: "Contact Intel",
            sortable: true,
            sortKey: "phone",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold">{row.phone}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{row.email || 'NO_EMAIL_ON_FILE'}</span>
                </div>
            )
        },
        {
            header: "Assets",
            sortable: true,
            sortKey: "vehicleCount",
            render: (row) => (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[10px]">
                    {row.vehicleCount || 0} UNITS
                </Badge>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.id}`); }}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); navigate(`/customers/edit/${row.id}`); }}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                        <Trash size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const renderCustomerCard = (customer) => (
        <Card 
            className="overflow-hidden border-border/50 hover:bg-card/80 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/customers/${customer.id}`)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                    <CardTitle className="text-mg font-black group-hover:text-emerald-500 transition-colors">
                        {customer.firstName} {customer.lastName}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{customer.email || 'NO_EMAIL_ON_FILE'}</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">ACTIVE</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Phone Identity</p>
                        <p className="font-bold">{customer.phone}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Asset Count</p>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px]">
                            {customer.vehicleCount || 0} UNITS
                        </Badge>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Member Since</p>
                        <p className="font-bold">{new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Status</p>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`); }}>
                        <Eye size={18} /> PROFILE
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); navigate(`/customers/edit/${customer.id}`); }}>
                        <Edit size={18} /> EDIT
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

        const filters = (
        <>
            <div className="relative group w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search by name, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm focus:border-emerald-500/50 transition-all"
                />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={activeFilter || 'ALL'} onValueChange={handleFilter}>
                    <SelectTrigger className="w-full md:w-[200px] h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/50 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Filter Registry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">ALL CUSTOMERS</SelectItem>
                        <SelectItem value="recent">RECENTLY ONBOARDED</SelectItem>
                        <SelectItem value="has-vehicles">WITH REGISTERED ASSETS</SelectItem>
                        <SelectItem value="no-vehicles">NO ASSETS ON FILE</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );

    const actions = (
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Link to="/customers/new" className="flex items-center gap-2">
                <Plus size={14} strokeWidth={3} /> Add Customer
            </Link>
        </Button>
    );

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full mx-auto pb-10 pr-6 md:pr-10">
            <ResponsiveDataContainer
                title="Customer Intelligence"
                description="Manage and track your workshop customer database"
                actions={actions}
                filters={filters}
                columns={columns}
                data={customers}
                renderCard={renderCustomerCard}
                onRowClick={(row) => navigate(`/customers/${row.id}`)}
                onSort={handleSort}
                sortConfig={sortConfig}
                loading={loading && customers.length === 0}
                emptyMessage="You have no customers registered yet. Onboard your first customer to start tracking history."
                emptyIcon={Users}
                emptyActionLabel="Onboard First Customer"
                onEmptyAction={() => navigate('/customers/new')}
            />
            
            {!loading && customers.length > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default CustomerList;
