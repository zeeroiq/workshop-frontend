import React, { useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { invoiceService } from '@/services/invoiceService';
import { PAYMENT_METHODS } from './constants/invoiceConstants';
import { toast } from "react-toastify";

import { todayDate } from "../helper/utils";
import ProcessUPI from "../payment/ProcessUPI";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const PaymentForm = ({ invoice, onSave, onCancel }) => {
    const [upiPaymentFlow, setUpiPaymentFlow] = useState(false);
    // const [QRData, setQRData] = useState(); // Removed as it's not used
    const [formData, setFormData] = useState({
        customerId: invoice?.customerId || '',
        invoiceNumber: invoice?.invoiceNumber || '',
        amount: (invoice?.totalAmount - (invoice?.amountPaid || 0)).toFixed(2) || 0,
        paymentDate: todayDate(),
        paymentMethod: PAYMENT_METHODS[0],
        reference: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'amount') {
            processedValue = value === '' ? '' : Number.parseFloat(value); // Keep as number for validation
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // depending on the option selected, enable rendering of respective payment option fields
    // for now we keep it simple, we'll just support cash/UPI
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'paymentMethod' && value === 'UPI') {
            setUpiPaymentFlow(true);
        } else {
            setUpiPaymentFlow(false);
        }
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const outstandingBalance = invoice.totalAmount - (invoice.amountPaid || 0);

        if (!formData?.amount || formData?.amount <= 0) {
            newErrors.amount = 'Valid payment amount is required';
        } else if (formData?.amount > outstandingBalance) {
            newErrors.amount = `Payment cannot exceed outstanding balance of ₹ ${outstandingBalance.toFixed(2)}`;
        }

        if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // Ensure amount is sent as a number with 2 decimal places
            const paymentData = {
                ...formData,
                amount: Number.parseFloat(formData.amount).toFixed(2)
            };
            await invoiceService.addPaymentToInvoice(invoice.id, paymentData);
            onSave();
            toast.success('Payment added successfully!');
        } catch (error) {
            console.error('Error adding payment:', error);
            toast.error('Failed to add payment.');
        }
    };

    const outstandingBalance = invoice ? invoice.totalAmount - (invoice.amountPaid || 0) : 0;

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <Button variant="ghost" onClick={onCancel} className="flex items-center">
                        <FaArrowLeft className="mr-2" /> Back to Invoices
                    </Button>
                    <CardTitle>Add Payment to Invoice #{invoice?.invoiceNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-md">
                        <div className="flex flex-col">
                            <Label className="text-sm text-muted-foreground">Customer:</Label>
                            <span className="font-medium">{invoice?.customerName}</span>
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm text-muted-foreground">Invoice Total:</Label>
                            <span className="font-medium">₹{invoice?.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm text-muted-foreground">Amount Paid:</Label>
                            <span className="font-medium">₹{(invoice?.amountPaid || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm text-muted-foreground">Outstanding Balance:</Label>
                            <span className="font-semibold text-lg text-primary">₹{outstandingBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Payment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className={errors.amount ? 'border-destructive' : ''}
                                        step="0.01"
                                        min="0"
                                        max={outstandingBalance}
                                    />
                                    {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate">Payment Date *</Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        name="paymentDate"
                                        value={formData.paymentDate}
                                        onChange={handleChange}
                                        className={errors.paymentDate ? 'border-destructive' : ''}
                                    />
                                    {errors.paymentDate && <p className="text-destructive text-sm">{errors.paymentDate}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                                    <Select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                                    >
                                        <SelectTrigger className={errors.paymentMethod ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAYMENT_METHODS.map(method => (
                                                <SelectItem key={method} value={method}>
                                                    {method.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.paymentMethod && <p className="text-destructive text-sm">{errors.paymentMethod}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Reference Number</Label>
                                    <Input
                                        id="reference"
                                        type="text"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        placeholder="Check #, Transaction ID, etc."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Additional payment notes"
                                />
                            </div>
                            {upiPaymentFlow && (
                                <ProcessUPI amount={formData?.amount} customerId={formData.customerId} transactionNote="transaction note" />
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                <FaTimes className="mr-2" /> Cancel
                            </Button>
                            <Button type="submit">
                                <FaSave className="mr-2" /> Add Payment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentForm;