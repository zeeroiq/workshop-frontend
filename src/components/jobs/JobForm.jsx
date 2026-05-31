import React, {useCallback, useEffect, useState} from 'react';
import {FaPlus, FaSave, FaTimes, FaTrash, FaCalendar, FaWrench, FaUser, FaClipboardList, FaClock} from 'react-icons/fa';
import {customerService} from "@/services/customerService";
import {userService} from "@/services/userService";
import {inventoryService} from "@/services/inventoryService";
import {toast} from "react-toastify";
import {authService} from "@/services/authService";
import {jobStatuses} from "./helper/constants";
import {toUpperCase_space} from "../helper/utils";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import LoadingSpinner from '../common/LoadingSpinner';
import PartScannerButton from '../common/PartScannerButton';
import SearchableSelect from '../common/SearchableSelect';

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const JobForm = ({ job, onSave, onCancel }) => {
    const isEdit = Boolean(job?.id);
    const [formData, setFormData] = useState({
        customerName: '',
        customerId: '',
        vehicle: '',
        selectedVehicleLicense: '',
        license: '',
        service: '',
        technicianId: '',
        technician: '',
        status: 'estimate-pending',
        estimatedCompletion: '',
        cost: 0,
        description: '',
        notes: [],
        items: []
    });
    const [errors, setErrors] = useState({});
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCustomerVehicles, setSelectedCustomerVehicles] = useState(null);
    const [calendarDate, setCalendarDate] = useState(undefined);
    const [timeInput, setTimeInput] = useState('');

    useEffect(() => {
        const loadJobData = async () => {
            setLoading(true);
            try {
                const userInfo = authService.getUserInfo();
                setCurrentUser(userInfo);

                const [techRes, partsRes, custRes] = await Promise.all([
                    userService.getByRole("MECHANIC", 0, 100),
                    inventoryService.getParts({
                        page: 0,
                        size: 100
                    }),
                    customerService.getAll(0, 100)
                ]);

                const technicians = techRes?.data || [];
                const parts = partsRes?.data?.content || [];
                let customers = custRes?.data?.content || [];

                if (isEdit && job.customerId) {
                    const detailedCustomerRes = await customerService.getWithVehicles(job.customerId);
                    const detailedCustomer = detailedCustomerRes.data;
                    if (detailedCustomer) {
                        const customerExists = customers.some(c => c.id === detailedCustomer.id);
                        if (customerExists) {
                            customers = customers.map(c => c.id === detailedCustomer.id ? detailedCustomer : c);
                        } else {
                            customers = [...customers, detailedCustomer];
                        }
                    }
                }

                setTechnicians(technicians);
                setParts(parts);
                setCustomers(customers);

                if (isEdit) {
                    const customerForVehicles = customers.find(c => c.id.toString() === job.customerId?.toString());
                    setSelectedCustomerVehicles(customerForVehicles);

                    const vehicleFromJob = customerForVehicles?.vehicles?.find(v => v.licensePlate === job.license || v.id.toString() === job.vehicleId?.toString());

                    const initialEstimatedCompletionDate = job.estimatedCompletion ? new Date(job.estimatedCompletion) : undefined;
                    setCalendarDate(initialEstimatedCompletionDate);
                    const initialTimeInput = job.estimatedCompletion ? job.estimatedCompletion.substring(11, 16) : '';
                    setTimeInput(initialTimeInput);

                    setFormData({
                        ...job,
                        customerId: job.customerId?.toString(),
                        technicianId: job.technicianId?.toString(),
                        selectedVehicleLicense: vehicleFromJob ? vehicleFromJob.licensePlate : '',
                        customerName: customerForVehicles ? `${customerForVehicles.firstName} ${customerForVehicles.lastName}` : '',
                        vehicle: vehicleFromJob ? `${vehicleFromJob.year} ${vehicleFromJob.make} ${vehicleFromJob.model}` : '',
                        license: vehicleFromJob ? vehicleFromJob.licensePlate : '',
                        technician: technicians.find(t => t.id.toString() === job.technicianId?.toString())?.firstName || job.technician,
                        estimatedCompletion: job.estimatedCompletion ? new Date(job.estimatedCompletion).toISOString().slice(0, 16) : '',
                        items: job.items?.map(item => {
                            const newItem = { ...item, discount: item.discount || 0 };
                            if (newItem.type === 'PART') {
                                const partDetails = parts.find(p => p.id.toString() === newItem.partId?.toString());
                                return {
                                    ...newItem,
                                    partId: newItem.partId ? newItem.partId.toString() : '',
                                    description: partDetails?.name || newItem.description,
                                    rate: partDetails?.sellingPrice || newItem.rate,
                                };
                            }
                            return newItem;
                        }) || [],
                        notes: job.notes || []
                    });
                }
            } catch (error) {
                toast.error("Failed to load job data. Please try again.");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        loadJobData();
    }, [job]);

    useEffect(() => {
        const totalItemsCost = formData.items.reduce((total, item) => {
            const itemTotal = (item.quantity || 0) * (item.rate || 0);
            const discountAmount = itemTotal * ((item.discount || 0) / 100);
            return total + (itemTotal - discountAmount);
        }, 0);
        setFormData(prev => ({ ...prev, cost: totalItemsCost }));
    }, [formData.items]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = async (name, value, selectedItem) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'customerId') {
            setLoading(true);
            try {
                const detailedCustomerRes = await customerService.getWithVehicles(value);
                const detailedCustomer = detailedCustomerRes.data;
                setSelectedCustomerVehicles(detailedCustomer);
                setFormData(prev => ({
                    ...prev,
                    customerName: `${detailedCustomer.firstName} ${detailedCustomer.lastName}`,
                    selectedVehicleLicense: '',
                    vehicle: '',
                    license: ''
                }));
            } catch (error) {
                toast.error("Failed to load customer vehicles.");
            } finally {
                setLoading(false);
            }
        }

        if (name === 'selectedVehicleLicense') {
            const vehicle = selectedCustomerVehicles?.vehicles?.find(v => v.licensePlate === value);
            if (vehicle) {
                setFormData(prev => ({
                    ...prev,
                    selectedVehicleLicense: value,
                    vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                    license: vehicle.licensePlate
                }));
            }
        }
    };

    const handleAddItem = (type) => {
        const newItem = {
            type,
            description: '',
            quantity: 1,
            rate: 0,
            discount: 0,
            partId: type === 'PART' ? '' : null,
            partNumber: ''
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'partId' && newItems[index].type === 'PART') {
            const part = parts.find(p => p.id.toString() === value);
            if (part) {
                newItems[index].description = part.name;
                newItems[index].partNumber = part.partNumber;
                newItems[index].rate = part.sellingPrice;
                newItems[index].discount = part.isDiscounted ? part.discount : 0;
            }
        }
        
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTimeInput(newTime);
        if (calendarDate) {
            const formattedDate = format(calendarDate, "yyyy-MM-dd");
            const newEstimatedCompletion = `${formattedDate}T${newTime || '00:00'}`;
            setFormData(prev => ({ ...prev, estimatedCompletion: newEstimatedCompletion }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await onSave(formData);
            } else {
                await onSave(formData);
            }
        } catch (error) {
            console.error('Error saving job:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading && !isEdit) return <LoadingSpinner />;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">{isEdit ? 'Modify Service Job' : 'Initialize Service Job'}</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Configure work order parameters and itemized service logs.</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-10 font-bold uppercase tracking-widest text-xs">
                        <FaTimes className="mr-2" /> Abort
                    </Button>
                    <Button type="submit" form="job-form" disabled={saving} className="h-10 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        <FaSave className="mr-2" /> {saving ? 'Synchronizing...' : 'Commit Job'}
                    </Button>
                </div>
            </div>

            <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Customer & Asset Mapping */}
                <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaUser className="text-primary text-xs" /> Asset & Client Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Primary Client Account *</Label>
                                <Select value={formData.customerId} onValueChange={val => handleSelectChange('customerId', val)}>
                                    <SelectTrigger className="h-11 bg-background/50 font-bold"><SelectValue placeholder="Select customer..." /></SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName} • {c.phone}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Service Asset (Vehicle) *</Label>
                                <Select value={formData.selectedVehicleLicense} onValueChange={val => handleSelectChange('selectedVehicleLicense', val)} disabled={!selectedCustomerVehicles}>
                                    <SelectTrigger className="h-11 bg-background/50 font-bold"><SelectValue placeholder={selectedCustomerVehicles ? "Select vehicle..." : "Select client first"} /></SelectTrigger>
                                    <SelectContent>
                                        {selectedCustomerVehicles?.vehicles?.map(v => (
                                            <SelectItem key={v.licensePlate} value={v.licensePlate}>
                                                {v.year} {v.make} {v.model} • {v.licensePlate}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Initial Diagnostic Notes</Label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="bg-background/50 font-medium pt-3" placeholder="Describe the reported issues or service requirements..." />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Itemized Work Order */}
                <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50 overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaClipboardList className="text-primary text-xs" /> Service Log & Parts
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('LABOR')} className="h-8 font-black uppercase tracking-tighter text-[10px]">
                                <FaPlus className="mr-1" /> Labor
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('PART')} className="h-8 font-black uppercase tracking-tighter text-[10px]">
                                <FaPlus className="mr-1" /> Part
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Entry Type</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Description / Resource</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Units</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Unit Rate</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Subtotal</th>
                                        <th className="px-6 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase", item.type === 'LABOR' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500")}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.type === 'PART' ? (
                                                    <Select value={item.partId} onValueChange={val => handleItemChange(index, 'partId', val)}>
                                                        <SelectTrigger className="h-9 bg-background/30 font-bold border-none shadow-none"><SelectValue placeholder="Select Part..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {parts.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} • {p.partNumber} (Stock: {p.quantityInStock})</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="h-9 bg-background/30 font-bold border-none shadow-none" placeholder="Labor task description..." />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="h-9 w-20 mx-auto bg-background/30 font-bold text-center border-none shadow-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} disabled={item.type === 'PART'} className="h-9 w-24 ml-auto bg-background/30 font-bold text-right border-none shadow-none" />
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-foreground">
                                                ₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                    <FaTrash className="h-3 w-3" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card-style items */}
                        <div className="lg:hidden divide-y divide-border/30">
                            {formData.items.length === 0 && (
                                <div className="p-10 text-center text-muted-foreground italic text-sm">No items logged yet.</div>
                            )}
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-4 space-y-4 bg-muted/5">
                                    <div className="flex justify-between items-start">
                                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase", item.type === 'LABOR' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500")}>
                                            {item.type}
                                        </span>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} className="h-7 w-7 text-destructive">
                                            <FaTrash className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {item.type === 'PART' ? (
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold opacity-50">Select Inventory Resource</Label>
                                                <Select value={item.partId} onValueChange={val => handleItemChange(index, 'partId', val)}>
                                                    <SelectTrigger className="h-10 bg-background/50 font-bold"><SelectValue placeholder="Select Part..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {parts.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.quantityInStock})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold opacity-50">Labor Task Description</Label>
                                                <Input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="h-10 bg-background/50 font-bold" placeholder="e.g. Engine Oil Analysis" />
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold opacity-50">Quantity</Label>
                                                <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="h-10 bg-background/50 font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold opacity-50">Unit Rate</Label>
                                                <Input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} disabled={item.type === 'PART'} className="h-10 bg-background/50 font-bold text-right" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subtotal</span>
                                        <span className="text-sm font-black text-emerald-500">₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Personnel & Schedule */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <FaClock className="text-primary text-xs" /> Execution & Logistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Assigned Technician Analyst *</Label>
                                    <Select value={formData.technicianId} onValueChange={val => handleSelectChange('technicianId', val)}>
                                        <SelectTrigger className="h-11 bg-background/50 font-bold"><SelectValue placeholder="Select Technician..." /></SelectTrigger>
                                        <SelectContent>
                                            {technicians.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">System Operational Status</Label>
                                    <Select value={formData.status} onValueChange={val => handleSelectChange('status', val)}>
                                        <SelectTrigger className="h-11 bg-background/50 font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {jobStatuses.map(s => <SelectItem key={s} value={s}>{toUpperCase_space(s)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Projected Completion Node *</Label>
                                <div className="flex flex-col gap-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("h-11 w-full justify-start text-left font-bold bg-background/50", !calendarDate && "text-muted-foreground")}>
                                                <FaCalendar className="mr-2 h-4 w-4 opacity-50" />
                                                {calendarDate ? format(calendarDate, "PPP") : <span>Deployment Date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-border/50 bg-card">
                                            <Calendar
                                                mode="single"
                                                selected={calendarDate}
                                                onSelect={(date) => {
                                                    setCalendarDate(date);
                                                    if (date) {
                                                        const formatted = format(date, "yyyy-MM-dd");
                                                        setFormData(prev => ({ ...prev, estimatedCompletion: `${formatted}T${timeInput || '00:00'}` }));
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <div className="relative">
                                        <FaClock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                        <Input type="time" value={timeInput} onChange={handleTimeChange} className="h-11 pl-10 bg-background/50 font-bold" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-primary/5 flex flex-col justify-center text-center p-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-2">Aggregate Service Valuation</p>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground">₹{formData.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">Estimated metrics based on current log entries.</p>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
