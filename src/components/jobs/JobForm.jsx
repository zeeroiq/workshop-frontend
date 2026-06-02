import React, {useCallback, useEffect, useState} from 'react';
import { 
    Plus, 
    Save, 
    X, 
    Trash2, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    Car, 
    Wrench, 
    FileText, 
    ShieldCheck, 
    AlertCircle,
    Package,
    History
} from 'lucide-react';
import {customerService} from "@/services/customerService";
import {userService} from "@/services/userService";
import {inventoryService} from "@/services/inventoryService";
import {toast} from "react-toastify";
import {authService} from "@/services/authService";
import {jobStatuses} from "./helper/constants";
import {toUpperCase_space} from "../helper/utils";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import LoadingSpinner from '../common/LoadingSpinner';
import PartScannerButton from '../common/PartScannerButton';
import SearchableSelect from '../common/SearchableSelect';
import { Badge } from '@/components/ui/badge';

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
    const [selectedCustomerVehicles, setSelectedCustomerVehicles] = useState(null);
    const [calendarDate, setCalendarDate] = useState(undefined);
    const [timeInput, setTimeInput] = useState('');

    useEffect(() => {
        const loadJobData = async () => {
            setLoading(true);
            try {
                const [techRes, partsRes, custRes] = await Promise.all([
                    userService.getByRole("MECHANIC", 0, 10),
                    inventoryService.getParts({ page: 0, size: 10 }),
                    customerService.getAll(0, 10)
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

                if (detailedCustomer) {
                    setCustomers(prev => {
                        const exists = prev.some(c => c.id.toString() === detailedCustomer.id.toString());
                        if (exists) {
                            return prev.map(c => c.id.toString() === detailedCustomer.id.toString() ? detailedCustomer : c);
                        }
                        return [...prev, detailedCustomer];
                    });
                    setSelectedCustomerVehicles(detailedCustomer);

                    setFormData(prev => ({
                        ...prev,
                        customerId: value,
                        customerName: `${detailedCustomer.firstName} ${detailedCustomer.lastName}`,
                        selectedVehicleLicense: '',
                        vehicle: '',
                        license: ''
                    }));
                } else {
                    setSelectedCustomerVehicles(null);
                    setFormData(prev => ({ ...prev, selectedVehicleLicense: '', vehicle: '', license: '' }));
                }
            } catch (error) {
                toast.error("Failed to load customer vehicles.");
                setSelectedCustomerVehicles(null);
            } finally {
                setLoading(false);
            }
        }

        if (name === 'selectedVehicleLicense') {
            const vehicle = selectedCustomerVehicles?.vehicles?.find(v => v.licensePlate === value);
            if (vehicle) {
                setFormData(prev => ({ ...prev, vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, license: vehicle.licensePlate }));
            }
        }

        if (name === 'technicianId') {
            const tech = selectedItem || technicians.find(t => t.id.toString() === value);
            if (tech) {
                setTechnicians(prev => {
                    const exists = prev.some(t => t.id.toString() === tech.id.toString());
                    return exists ? prev : [...prev, tech];
                });
                setFormData(prev => ({ ...prev, technician: `${tech.firstName} ${tech.lastName}` }));
            }
        }
    };

    const handleItemChange = (index, field, value, selectedItem) => {
        setFormData(prev => {
            const updatedItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === 'partId') {
                        const selectedPart = selectedItem || parts.find(p => p.id.toString() === value);
                        if (selectedPart) {
                            updatedItem.description = selectedPart.name;
                            updatedItem.rate = selectedPart.sellingPrice;
                            
                            setParts(prevParts => {
                                if (!prevParts.some(p => p.id.toString() === selectedPart.id.toString())) {
                                    return [...prevParts, selectedPart];
                                }
                                return prevParts;
                            });
                        }
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddItem = (type) => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { type, description: '', quantity: 1, rate: 0, discount: 0 }]
        }));
    };

    const addScannedPartItem = (partData) => {
        setParts(prevParts => {
            if (!prevParts.some(p => p.id.toString() === partData.id.toString())) {
                return [...prevParts, partData];
            }
            return prevParts;
        });
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                type: 'PART',
                partId: partData.id.toString(),
                description: partData.name,
                quantity: 1,
                rate: partData.sellingPrice,
                discount: 0
            }]
        }));
    };

    const isPartAlreadyInJob = (partData) => {
        return formData.items.some(item => item.partId === partData.id.toString());
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTimeInput(newTime);
        if (calendarDate && newTime) {
            const formattedDate = format(calendarDate, "yyyy-MM-dd");
            setFormData(prev => ({ ...prev, estimatedCompletion: `${formattedDate}T${newTime}` }));
        } else if (!newTime) {
            if (!calendarDate) {
                setFormData(prev => ({ ...prev, estimatedCompletion: '' }));
            } else {
                const formattedDate = format(calendarDate, "yyyy-MM-dd");
                setFormData(prev => ({ ...prev, estimatedCompletion: `${formattedDate}T00:00` }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const selectedCustomer = customers.find(c => c.id.toString() === formData.customerId);
            const selectedVehicle = selectedCustomer?.vehicles.find(v => v.licensePlate === formData.selectedVehicleLicense);

            const payload = {
                ...formData,
                vehicleId: selectedVehicle?.id?.toString(),
                license: formData.selectedVehicleLicense,
                cost: Number.parseFloat(formData.cost),
                technician: technicians.find(t => t.id.toString() === formData.technicianId)?.firstName || formData.technician,
                customerName: customers.find(c => c.id.toString() === formData.customerId)?.firstName || formData.customerName,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: Number.parseInt(item.quantity),
                    rate: Number.parseFloat(item.rate),
                    discount: Number.parseFloat(item.discount || 0)
                }))
            };
            await onSave(payload);
        } catch (error) {
            toast.error("Failed to save job.");
        } finally {
            setSaving(false);
        }
    };

    const fetchCustomers = useCallback(async (page, pageSize, search, options = {}) => {
        return await customerService.getAll(page, pageSize, search, { signal: options.signal });
    }, []);

    const fetchTechnicians = useCallback(async (page, pageSize, search, options = {}) => {
        return await userService.getByRole("MECHANIC", page, pageSize, search, { signal: options.signal });
    }, []);

    const fetchParts = useCallback(async (page, pageSize, search, options = {}) => {
        return await inventoryService.getParts({ page, size: pageSize, search, signal: options.signal });
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Cycle Registry</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{isEdit ? `Edit Job ${formData.jobNumber}` : 'Initialize Job Cycle'}</h1>
                        <p className="text-muted-foreground font-medium">Define service parameters and resource allocations.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={onCancel} className="border-border/50 h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                            <X className="mr-2 h-4 w-4 text-rose-500" /> Abort
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-12 px-8 rounded-xl font-black uppercase tracking-widest">
                            {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            {saving ? 'Syncing...' : 'Commit Cycle'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                            <CardHeader className="bg-muted/20 border-b border-border/50">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <User size={18} className="text-emerald-500" /> Entity Mapping
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Link customer and vehicle assets</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <SearchableSelect
                                            label="Customer Contact *"
                                            fetcher={fetchCustomers}
                                            renderItem={(c) => `${c.firstName} ${c.lastName}`}
                                            getItemKey={(c) => c.id}
                                            value={formData.customerId}
                                            onChange={(val, item) => handleSelectChange('customerId', val, item)}
                                            placeholder="Find customer..."
                                            searchPlaceholder="Search registry..."
                                            initialData={customers}
                                            className="h-12 bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Car size={12} className="text-emerald-500" /> Target Vehicle *
                                        </Label>
                                        <Select name="selectedVehicleLicense" value={formData.selectedVehicleLicense} onValueChange={val => handleSelectChange('selectedVehicleLicense', val)} required disabled={!formData.customerId}>
                                            <SelectTrigger className="h-12 bg-background/50 border-border/50 font-bold">
                                                <SelectValue placeholder="Select fleet asset..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl">
                                                {selectedCustomerVehicles?.vehicles?.map(v => (
                                                    <SelectItem key={v.licensePlate} value={v.licensePlate} className="font-bold">
                                                        {v.make} {v.model} ({v.licensePlate})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-border/30">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lead Service Type *</Label>
                                            <Input 
                                                name="service" 
                                                value={formData.service} 
                                                onChange={handleChange} 
                                                required 
                                                className="h-12 bg-background/50 border-border/50 font-bold" 
                                                placeholder="e.g. Engine Overhaul"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <SearchableSelect
                                                label="Lead Technician"
                                                fetcher={fetchTechnicians}
                                                renderItem={(t) => `${t.firstName} ${t.lastName}`}
                                                getItemKey={(t) => t.id}
                                                value={formData.technicianId}
                                                onChange={(val, item) => handleSelectChange('technicianId', val, item)}
                                                placeholder="Assign engineer..."
                                                searchPlaceholder="Search workforce..."
                                                initialData={technicians}
                                                className="h-12 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Technical Brief</Label>
                                        <Textarea 
                                            name="description" 
                                            value={formData.description} 
                                            onChange={handleChange} 
                                            className="bg-background/50 border-border/50 font-medium py-4 min-h-[100px]" 
                                            placeholder="Detailed symptoms or scope of work..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resource Allocation */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                            <CardHeader className="bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between p-6">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Wrench size={18} className="text-emerald-500" /> Resource Allocation
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Parts consumption and labor units</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PartScannerButton onPartScanned={addScannedPartItem} onPartAlreadyExists={isPartAlreadyInJob} />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('PART')} className="h-9 border-border/50 text-[10px] font-black uppercase tracking-widest">
                                        <Plus size={14} className="mr-1" /> Part
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('LABOR')} className="h-9 border-border/50 text-[10px] font-black uppercase tracking-widest">
                                        <Plus size={14} className="mr-1" /> Labor
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {formData.items.length > 0 ? (
                                    <div className="divide-y divide-border/30">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-emerald-500/[0.02] transition-colors">
                                                <div className="md:col-span-5">
                                                    {item.type === 'PART' ? (
                                                        <SearchableSelect
                                                            fetcher={fetchParts}
                                                            renderItem={(p) => `[${p.partNumber}] ${p.name}`}
                                                            getItemKey={(p) => p.id}
                                                            value={item.partId}
                                                            onChange={(val, item) => handleItemChange(index, 'partId', val, item)}
                                                            placeholder="Search inventory..."
                                                            searchPlaceholder="Part SKU / Name..."
                                                            initialData={parts}
                                                            disabled={!!item.id}
                                                            className="h-10 bg-background/30"
                                                        />
                                                    ) : (
                                                        <Input 
                                                            name="description" 
                                                            value={item.description} 
                                                            onChange={e => handleItemChange(index, 'description', e.target.value)} 
                                                            placeholder="Labor description..." 
                                                            disabled={!!item.id} 
                                                            className="h-10 bg-background/30 font-bold"
                                                        />
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="relative">
                                                        <Input 
                                                            name="quantity" 
                                                            type="number" 
                                                            value={item.quantity} 
                                                            onChange={(e) => {
                                                                const newItems = [...formData.items];
                                                                newItems[index] = {...newItems[index], quantity: e.target.value};
                                                                setFormData(prev => ({ ...prev, items: newItems }));
                                                            }} 
                                                            className="h-10 bg-background/30 text-center font-black pr-8"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground">Qty</span>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="relative">
                                                        <Input 
                                                            name="rate" 
                                                            type="number" 
                                                            value={item.rate} 
                                                            onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                                            placeholder="Rate" 
                                                            disabled={item.type === 'PART' || !!item.id} 
                                                            className="h-10 bg-background/30 pl-6 font-bold"
                                                        />
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">₹</span>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 text-right">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Allocation</p>
                                                    <p className="font-black text-emerald-600 dark:text-emerald-400">
                                                        ₹{(((item.quantity || 0) * (item.rate || 0)) * (1 - (item.discount || 0) / 100)).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="md:col-span-1 text-right">
                                                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} disabled={!!item.id} className="h-10 w-10 text-rose-500 hover:bg-rose-500/10">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                                            <Package size={24} className="text-muted-foreground opacity-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black uppercase tracking-widest text-foreground">Manifest Empty</p>
                                            <p className="text-xs text-muted-foreground">Add parts or labor to calculate the job estimate.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-8">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                            <CardHeader className="bg-muted/20 border-b border-border/50">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" /> Cycle Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phase Selection</Label>
                                    <Select name="status" value={formData.status} onValueChange={val => handleSelectChange('status', val)}>
                                        <SelectTrigger className="h-12 bg-background/50 border-border/50 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover/95 backdrop-blur-xl">
                                            {jobStatuses.map(s => (
                                                <SelectItem key={s} value={s} className="font-bold">
                                                    {toUpperCase_space(s)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <CalendarIcon size={12} className="text-emerald-500" /> Deadline Allocation *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "flex-1 h-12 justify-start text-left font-bold bg-background/50 border-border/50",
                                                        !calendarDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                                    {calendarDate ? format(calendarDate, "PPP") : <span>Select Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-border/50 bg-card" align="end">
                                                <Calendar
                                                    mode="single"
                                                    selected={calendarDate}
                                                    onSelect={(selectedDate) => {
                                                        setCalendarDate(selectedDate);
                                                        if (selectedDate) {
                                                            const formattedDate = format(selectedDate, "yyyy-MM-dd");
                                                            const newEstimatedCompletion = `${formattedDate}T${timeInput || '00:00'}`;
                                                            setFormData(prev => ({ ...prev, estimatedCompletion: newEstimatedCompletion }));
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="relative w-32">
                                            <Input
                                                type="time"
                                                value={timeInput}
                                                onChange={handleTimeChange}
                                                required={!!calendarDate}
                                                className="h-12 bg-background/50 border-border/50 font-bold"
                                            />
                                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Snapshot */}
                        <Card className="border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden rounded-2xl">
                             <CardContent className="p-8 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <IndianRupee size={20} className="text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Estimated Accumulation</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-tighter">Gross Job Value</p>
                                    <h2 className="text-5xl font-black text-foreground tracking-tighter">
                                        ₹{formData.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h2>
                                </div>
                                <div className="pt-4 border-t border-emerald-500/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck size={14} /> System Verified Estimate
                                </div>
                             </CardContent>
                        </Card>

                        {/* Recent History or Notes Placeholder */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                            <CardHeader className="bg-muted/20 border-b border-border/50">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={14} className="text-emerald-500" /> Cycle Memory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <AlertCircle size={24} className="text-muted-foreground opacity-20 mb-2" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Job notes can be added <br/> after initial commit.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
