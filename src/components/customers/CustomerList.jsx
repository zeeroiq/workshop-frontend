import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter } from 'lucide-react';
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const CustomerList = () => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">Manage your workshop customers</p>
                </div>
                <Button asChild>
                    <Link to="/customers/new"><Plus className="mr-2 h-4 w-4" /> Add New Customer</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Vehicles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="5" className="h-24 text-center">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>{customer.email || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{customer.vehicleCount || 0}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <Link to={`/customers/${customer.id}`}><Eye className="h-4 w-4" /></Link>
                                                    </Button>
                                                    <Button variant="outline" size="icon" asChild>
                                                        <Link to={`/customers/edit/${customer.id}`}><Edit className="h-4 w-4" /></Link>
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="block md:hidden space-y-4">
                        {customers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No customers found.</p>
                        ) : (
                            customers.map((customer) => (
                                <Card key={customer.id}>
                                    <CardHeader>
                                        <CardTitle>{customer.firstName} {customer.lastName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="text-sm text-muted-foreground"><strong>Phone:</strong> {customer.phone}</p>
                                        <p className="text-sm text-muted-foreground"><strong>Email:</strong> {customer.email || '-'}</p>
                                        <p className="text-sm text-muted-foreground"><strong>Vehicles:</strong> <Badge variant="secondary">{customer.vehicleCount || 0}</Badge></p>
                                        <div className="flex items-center justify-end gap-2 pt-4">
                                            <Button variant="outline" size="icon" asChild>
                                                <Link to={`/customers/${customer.id}`}><Eye className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button variant="outline" size="icon" asChild>
                                                <Link to={`/customers/edit/${customer.id}`}><Edit className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
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

export default CustomerList;