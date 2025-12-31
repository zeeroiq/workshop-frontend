import React, {useState, useEffect} from 'react';
import {
    FaArrowLeft,
    FaEdit
} from 'react-icons/fa';
import {PAYMENT_METHODS} from './constants/invoiceConstants';
import {formatDateForInput} from "../helper/utils";
import { customerService } from '@/services/customerService';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const InvoiceDetails = ({invoice, onEditInvoice, onCancel}) => {
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [fetchedCustomerDetails, setFetchedCustomerDetails] = useState(null);
    const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'OVERDUE':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const toggleCustomerDetails = async () => {
        if (!showCustomerDetails && !fetchedCustomerDetails && invoice?.customerId) {
            setLoadingCustomerDetails(true);
            try {
                const response = await customerService.getById(invoice.customerId);
                if (response?.data) {
                    setFetchedCustomerDetails(response.data);
                } else {
                    toast.error('Failed to fetch customer details.');
                }
            } catch (error) {
                console.error('Error fetching customer details:', error);
                toast.error('Failed to fetch customer details.');
            } finally {
                setLoadingCustomerDetails(false);
            }
        }
        setShowCustomerDetails(prev => !prev);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <Button onClick={onCancel} variant="outline">
                    <FaArrowLeft className="mr-2" /> Back to Invoices
                </Button>
                <h2 className="text-2xl font-bold">Invoice #{invoice?.invoiceNumber}</h2>
                <Button onClick={() => onEditInvoice(invoice)} variant="outline"  disabled={invoice?.status === 'PAID'}>
                    <FaEdit className="mr-2" /> Edit
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoice Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {(invoice?.totalAmount || 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(invoice?.amountPaid || 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(invoice?.balanceDue || 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={getStatusVariant(invoice?.status)}>{invoice?.status}</Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice Number:</span>
                            <span>{invoice?.invoiceNumber || 'NA'}</span>
                        </div>
                        {
                            invoice?.jobNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Job Number:</span>
                                    <span>{invoice?.jobNumber || 'NA'}</span>
                                </div>
                            )
                        }
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice Date:</span>
                            <span>{invoice?.invoiceDate || 'NA'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date:</span>
                            <span>{invoice?.dueDate || 'NA'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 flex-grow">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Customer Name:</span>
                            <span>{invoice?.customerName || 'NA'}</span>
                        </div>
                        {loadingCustomerDetails ? (
                            <div className="text-center">Loading customer details...</div>
                        ) : showCustomerDetails && fetchedCustomerDetails ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span>{fetchedCustomerDetails.email || 'NA'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span>{fetchedCustomerDetails.phone || 'NA'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Address:</span>
                                    <span>{fetchedCustomerDetails.address || 'NA'}</span>
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex justify-end pt-4">
                        <Button variant="outline" size="sm" onClick={toggleCustomerDetails}>
                            {showCustomerDetails ? 'Hide Details' : 'View Details'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Work Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoice?.items?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₹ {item.unitPrice}</TableCell>
                                            <TableCell>₹ {item.totalPrice}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground">No work items recorded for this invoice.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoice?.payments?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Reference Number</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.payments.map((payment, index) => (
                                        <TableRow key={index}>
                                            <TableCell>₹{payment.amount}</TableCell>
                                            <TableCell>{formatDateForInput(payment.paymentDate) || 'NA'}</TableCell>
                                            <TableCell>{payment.paymentMethod}</TableCell>
                                            <TableCell>{payment?.paymentReference || 'NA'}</TableCell>
                                            <TableCell>{payment?.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground">No payments recorded for this invoice.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InvoiceDetails;