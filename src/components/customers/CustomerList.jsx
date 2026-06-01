import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

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

    const columns = [
        {
            header: "Name",
            accessor: "name",
            cell: (row) => (
                <div className="font-semibold text-foreground">
                    {row.firstName} {row.lastName}
                </div>
            )
        },
        {
            header: "Phone",
            accessor: "phone",
            cell: (row) => <div className="text-muted-foreground">{row.phone}</div>
        },
        {
            header: "Email",
            accessor: "email",
            cell: (row) => <div className="text-muted-foreground truncate max-w-[200px]">{row.email || '-'}</div>
        },
        {
            header: "Vehicles",
            accessor: "vehicleCount",
            cell: (row) => (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold">
                    {row.vehicleCount || 0}
                </Badge>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" asChild>
                        <Link to={`/customers/${row.id}`} onClick={(e) => e.stopPropagation()}>
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {!isTablet && <span className="ml-2">View</span>}
                        </Link>
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" asChild>
                        <Link to={`/customers/edit/${row.id}`} onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4 text-primary" />
                            {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                        </Link>
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2 text-destructive" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                    }}>
                        <Trash className="h-4 w-4" />
                        {!isTablet && <span className="ml-2">Delete</span>}
                    </Button>
                </div>
            )
        }
    ];

    const renderCustomerCard = (customer) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/customers/${customer.id}`)}
        >
            <CardHeader className="pb-3 bg-muted/20">
                <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors">
                    {customer.firstName} {customer.lastName}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Phone</p>
                        <p className="font-medium mt-1">{customer.phone}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Vehicles</p>
                        <div className="mt-1">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold">
                                {customer.vehicleCount || 0}
                            </Badge>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Email</p>
                        <p className="font-medium mt-1 truncate">{customer.email || '-'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-11 gap-2 border-border/50"
                        asChild
                    >
                        <Link to={`/customers/edit/${customer.id}`} onClick={(e) => e.stopPropagation()}>
                            <Edit size={16} />
                            <span>Edit</span>
                        </Link>
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="flex-1 h-11 gap-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.id);
                        }}
                    >
                        <Trash size={16} />
                        <span>Delete</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search customers by name, phone or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                />
            </form>
            <Button variant="outline" className="border-border/50 gap-2">
                <Filter size={16} />
                <span>Filters</span>
            </Button>
        </div>
    );

    const actions = (
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Link to="/customers/new"><Plus className="mr-2 h-4 w-4" /> Add Customer</Link>
        </Button>
    );

    return (
        <div className="pb-10">
            <ResponsiveDataContainer
                title="Customers"
                description="Manage and track your workshop customer database"
                actions={actions}
                filters={filters}
                columns={columns}
                data={customers}
                renderCard={renderCustomerCard}
                onRowClick={(row) => navigate(`/customers/${row.id}`)}
                loading={loading}
                emptyMessage="No customers found. Click 'Add Customer' to create your first record."
            />
            
            {!loading && customers.length > 0 && (
                <div className="mt-6 flex justify-center">
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

export default CustomerList;
