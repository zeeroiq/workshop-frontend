import React, {useCallback, useEffect, useState} from 'react';
import {FaPlus, FaSave, FaTimes, FaTrash, FaCalendar} from 'react-icons/fa';
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
import { cn } from "@/lib/utils"; // Assuming this path for cn utility

const JobForm = ({ job, onSave, onCancel }) => {
    const isEdit = Boolean(job?.id);
    const [formData, setFormData] = useState({
        customerName: '',
        customerId: '',
        vehicle: '',
        selectedVehicleLicense: '', // Changed from vehicleId
        license: '',
        service: '',
        technicianId: '',
        technician: '',
        status: 'estimate-pending',
        estimatedCompletion: '', // This will be YYYY-MM-DDTHH:MM string
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
    const [calendarDate, setCalendarDate] = useState(undefined); // State for the shadcn calendar component
    const [timeInput, setTimeInput] = useState(''); // State for the time input

    useEffect(() => {
        const loadJobData = async () => {
            setLoading(true);
            try {
                const userInfo = authService.getUserInfo();
                setCurrentUser(userInfo);

                const [techRes, partsRes, custRes] = await Promise.all([
                    userService.getByRole("MECHANIC", 0, 10),
                    inventoryService.getParts({
                        page: 0,
                        size: 10
                    }),
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

                    // Find the vehicle using job.vehicleId, then get its licensePlate
                    const vehicleFromJob = customerForVehicles?.vehicles?.find(v => v.licensePlate === job.license || v.id.toString() === job.vehicleId?.toString());

                    const initialEstimatedCompletionDate = job.estimatedCompletion ? new Date(job.estimatedCompletion) : undefined;
                    setCalendarDate(initialEstimatedCompletionDate); // Set calendar date
                    const initialTimeInput = job.estimatedCompletion ? job.estimatedCompletion.substring(11, 16) : ''; // Extract time
                    setTimeInput(initialTimeInput);

                    setFormData({
                        ...job,
                        customerId: job.customerId?.toString(),
                        technicianId: job.technicianId?.toString(),
                        // Set selectedVehicleLicense based on the found vehicle's licensePlate
                        selectedVehicleLicense: vehicleFromJob ? vehicleFromJob.licensePlate : '',
                        customerName: customerForVehicles ? `${customerForVehicles.firstName} ${customerForVehicles.lastName}` : '',
                        vehicle: vehicleFromJob ? `${vehicleFromJob.year} ${vehicleFromJob.make} ${vehicleFromJob.model}` : '',
                        license: vehicleFromJob ? vehicleFromJob.licensePlate : '',
                        technician: technicians.find(t => t.id.toString() === job.technicianId?.toString())?.firstName || job.technician,
                        estimatedCompletion: job.estimatedCompletion ? new Date(job.estimatedCompletion).toISOString().slice(0, 16) : '', // Keep original string format for formData
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
                // If we have the selectedItem from SearchableSelect, we might still want to fetch detailed info with vehicles
                // though SearchableSelect might only have basic info.
                const detailedCustomerRes = await customerService.getWithVehicles(value);
                const detailedCustomer = detailedCustomerRes.data;

                if (detailedCustomer) {
                    // Update the customers list with the detailed customer info, adding it if it doesn't exist
                    setCustomers(prev => {
                        const exists = prev.some(c => c.id.toString() === detailedCustomer.id.toString());
                        if (exists) {
                            return prev.map(c => c.id.toString() === detailedCustomer.id.toString() ? detailedCustomer : c);
                        }
                        return [...prev, detailedCustomer];
                    });
                    setSelectedCustomerVehicles(detailedCustomer);

                    // Reset vehicle selection
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
            // Use the already fetched selectedCustomerVehicles
            const vehicle = selectedCustomerVehicles?.vehicles?.find(v => v.licensePlate === value);
            if (vehicle) {
                setFormData(prev => ({ ...prev, vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, license: vehicle.licensePlate }));
            }
        }

        if (name === 'technicianId') {
            // Use selectedItem if available from SearchableSelect
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
                        // Use selectedItem if provided, otherwise fallback to finding in parts list
                        const selectedPart = selectedItem || parts.find(p => p.id.toString() === value);
                        if (selectedPart) {
                            updatedItem.description = selectedPart.name;
                            updatedItem.rate = selectedPart.sellingPrice;
                            
                            // Also ensure this part is in our local parts list for future lookups
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
                setFormData(prev => ({ ...prev, estimatedCompletion: `${formattedDate}T00:00` })); // Default time if cleared
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Find the vehicleId from the selectedVehicleLicense for the payload
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

    // Fetcher functions for SearchableSelect
    const fetchCustomers = useCallback(async (page, pageSize, search, options = {}) => {
        const params = { page, size: pageSize };
        if (search) params.search = search;
        return await customerService.getAll(params.page, params.size, params.search, { signal: options.signal });
    }, []);

    const fetchTechnicians = useCallback(async (page, pageSize, search, options = {}) => {
        const params = { page, size: pageSize, role: "MECHANIC" };
        if (search) params.search = search;
        return await userService.getByRole(params.role, params.page, params.size, params.search, { signal: options.signal });
    }, []);

    const fetchParts = useCallback(async (page, pageSize, search, options = {}) => {
        const params = { page, size: pageSize };
        if (search) params.search = search;
        return await inventoryService.getParts({ ...params, signal: options.signal });
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{isEdit ? `${formData.jobNumber}` : 'Create New Job'}</CardTitle>
                         <div className="flex space-x-2">
                            <Button type="button" variant="outline" onClick={onCancel}><FaTimes className="mr-2" /> Cancel</Button>
                            <Button type="submit" disabled={saving}><FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Job'}</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer and Vehicle */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Customer *"
                                    fetcher={fetchCustomers}
                                    renderItem={(c) => `${c.firstName} ${c.lastName}`}
                                    getItemKey={(c) => c.id}
                                    value={formData.customerId}
                                    onChange={(val, item) => handleSelectChange('customerId', val, item)}
                                    placeholder="Select a customer..."
                                    searchPlaceholder="Search customers..."
                                    initialData={customers}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle *</Label>
                                <Select name="selectedVehicleLicense" value={formData.selectedVehicleLicense} onValueChange={val => handleSelectChange('selectedVehicleLicense', val)} required disabled={!formData.customerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a vehicle..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            selectedCustomerVehicles?.vehicles?.map(v => <SelectItem key={v.licensePlate} value={v.licensePlate}>{v.year} {v.make} {v.model} ({v.licensePlate})</SelectItem>)
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Service Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Service *</Label>
                                <Input name="service" value={formData.service} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Technician"
                                    fetcher={fetchTechnicians}
                                    renderItem={(t) => `${t.firstName} ${t.lastName}`}
                                    getItemKey={(t) => t.id}
                                    value={formData.technicianId}
                                    onChange={(val, item) => handleSelectChange('technicianId', val, item)}
                                    placeholder="Assign a technician..."
                                    searchPlaceholder="Search technicians..."
                                    initialData={technicians}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Service Description</Label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Parts & Labor</CardTitle>
                        <div className="space-x-2">
                            <PartScannerButton onPartScanned={addScannedPartItem} onPartAlreadyExists={isPartAlreadyInJob} />
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('PART')}><FaPlus className="mr-2" />Part</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('LABOR')}><FaPlus className="mr-2" />Labor</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {
                            formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4 space-y-2">
                                    {
                                        item.type === 'PART' ? (
                                        <SearchableSelect
                                            fetcher={fetchParts}
                                            renderItem={(p) => `[${p.partNumber}] ${p.name}`}
                                            getItemKey={(p) => p.id}
                                            value={item.partId}
                                            onChange={(val, item) => handleItemChange(index, 'partId', val, item)}
                                            placeholder="Select part..."
                                            searchPlaceholder="Search parts..."
                                            initialData={parts}
                                            disabled={!!item.id}
                                        />
                                    ) : (
                                        <Input name="description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Labor description" disabled={!!item.id} />
                                    )
                                    }
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Input name="quantity" type="number" pattern="[0-9]*" value={item.quantity} step="1" min="0" onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[index] = {...newItems[index], quantity: e.target.value};
                                        setFormData(prev => ({ ...prev, items: newItems }));
                                    }} placeholder="Qty" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Input name="rate" type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                           placeholder="Rate" disabled={item.type === 'PART' || !!item.id} />
                                </div>
                                {/*<div className="col-span-1 space-y-2">*/}
                                {/*    <Input name="discount" type="number" value={item.discount} onChange={e => handleItemChange(index, 'discount', e.target.value)}*/}
                                {/*           placeholder="Discount %" />*/}
                                {/*</div>*/}
                                <div className="col-span-2 justify-self-center pt-3">₹{(((item.quantity || 0) * (item.rate || 0)) * (1 - (item.discount || 0) / 100)).toFixed(2)}</div>
                                <div className="col-span-2 justify-self-center pt-3">
                                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} disabled={!!item.id}>
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>
                                ))
                        }
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Schedule & Pricing</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select name="status" value={formData.status} onValueChange={val => handleSelectChange('status', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {jobStatuses.map(s => <SelectItem key={s} value={s}>{toUpperCase_space(s)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Est. Completion *</Label>
                            <div className="flex gap-2"> {/* Use flex to place date and time side-by-side */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !calendarDate && "text-muted-foreground"
                                            )}
                                        >
                                            <FaCalendar className="mr-2 h-4 w-4" />
                                            {calendarDate ? format(calendarDate, "PPP") : <span>Pick a date</span>} {/* Display only date */}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={calendarDate}
                                            onSelect={(selectedDate) => {
                                                setCalendarDate(selectedDate);
                                                if (selectedDate) {
                                                    const formattedDate = format(selectedDate, "yyyy-MM-dd");
                                                    const newEstimatedCompletion = `${formattedDate}T${timeInput || '00:00'}`;
                                                    setFormData(prev => ({ ...prev, estimatedCompletion: newEstimatedCompletion }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, estimatedCompletion: '' }));
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    value={timeInput}
                                    onChange={handleTimeChange}
                                    required={!!calendarDate} // Require time if a date is selected
                                    className="w-auto"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Job Estimate</Label>
                            <Input value={`₹ ${formData.cost.toFixed(2)}`} disabled />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default JobForm;
