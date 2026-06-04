import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter, Users } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';
import { cn } from "@/lib/utils";

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, sortConfig]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await customerService.getAll(
                currentPage, 
                10, 
                searchTerm, 
                sortConfig.key, 
                sortConfig.direction
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-background transition-colors">
                        <Users size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm tracking-tight">{customer.firstName} {customer.lastName}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{customer.phone}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/30">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Assets</p>
                    <p className="text-xs font-bold">{customer.vehicleCount || 0} Vehicles</p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">ACTIVE</Badge>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg border-border/50 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={() => navigate(`/customers/${customer.id}`)}>
                    <Eye size={14} /> Full Profile
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg border-border/50 p-0" onClick={() => navigate(`/customers/edit/${customer.id}`)}>
                    <Edit size={14} />
                </Button>
            </div>
        </div>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2 self-center flex items-center gap-1">
                    <Filter size={10} /> Quick Filters:
                </span>
                {[
                    { label: 'With Vehicles', value: 'has-vehicles' },
                    { label: 'No Vehicles', value: 'no-vehicles' },
                    { label: 'Recent', value: 'recent' }
                ].map(filter => (
                    <button
                        key={filter.value}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                            "bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground"
                        )}
                        onClick={() => {
                            toast.info(`Filtering by ${filter.label}...`);
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSearch} className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search by name, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                />
            </form>
        </div>
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
        <div className="w-full mx-auto space-y-8 pb-10">
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
