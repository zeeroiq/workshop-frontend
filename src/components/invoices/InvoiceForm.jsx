import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { invoiceService } from '@/services/invoiceService';
import { INVOICE_STATUS } from './constants/invoiceConstants';
import { customerService } from "@/services/customerService";
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const InvoiceForm = ({ invoice, onSave, onCancel }) => {
    const isEdit = Boolean(invoice && invoice.id);
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
        notes: '',
        terms: '',
        status: INVOICE_STATUS.DRAFT
    });
    const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0, taxRate: 0, partId: null, discount: 0, isDiscountEditable: true });
    const [errors, setErrors] = useState({});
    const [customers, setCustomers] = useState([]);
    const [parts, setParts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [itemType, setItemType] = useState('labor');
    const [originalItemCount, setOriginalItemCount] = useState(0);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const response = await customerService.listAll();
                setCustomers(response?.data?.content || []);
            } catch (error) {
                toast.error('Failed to fetch customers');
            }
        };
        const loadParts = async () => {
            try {
                const response = await inventoryService.getParts();
                setParts(response?.data?.content || []);
            } catch (error) {
                toast.error('Failed to fetch parts');
            }
        };
        loadCustomers();
        loadParts();
    }, []);

    useEffect(() => {
        if (itemType === 'labor') {
            setNewItem(prev => ({ ...prev, discount: 0, isDiscountEditable: false, description: '' }));
        } else {
            setNewItem(prev => ({ ...prev, isDiscountEditable: true, description: '' }));
        }
    }, [itemType]);

    useEffect(() => {
        if (invoice) {
            // Initialize formData with invoice details
            const initialFormData = {
                ...invoice,
                invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                items: invoice.items || [],
            };

            // Find the customer in the fetched list
            const customerFromList = customers.find(c => c.id === invoice.customerId);

            if (customerFromList) {
                setSelectedCustomer(customerFromList);
                // Update formData with customer details from the found customer
                initialFormData.customerId = customerFromList.id;
                initialFormData.customerName = `${customerFromList.firstName} ${customerFromList.lastName}`;
                initialFormData.customerEmail = customerFromList.email;
                initialFormData.customerPhone = customerFromList.phone;
                initialFormData.customerAddress = customerFromList.address;
            } else {
                // If customer not found in list, ensure selectedCustomer is null
                setSelectedCustomer(null);
                // Keep customer details from invoice if customerFromList is not found
            }

            setFormData(initialFormData);
            setOriginalItemCount(initialFormData.items.length);
        } else {
            setFormData({
                invoiceNumber: '',
                customerId: '',
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                customerAddress: '',
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                items: [],
                notes: '',
                terms: '',
                status: INVOICE_STATUS.DRAFT
            });
            setSelectedCustomer(null);
            setOriginalItemCount(0);
        }
    }, [invoice, customers]); // Depend on invoice and customers

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'customerId') {
            const customer = customers.find(c => c.id.toString() === value);
            setSelectedCustomer(customer);
            if (customer) {
                setFormData(prev => ({
                    ...prev,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    customerAddress: customer.address
                }));
            } else {
                setFormData(prev => ({ ...prev, customerName: '', customerEmail: '', customerPhone: '', customerAddress: '' }));
            }
        }
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleItemUpdate = (index, field, value) => {
        const updatedItems = [...formData.items];
        const itemToUpdate = { ...updatedItems[index], [field]: value };

        const subtotal = itemToUpdate.quantity * itemToUpdate.unitPrice;
        const discountAmount = subtotal * ((itemToUpdate.discount || 0) / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * (itemToUpdate.taxRate / 100);
        itemToUpdate.totalPrice = subtotalAfterDiscount + taxAmount;

        updatedItems[index] = itemToUpdate;

        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const handlePartSelectChange = (partId) => {
        const part = parts.find(p => p.id.toString() === partId);
        if (part) {
            setNewItem(prev => ({
                ...prev,
                itemType: "part",
                partId: part.id,
                partNumber: part.partNumber,
                description: part.name,
                unitPrice: part.sellingPrice,
                discount: part.isDiscounted ? part.discount : 0,
                isDiscountEditable: !part.isDiscounted,
            }));
        }
    };

    const handleAddItem = () => {
        if (formData.jobNumber && !formData.notes) {
            toast.error("Please add a note explaining the reason for adding new items.");
            return;
        }
        if ((itemType === 'labor' && !newItem.description) || (itemType === 'part' && !newItem.partId) || newItem.quantity <= 0 || newItem.unitPrice < 0) {
            toast.error("Please fill all item fields correctly.");
            return;
        }
        
        const subtotal = newItem.quantity * newItem.unitPrice;
        const discountAmount = subtotal * ((newItem.discount || 0) / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * (newItem.taxRate / 100);
        const totalPrice = subtotalAfterDiscount + taxAmount;

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...newItem, totalPrice, itemType }]
        }));
        setNewItem({ itemType: 'labor', description: '', quantity: 1, unitPrice: 0, taxRate: 0, partId: null, discount: 0, isDiscountEditable: true });
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const invoiceData = { ...formData, totalAmount: calculateTotal() };
            if (isEdit) {
                await invoiceService.updateInvoice(invoice.id, invoiceData);
            } else {
                await invoiceService.createInvoice(invoiceData);
            }
            onSave();
        } catch (error) {
            toast.error("Failed to save invoice.");
        } finally {
            setSaving(false);
        }
    };

    const getDiscountDisabledState = (item, index) => {
        const isJobItem = !!formData.jobNumber && index < originalItemCount;
        // if (!item.partId) { // Is labor
        //     return true;
        // }
        if (isJobItem) {
            // For items from a job, the discount is editable only for parts (not labor).
            return !item.partNumber;
        }
        // For newly added parts, use the isDiscountEditable flag set during part selection
        return item.isDiscountEditable === false;
    };

    return (
        <div className="container mx-auto py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
                        <div className="flex space-x-2">
                            <Button type="button" variant="outline" onClick={onCancel}><FaTimes className="mr-2" /> Cancel</Button>
                            <Button type="submit" disabled={saving}><FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Invoice'}</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invoice Details */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="space-y-2"><Label>Invoice Number</Label><Input value={formData.invoiceNumber || 'Auto-generated'} disabled /></div>
                            <div className="space-y-2"><Label>Status</Label>
                                <Select name="status" value={formData.status} onValueChange={val => handleSelectChange('status', val)} disabled>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(INVOICE_STATUS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Invoice Date *</Label><Input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} required /></div>
                            <div className="space-y-2"><Label>Due Date *</Label><Input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required /></div>
                        </div>
                        {/* Customer Info */}
                        <div className="space-y-2">
                            <Label>Customer *</Label>
                            <Select name="customerId" value={formData.customerId} onValueChange={val => handleSelectChange('customerId', val)} required>
                                <SelectTrigger><SelectValue placeholder="Select a customer..." /></SelectTrigger>
                                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2"><Label>Email</Label><Input name="customerEmail" value={formData.customerEmail} disabled /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input name="customerPhone" value={formData.customerPhone} disabled /></div>
                            <div className="space-y-2"><Label>Address</Label><Textarea name="customerAddress" value={formData.customerAddress} disabled rows={3} /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Invoice Items</CardTitle>
                        <RadioGroup defaultValue="labor" onValueChange={setItemType} className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="labor" id="r-labor" />
                                <Label htmlFor="r-labor">Labor</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="part" id="r-part" />
                                <Label htmlFor="r-part">Part</Label>
                            </div>
                        </RadioGroup>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-12 gap-2 items-end mb-4">
                            {itemType === 'labor' ? (
                                <div className="col-span-5 space-y-2">
                                    <Label>Description</Label>
                                    <Input name="description" value={newItem.description} onChange={handleItemChange} />
                                </div>
                            ) : (
                                <>
                                    <div className="col-span-3 space-y-2">
                                        <Label>Part</Label>
                                        <Select onValueChange={handlePartSelectChange}>
                                            <SelectTrigger><SelectValue placeholder="Select a part..." /></SelectTrigger>
                                            <SelectContent>
                                                {parts.map(part => (
                                                    <SelectItem key={part.id} value={part.id.toString()}>
                                                        {part.name} ({part.partNumber}) - In Stock: {part.quantityInStock}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Discount (%)</Label>
                                        <Input type="number" name="discount" value={newItem.discount} onChange={handleItemChange} min="0" max="100" disabled={!newItem.isDiscountEditable} />
                                    </div>
                                </>
                            )}
                            <div className="col-span-1 space-y-2"><Label>Quantity</Label><Input type="number" name="quantity" value={newItem.quantity} onChange={handleItemChange} min="1" /></div>
                            <div className="col-span-2 space-y-2"><Label>Unit Price</Label><Input type="number" name="unitPrice" value={newItem.unitPrice} onChange={handleItemChange} min="0" disabled={itemType === 'part'} /></div>
                            <div className="col-span-2 space-y-2"><Label>Tax Rate (%)</Label><Input type="number" name="taxRate" value={newItem.taxRate} onChange={handleItemChange} min="0" /></div>
                            <div className="col-span-2"><Button type="button" onClick={handleAddItem} className="w-full"><FaPlus className="mr-2" /> Add</Button></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Description</th>
                                        <th className="px-4 py-2 text-right">Qty</th>
                                        <th className="px-4 py-2 text-right">Price</th>
                                        <th className="px-4 py-2 text-right">Discount (%)</th>
                                        <th className="px-4 py-2 text-right">Tax (%)</th>
                                        <th className="px-4 py-2 text-right">Total</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2">{item.itemType.toLowerCase() === 'labor' ? item.description : `[${item.partNumber}] ${item.description}`}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <Input
                                                    type="number"
                                                    value={item.discount || 0}
                                                    onChange={(e) => handleItemUpdate(index, 'discount', e.target.value)}
                                                    disabled={getDiscountDisabledState(item, index)}
                                                    className="w-20 text-left inline-flex"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">{item.taxRate}</td>
                                            <td className="px-4 py-2 text-right font-semibold">₹{Number(item.totalPrice).toFixed(2)}</td>
                                            {/*<td className="px-4 py-2 text-center"><Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} disabled={!!formData.jobNumber && index < originalItemCount}><FaTrash /></Button></td>*/}
                                            {/*TODO: FOR NOW KEEPING DELETE OPTION ENABLED FROM INVOICE PAGE, would revisit later*/}
                                            <td className="px-4 py-2 text-center"><Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)}><FaTrash /></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" value={formData.notes} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea name="terms" value={formData.terms} onChange={handleChange} /></div>
                    </CardContent>
                </Card>
                
                <div className="text-right text-2xl font-bold">
                    Total: ₹{calculateTotal().toFixed(2)}
                </div>
                <CardHeader className="flex flex-row justify-end">
                    <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={onCancel}><FaTimes className="mr-2" /> Cancel</Button>
                        <Button type="submit" disabled={saving}><FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Invoice'}</Button>
                    </div>
                </CardHeader>
            </form>
        </div>
    );
};

export default InvoiceForm;