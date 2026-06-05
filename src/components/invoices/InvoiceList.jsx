import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash, TextSearch, Send, Banknote, Search, Filter } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';
import { cn } from "@/lib/utils";

const InvoiceList = ({ onViewInvoice, onEditInvoice, onCreateInvoice, onAddPayment }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadInvoices();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, activeFilter, searchTerm]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: 10,
                search: searchTerm,
                filter: activeFilter
            };

            const response = await invoiceService.getAllInvoices(params);
            if (response?.data?.success) {
                setInvoices(response.data.data.content);
                setTotalPages(response.data.data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            toast.error('Failed to load invoices');
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

    const downloadInvoice = async (id) => {
        try {
            setLoading(true);
            const response = await invoiceService.exportInvoice(id);
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/pdf'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice');
        } finally {
            setLoading(false);
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

    const columns = [
        {
            header: "Invoice #",
            accessor: "invoiceNumber",
            cell: (row) => <span className="font-mono font-bold">{row.invoiceNumber}</span>
        },
        {
            header: "Job #",
            accessor: "jobNumber",
            cell: (row) => <span className="text-muted-foreground">{row.jobNumber || '-'}</span>
        },
        {
            header: "Customer",
            accessor: "customerName",
            cell: (row) => <span className="font-medium">{row.customerName}</span>
        },
        {
            header: "Date",
            cell: (row) => <span className="text-muted-foreground">{new Date(row.invoiceDate).toLocaleDateString()}</span>
        },
        {
            header: "Amount",
            cell: (row) => <span className="font-bold text-emerald-500">₹{row.totalAmount.toFixed(2)}</span>
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} className="capitalize">
                    {row.status.toLowerCase()}
                </Badge>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => onViewInvoice(row)}>
                        <Eye size={16} className="text-emerald-500" />
                    </Button>
                    {row.status !== 'PAID' && row.status !== 'CANCELLED' && (
                        <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEditInvoice(row)}>
                                <Edit size={16} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onAddPayment(row)}>
                                <Banknote size={16} className="text-emerald-500" />
                            </Button>
                        </>
                    )}
                    {row.status === 'DRAFT' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleSendInvoice(row.id)}>
                            <Send size={16} className="text-blue-500" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => downloadInvoice(row.id)}>
                        <TextSearch size={16} className="text-muted-foreground" />
                    </Button>
                    {row.status === 'DRAFT' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={() => handleDeleteInvoice(row.id)}>
                            <Trash size={16} className="text-destructive" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const renderInvoiceCard = (invoice) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewInvoice(invoice)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-mono font-bold group-hover:text-emerald-500 transition-colors">
                        {invoice.invoiceNumber}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </span>
                </div>
                <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                    {invoice.status.toLowerCase()}
                </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Customer</p>
                        <p className="font-medium truncate">{invoice.customerName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Amount</p>
                        <p className="font-bold text-emerald-500">₹{invoice.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Job #</p>
                        <p className="font-mono text-xs">{invoice.jobNumber || '-'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Due Date</p>
                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12" onClick={(e) => { e.stopPropagation(); onViewInvoice(invoice); }}>
                        <Eye size={18} />
                    </Button>
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <Button variant="outline" size="lg" className="flex-1 h-12" onClick={(e) => { e.stopPropagation(); onEditInvoice(invoice); }}>
                            <Edit size={18} />
                        </Button>
                    )}
                    <Button variant="outline" size="lg" className="flex-1 h-12 text-emerald-500" onClick={(e) => { e.stopPropagation(); downloadInvoice(invoice.id); }}>
                        <TextSearch size={18} />
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
                    { label: 'Paid', value: 'PAID' },
                    { label: 'Unpaid', value: 'UNPAID' },
                    { label: 'Overdue', value: 'OVERDUE' },
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
            </div>
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search by Invoice # or Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                />
            </div>
        </div>
    );

    const actions = (
        <Button onClick={onCreateInvoice} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Plus size={16} className="mr-2" />
            <span>New Invoice</span>
        </Button>
    );

    return (
        <div className="pb-10 mx-auto space-y-8 pr-10">
            <ResponsiveDataContainer
                title="Invoices"
                description="Manage billing and payments for your services"
                actions={actions}
                filters={filters}
                columns={columns}
                data={invoices}
                renderCard={renderInvoiceCard}
                onRowClick={onViewInvoice}
                loading={loading && invoices.length === 0}
                emptyMessage="No invoices found matching your criteria."
            />
            
            {!loading && invoices.length > 0 && (
                <div className="mt-6">
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

export default InvoiceList;