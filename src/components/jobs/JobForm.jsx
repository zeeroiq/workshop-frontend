import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { customerService } from "@/services/customerService";
import { userService } from "@/services/userService";
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { jobStatuses } from "./helper/constants";
import { toUpperCase_space } from "../helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '../common/LoadingSpinner';

const JobForm = ({ job, onSave, onCancel }) => {
    const isEdit = Boolean(job?.id);
    const [formData, setFormData] = useState({
        customerName: '', customerId: '', vehicle: '', vehicleId: '', license: '',
        service: '', technicianId: '', technician: '', status: 'estimate-pending',
        estimatedCompletion: '', cost: 0, description: '', notes: [], items: []
    });
    const [errors, setErrors] = useState({});
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userInfo = authService.getUserInfo();
        setCurrentUser(userInfo);
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (job) {
            setFormData({
                ...job,
                estimatedCompletion: job.estimatedCompletion ? new Date(job.estimatedCompletion).toISOString().slice(0, 16) : '',
                items: job.items || [],
                notes: job.notes || []
            });
        }
    }, [job]);
    
    useEffect(() => {
        const totalItemsCost = formData.items.reduce((total, item) => total + ((item.quantity || 0) * (item.rate || 0)), 0);
        setFormData(prev => ({ ...prev, cost: totalItemsCost }));
    }, [formData.items]);

    const fetchInitialData = async () => {
        try {
            const [techRes, partsRes, custRes] = await Promise.all([
                userService.getByRole("MECHANIC"),
                inventoryService.getParts(),
                customerService.getAll(0, 1000) // Fetch customers for dropdown
            ]);
            setTechnicians(techRes?.data || []);
            setParts(partsRes?.data?.data?.content || []);
            setCustomers(custRes?.data?.content || []);
        } catch (error) {
            toast.error('Failed to load necessary data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'customerId') {
            const selectedCustomer = customers.find(c => c.id.toString() === value);
            if (selectedCustomer && selectedCustomer.vehicles?.length === 1) {
                const vehicle = selectedCustomer.vehicles[0];
                setFormData(prev => ({
                    ...prev,
                    vehicleId: vehicle.id.toString(),
                    vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                    license: vehicle.licensePlate
                }));
            } else {
                 setFormData(prev => ({ ...prev, vehicleId: '', vehicle: '', license: '' }));
            }
        }
        if (name === 'vehicleId') {
            const selectedCustomer = customers.find(c => c.id.toString() === formData.customerId);
            const vehicle = selectedCustomer?.vehicles.find(v => v.id.toString() === value);
            if(vehicle) {
                setFormData(prev => ({ ...prev, vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, license: vehicle.licensePlate }));
            }
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        const item = updatedItems[index];
        item[field] = value;

        if (field === 'partId') {
            const selectedPart = parts.find(p => p.id.toString() === value);
            if (selectedPart) {
                item.description = selectedPart.name;
                item.rate = selectedPart.sellingPrice;
            }
        }
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleAddItem = (type) => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { type, description: '', quantity: 1, rate: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                cost: parseFloat(formData.cost),
                technician: technicians.find(t => t.id.toString() === formData.technicianId)?.firstName || formData.technician,
                customerName: customers.find(c => c.id.toString() === formData.customerId)?.firstName || formData.customerName,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    rate: parseFloat(item.rate)
                }))
            };
            await onSave(payload);
        } catch (error) {
            toast.error("Failed to save job.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    
    const selectedCustomer = customers.find(c => c.id.toString() === formData.customerId);

    return (
        <div className="container mx-auto py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{isEdit ? 'Edit Job' : 'Create New Job'}</CardTitle>
                         <div className="flex space-x-2">
                            <Button type="button" variant="outline" onClick={onCancel}><FaTimes className="mr-2" /> Cancel</Button>
                            <Button type="submit" disabled={saving}><FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Job'}</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer and Vehicle */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Customer *</Label>
                                <Select name="customerId" value={formData.customerId} onValueChange={val => handleSelectChange('customerId', val)} required>
                                    <SelectTrigger><SelectValue placeholder="Select a customer..." /></SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle *</Label>
                                <Select name="vehicleId" value={formData.vehicleId} onValueChange={val => handleSelectChange('vehicleId', val)} required disabled={!formData.customerId}>
                                    <SelectTrigger><SelectValue placeholder="Select a vehicle..." /></SelectTrigger>
                                    <SelectContent>
                                        {selectedCustomer?.vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.year} {v.make} {v.model}</SelectItem>)}
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
                                <Label>Technician *</Label>
                                <Select name="technicianId" value={formData.technicianId} onValueChange={val => handleSelectChange('technicianId', val)} required>
                                    <SelectTrigger><SelectValue placeholder="Assign a technician..." /></SelectTrigger>
                                    <SelectContent>
                                        {technicians.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('PART')}><FaPlus className="mr-2" />Part</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleAddItem('LABOR')}><FaPlus className="mr-2" />Labor</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5 space-y-2">
                                    {item.type === 'PART' ? (
                                        <Select name="partId" value={item.partId} onValueChange={val => handleItemChange(index, 'partId', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select part..." /></SelectTrigger>
                                            <SelectContent>
                                                {parts.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input name="description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Labor description" />
                                    )}
                                </div>
                                <div className="col-span-2 space-y-2"><Input name="quantity" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" /></div>
                                <div className="col-span-2 space-y-2"><Input name="rate" type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} placeholder="Rate" disabled={item.type === 'PART'} /></div>
                                <div className="col-span-2 self-center pt-3">₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</div>
                                <div className="col-span-1 self-center pt-3"><Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)}><FaTrash /></Button></div>
                            </div>
                        ))}
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
                            <Input name="estimatedCompletion" type="datetime-local" value={formData.estimatedCompletion} onChange={handleChange} required />
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
