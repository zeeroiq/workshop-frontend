import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash, TextSearch, Send, Banknote } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { INVOICE_STATUS_OPTIONS } from './constants/invoiceConstants';
import { toast } from "react-toastify";
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

const InvoiceList = ({ onViewInvoice, onEditInvoice, onCreateInvoice, onAddPayment }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadInvoices();
    }, [currentPage, statusFilter]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: 10,
                ...(statusFilter !== 'all' && { status: statusFilter })
            };

            const response = await invoiceService.getAllInvoices(params);
            setInvoices(response.data.data.content || response.data.data);
            setTotalPages(response.data.data.totalPages || 1);
        } catch (error) {
            console.error('Error loading invoices:', error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSendInvoice = async (invoiceId) => {
        try {
            await invoiceService.sendInvoice(invoiceId);
            loadInvoices();
            toast.success('Invoice sent successfully');
        } catch (error) {
            console.error('Error sending invoice:', error);
            toast.error('Failed to send invoice');
        }
    };

    const handleCancelInvoice = async (invoiceId) => {
        try {
            await invoiceService.cancelInvoice(invoiceId);
            loadInvoices();
            toast.success('Invoice cancelled successfully');
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            toast.error('Failed to cancel invoice');
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await invoiceService.deleteInvoice(invoiceId);
                loadInvoices();
                toast.success('Invoice deleted successfully');
            } catch (error) {
                console.error('Error deleting invoice:', error);
                toast.error('Failed to delete invoice');
            }
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'SENT': return 'info';
            case 'DRAFT': return 'secondary';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    const downloadInvoice = async (id) => {
        try {
            setLoading(true);
            const response = await invoiceService.exportInvoice(id);
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/pdf'
            });

            if (blob.size === 0) {
                throw new Error('Server returned empty PDF file');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = `invoice-${id}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully!');

        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error(error.message || 'Failed to download invoice');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSearchedInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground">Manage all invoices for your workshop</p>
                </div>
                <Button onClick={onCreateInvoice}><Plus className="mr-2 h-4 w-4" /> Create Invoice</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            {INVOICE_STATUS_OPTIONS.map(status => (
                                <TabsTrigger key={status.value} value={status.value}>
                                    {status.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value={statusFilter}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan="7" className="h-24 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredAndSearchedInvoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan="7" className="h-24 text-center">
                                                No invoices found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndSearchedInvoices.map(invoice => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                                <TableCell>{invoice.customerName}</TableCell>
                                                <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>₹{invoice.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(invoice.status)}>
                                                        {INVOICE_STATUS_OPTIONS.find(s => s.value === invoice.status)?.label || invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => onViewInvoice(invoice)}><Eye className="h-4 w-4" /></Button>
                                                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                                                            <Button variant="outline" size="icon" onClick={() => onEditInvoice(invoice)}><Edit className="h-4 w-4" /></Button>
                                                        )}
                                                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                                                            <Button variant="outline" size="icon" onClick={() => onAddPayment(invoice)}><Banknote className="h-4 w-4" /></Button>
                                                        )}
                                                        {invoice.status === 'DRAFT' && (
                                                            <>
                                                                <Button variant="outline" size="icon" onClick={() => handleSendInvoice(invoice.id)}><Send className="h-4 w-4" /></Button>
                                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}><Trash className="h-4 w-4" /></Button>
                                                            </>
                                                        )}
                                                        {invoice.status === 'SENT' && (
                                                            <Button variant="destructive" size="icon" onClick={() => handleCancelInvoice(invoice.id)}><Trash className="h-4 w-4" /></Button>
                                                        )}
                                                        <Button variant="outline" size="icon" onClick={() => downloadInvoice(invoice.id)}><TextSearch className="h-4 w-4" /></Button>
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

export default InvoiceList;