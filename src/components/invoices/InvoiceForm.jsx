import React, {useCallback, useEffect, useState} from 'react';
import {FaPlus, FaSave, FaTimes, FaTrash, FaFileInvoice, FaUser, FaClipboardList, FaPercent, FaCoins, FaInfoCircle} from 'react-icons/fa';
import {invoiceService} from '@/services/invoiceService';
import {INVOICE_STATUS} from './constants/invoiceConstants';
import {customerService} from "@/services/customerService";
import {inventoryService} from "@/services/inventoryService";
import {toast} from "react-toastify";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import PartScannerButton from '../common/PartScannerButton';
import SearchableSelect from '../common/SearchableSelect';
import {cn} from "@/lib/utils";

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
    const [customers, setCustomers] = useState([]);
    const [parts, setParts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [itemType, setItemType] = useState('LABOR');
    const [originalItemCount, setOriginalItemCount] = useState(0);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [custRes, partsRes] = await Promise.all([
                    customerService.getAll(0, 100),
                    inventoryService.getParts({page: 0, size: 100})
                ]);
                setCustomers(custRes?.data?.content || []);
                setParts(partsRes?.data?.content || []);
            } catch (error) {
                toast.error('Failed to load reference data');
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (itemType?.toUpperCase() === 'LABOR') {
            setNewItem(prev => ({ ...prev, discount: 0, isDiscountEditable: false, description: '' }));
        } else {
            setNewItem(prev => ({ ...prev, isDiscountEditable: true, description: '' }));
        }
    }, [itemType]);

    useEffect(() => {
        if (invoice && invoice.id) {
            const customerFromList = customers.find(c => c.id === invoice.customerId);
            setFormData(prev => {
                const updated = {
                    ...prev,
                    ...invoice,
                    invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
                    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                    items: invoice.items || [],
                };
                if (customerFromList) {
                    setSelectedCustomer(customerFromList);
                    updated.customerName = `${customerFromList.firstName} ${customerFromList.lastName}`;
                    updated.customerEmail = customerFromList.email;
                    updated.customerPhone = customerFromList.phone;
                    updated.customerAddress = customerFromList.address;
                }
                return updated;
            });
            setOriginalItemCount(invoice.items?.length || 0);
        }
    }, [invoice?.id, customers]);

    const handleSelectChange = (name, value, selectedItem) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'customerId') {
            const customer = selectedItem || customers.find(c => c.id.toString() === value);
            setSelectedCustomer(customer);
            if (customer) {
                setFormData(prev => ({
                    ...prev,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    customerAddress: customer.address
                }));
            }
        }
    };

    const handleAddItem = () => {
        if ((itemType?.toUpperCase() === 'LABOR' && !newItem.description) || (itemType === 'part' && !newItem.partId)) {
            toast.error("Please provide entry description/resource.");
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
        setNewItem({ itemType: 'LABOR', description: '', quantity: 1, unitPrice: 0, taxRate: 0, partId: null, discount: 0, isDiscountEditable: true });
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, totalAmount: calculateTotal() };
            if (isEdit) {
                await invoiceService.updateInvoice(invoice.id, payload);
            } else {
                await invoiceService.createInvoice(payload);
            }
            onSave();
        } catch (error) {
            toast.error("Failed to synchronize invoice data.");
        } finally {
            setSaving(false);
        }
    };

    const fetchCustomers = useCallback(async (page, size, search) => {
        return await customerService.getAll(page, size, search);
    }, []);

    const fetchParts = useCallback(async (page, size, search) => {
        return await inventoryService.getParts({ page, size, search });
    }, []);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">{isEdit ? 'Update Billing Record' : 'Initialize Invoice'}</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Generate financial documents for services and parts inventory.</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-10 font-bold uppercase tracking-widest text-xs">
                        <FaTimes className="mr-2" /> Abort
                    </Button>
                    <Button type="submit" form="invoice-form" disabled={saving} className="h-10 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        <FaSave className="mr-2" /> {saving ? 'Synchronizing...' : 'Deploy Invoice'}
                    </Button>
                </div>
            </div>

            <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Header Information */}
                <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaFileInvoice className="text-primary text-xs" /> Document Metadata
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Invoice Serial #</Label>
                                <Input value={formData.invoiceNumber || 'PENDING ASSIGNMENT'} disabled className="h-11 bg-muted/20 font-black tracking-widest" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Payment Status</Label>
                                <Select value={formData.status} disabled>
                                    <SelectTrigger className="h-11 bg-muted/20 font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(INVOICE_STATUS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Issue Date *</Label>
                                <Input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={e => setFormData({...formData, invoiceDate: e.target.value})} required className="h-11 bg-background/50 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Maturity Date *</Label>
                                <Input type="date" name="dueDate" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required className="h-11 bg-background/50 font-bold" />
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-border/30">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                                    <FaUser className="text-[8px]" /> Recipient Client
                                </Label>
                                <SearchableSelect
                                    fetcher={fetchCustomers}
                                    renderItem={(c) => `${c.firstName} ${c.lastName} • ${c.phone}`}
                                    getItemKey={(c) => c.id}
                                    value={formData.customerId}
                                    onChange={(val, item) => handleSelectChange('customerId', val, item)}
                                    placeholder="Select a customer profile..."
                                    className="bg-background/50"
                                    initialData={customers}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-bold uppercase opacity-50">Email</Label>
                                    <p className="text-sm font-medium truncate">{formData.customerEmail || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-bold uppercase opacity-50">Phone</Label>
                                    <p className="text-sm font-medium">{formData.customerPhone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-bold uppercase opacity-50">Address</Label>
                                    <p className="text-sm font-medium line-clamp-1">{formData.customerAddress || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Items */}
                <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50 overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaClipboardList className="text-primary text-xs" /> Line Items & Logistics
                        </CardTitle>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <PartScannerButton onPartScanned={(p) => setNewItem({...newItem, partId: p.id, description: p.name, unitPrice: p.mrp})} />
                            <RadioGroup value={itemType} onValueChange={setItemType} className="flex items-center space-x-4 bg-background/30 p-1.5 rounded-lg border border-border/50">
                                <div className="flex items-center space-x-1.5">
                                    <RadioGroupItem value="LABOR" id="r-labor" className="h-3 w-3" />
                                    <Label htmlFor="r-labor" className="text-[9px] font-black uppercase cursor-pointer">Labor</Label>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <RadioGroupItem value="part" id="r-part" className="h-3 w-3" />
                                    <Label htmlFor="r-part" className="text-[9px] font-black uppercase cursor-pointer">Part</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Add Item Control */}
                        <div className="p-6 md:p-8 bg-muted/5 border-b border-border/50">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                                <div className="lg:col-span-5 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Entry Description</Label>
                                    {itemType === 'part' ? (
                                        <SearchableSelect
                                            fetcher={fetchParts}
                                            renderItem={(p) => `${p.name} • ${p.partNumber} (Stock: ${p.quantityInStock})`}
                                            getItemKey={(p) => p.id}
                                            value={newItem.partId || ""}
                                            onChange={(val, p) => setNewItem({...newItem, partId: val, description: p?.name, unitPrice: p?.mrp || 0})}
                                            placeholder="Search parts inventory..."
                                            initialData={parts}
                                        />
                                    ) : (
                                        <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="e.g. Engine Calibration" className="h-11 bg-background/50 font-bold" />
                                    )}
                                </div>
                                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Units</Label>
                                        <Input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value)})} min="1" className="h-11 bg-background/50 font-bold text-center" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Rate</Label>
                                        <Input type="number" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})} disabled={itemType === 'part'} className="h-11 bg-background/50 font-bold text-right" />
                                    </div>
                                </div>
                                <div className="lg:col-span-3 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Disc %</Label>
                                        <div className="relative">
                                            <FaPercent className="absolute right-3 top-3.5 h-3 w-3 text-muted-foreground opacity-30" />
                                            <Input type="number" value={newItem.discount} onChange={e => setNewItem({...newItem, discount: parseFloat(e.target.value)})} className="h-11 pr-8 bg-background/50 font-bold text-right" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Tax %</Label>
                                        <Input type="number" value={newItem.taxRate} onChange={e => setNewItem({...newItem, taxRate: parseFloat(e.target.value)})} className="h-11 bg-background/50 font-bold text-right" />
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <Button type="button" onClick={handleAddItem} className="w-full h-11 font-black uppercase tracking-widest text-[10px]">
                                        <FaPlus className="mr-2" /> Insert Entry
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* List View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Entry / Resource</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Qty</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Unit Price</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Tax / Disc</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Total Valuation</th>
                                        <th className="px-6 py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-foreground truncate max-w-xs">{item.description}</p>
                                                {item.partNumber && <p className="text-[9px] font-black tracking-widest text-primary uppercase mt-1">Resource ID: {item.partNumber}</p>}
                                            </td>
                                            <td className="px-6 py-5 text-center font-bold">{item.quantity}</td>
                                            <td className="px-6 py-5 text-right font-medium opacity-70">₹{item.unitPrice.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">-{item.discount}% DISC</span>
                                                    <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">+{item.taxRate}% TAX</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-emerald-500">₹{item.totalPrice.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-center">
                                                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-destructive">
                                                    <FaTrash className="h-3 w-3" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="lg:hidden divide-y divide-border/30">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <p className="font-bold text-sm leading-snug">{item.description}</p>
                                            {item.partNumber && <p className="text-[9px] font-black tracking-widest text-primary uppercase">{item.partNumber}</p>}
                                        </div>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} className="h-7 w-7 text-destructive">
                                            <FaTrash className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 bg-muted/10 p-3 rounded-xl border border-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Metrics</p>
                                            <p className="text-xs font-bold">{item.quantity} Unit(s) @ ₹{item.unitPrice}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Adjustment</p>
                                            <div className="flex flex-wrap justify-end gap-1">
                                                <span className="text-[8px] font-black bg-red-400/10 text-red-400 px-1 rounded">-{item.discount}%</span>
                                                <span className="text-[8px] font-black bg-blue-400/10 text-blue-400 px-1 rounded">+{item.taxRate}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Line Total</span>
                                        <span className="text-base font-black text-emerald-500">₹{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Intelligence */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <FaInfoCircle className="text-primary text-xs" /> Supplemental Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Operational Notes</Label>
                                <Textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="bg-background/50 font-medium pt-3" placeholder="Enter internal system notes or specific customer instructions..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Regulatory Terms & Conditions</Label>
                                <Textarea name="terms" value={formData.terms} onChange={handleChange} rows="2" className="bg-background/50 font-medium pt-3" placeholder="Enter payment terms, warranty info, and legal disclaimers..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-emerald-500/5 flex flex-col justify-center text-center p-8">
                        <div className="space-y-1 mb-6">
                            <FaCoins className="mx-auto text-emerald-500/30 text-3xl mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/70">Aggregate Document Value</p>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground">₹{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4">
                                <span>Base Revenue</span>
                                <span>₹{formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-red-400 px-4">
                                <span>Total Adjustments</span>
                                <span>-₹{formData.items.reduce((sum, i) => sum + ((i.quantity * i.unitPrice) * (i.discount/100)), 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
