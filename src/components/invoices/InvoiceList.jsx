import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash, TextSearch, Send, Banknote, Calendar, Hash, User, Clock, IndianRupee, Filter } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { jobService } from '@/services/jobService';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

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
            setInvoices(response.data.data.content);
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
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = `invoice-${id}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
            }
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download invoice');
        } finally {
            setLoading(false);
        }
    };

    const getInvoiceActions = (invoice) => [
        {
            label: "Inspect Document",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onViewInvoice(invoice),
            variant: "outline"
        },
        {
            label: "Modify Ledger",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => onEditInvoice(invoice),
            variant: "outline",
            show: invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
        },
        {
            label: "Apply Settlement",
            icon: <Banknote className="h-4 w-4" />,
            onClick: () => onAddPayment(invoice),
            variant: "outline",
            show: invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
        },
        {
            label: "Transmit to Client",
            icon: <Send className="h-4 w-4" />,
            onClick: () => handleSendInvoice(invoice.id),
            variant: "outline",
            show: invoice.status === 'DRAFT'
        },
        {
            label: "Void Transaction",
            icon: <Trash className="h-4 w-4" />,
            onClick: () => (invoice.status === 'DRAFT' ? handleDeleteInvoice(invoice.id) : handleCancelInvoice(invoice.id)),
            variant: "destructive",
            show: invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
        },
        {
            label: "Export PDF",
            icon: <TextSearch className="h-4 w-4" />,
            onClick: () => downloadInvoice(invoice.id),
            variant: "outline"
        }
    ];

    const filteredAndSearchedInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && invoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Header Transformation */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase">Financial Hub: Billing</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Managing node for workshop financial documents and settlements.</p>
                </div>
                <Button onClick={onCreateInvoice} className="h-12 px-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 w-full lg:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Initialize Invoice
                </Button>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input
                                    type="text"
                                    placeholder="Search by serial # or recipient..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="h-11 pl-10 bg-background/50 border-border/50 focus:ring-primary/20 font-bold"
                                />
                            </div>
                        </div>
                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full xl:w-auto">
                            <TabsList className="bg-background/50 border-border/50">
                                <TabsTrigger value="all" className="text-[10px]">ALL_MODES</TabsTrigger>
                                {INVOICE_STATUS_OPTIONS.map(status => (
                                    <TabsTrigger key={status.value} value={status.value} className="text-[10px]">
                                        {status.label.toUpperCase()}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={statusFilter} className="w-full">
                        <TabsContent value={statusFilter} className="mt-0">
                            {/* Desktop Matrix */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="hover:bg-transparent border-b border-border/30">
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Serial Node</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Recipient Node</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Temporal Specs</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Valuation</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Status</TableHead>
                                            <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">System Controls</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border/20">
                                        {filteredAndSearchedInvoices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan="6" className="h-40 text-center text-muted-foreground italic font-medium">
                                                    Zero financial nodes matching criteria.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAndSearchedInvoices.map(invoice => (
                                                <TableRow key={invoice.id} className="hover:bg-primary/[0.02] transition-colors group border-b border-border/10">
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground text-xs tracking-widest uppercase">{invoice.invoiceNumber}</span>
                                                            <span className="text-[9px] font-mono text-muted-foreground opacity-60 uppercase">JOB: {invoice.jobNumber || 'NULL_PTR'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <span className="text-xs font-bold text-foreground uppercase tracking-tight">{invoice.customerName}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                                                                <Clock className="h-3 w-3 opacity-40" /> ISS: {new Date(invoice.invoiceDate).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[9px] font-medium text-red-400/80 flex items-center gap-1.5 uppercase tracking-tighter">
                                                                MAT: {new Date(invoice.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <span className="font-black text-emerald-500 text-sm">₹{invoice.totalAmount.toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <Badge variant={getStatusVariant(invoice.status)} className="font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md">
                                                            {invoice.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right">
                                                        <ResponsiveActions actions={getInvoiceActions(invoice)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Deconstruction */}
                            <div className="lg:hidden p-4 space-y-4">
                                {filteredAndSearchedInvoices.length === 0 ? (
                                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero financial nodes found</p>
                                    </div>
                                ) : (
                                    filteredAndSearchedInvoices.map(invoice => (
                                        <Card key={invoice.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg font-black tracking-widest text-foreground leading-none uppercase">
                                                            {invoice.invoiceNumber}
                                                        </CardTitle>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">{invoice.customerName}</p>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-2">
                                                        <Badge variant={getStatusVariant(invoice.status)} className="font-black uppercase tracking-widest text-[8px] px-1.5 py-0.5 rounded-full">
                                                            {invoice.status}
                                                        </Badge>
                                                        <ResponsiveActions actions={getInvoiceActions(invoice)} side="horizontal" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-5">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5"><Hash className="h-3 w-3" /> Job Link</p>
                                                        <p className="font-black text-foreground text-xs uppercase tracking-widest">{invoice.jobNumber || 'NULL'}</p>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><IndianRupee className="h-3 w-3" /> Valuation</p>
                                                        <p className="font-black text-emerald-500 text-base leading-none">₹{invoice.totalAmount.toFixed(2)}</p>
                                                    </div>
                                                    <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Temporal Pipeline</p>
                                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                                            <span className="flex items-center gap-2 text-foreground">
                                                                <Calendar className="h-3 w-3 text-primary opacity-50" /> Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-2 text-red-400">
                                                                Maturity: {new Date(invoice.dueDate).toLocaleDateString()}
                                                            </span>
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

export default InvoiceList;
