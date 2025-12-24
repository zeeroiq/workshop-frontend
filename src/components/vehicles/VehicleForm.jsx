import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '@/services/vehicleService';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaSave, FaTimes } from 'react-icons/fa';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [vehicle, setVehicle] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        vin: '',
        licensePlate: '',
        color: '',
        currentMileage: '',
        engineType: '',
        customerId: ''
    });

    useEffect(() => {
        fetchCustomers();
        if (isEdit) {
            fetchVehicle();
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAll(0, 1000);
            setCustomers(response.data.content);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchVehicle = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getById(id);
            setVehicle({
                ...response.data,
                year: response.data.year.toString(),
                customerId: response.data.customerId?.toString() || ''
            });
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicle(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setVehicle(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...vehicle,
                year: parseInt(vehicle.year),
                currentMileage: vehicle.currentMileage ? parseInt(vehicle.currentMileage) : null,
                customerId: vehicle.customerId && vehicle.customerId !== 'none' ? parseInt(vehicle.customerId) : null
            };
            console.log('Submitting payload:', payload);

            if (isEdit) {
                await vehicleService.update(id, payload);
                toast.success('Vehicle updated successfully');
            } else {
                await vehicleService.create(payload);
                toast.success('Vehicle created successfully');
            }
            navigate('/vehicles');
        } catch (error) {
            console.error('Failed to save vehicle:', error);
            toast.error(error.response?.data?.message || 'Failed to save vehicle');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="make">Make *</Label>
                                <Input id="make" name="make" value={vehicle.make} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model *</Label>
                                <Input id="model" name="model" value={vehicle.model} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year *</Label>
                                <Select name="year" value={vehicle.year} onValueChange={(value) => handleSelectChange('year', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" name="color" value={vehicle.color} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="vin">VIN</Label>
                                <Input id="vin" name="vin" value={vehicle.vin} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">License Plate *</Label>
                                <Input id="licensePlate" name="licensePlate" value={vehicle.licensePlate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentMileage">Current Mileage</Label>
                                <Input id="currentMileage" name="currentMileage" type="number" value={vehicle.currentMileage} onChange={handleChange} min="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="engineType">Engine Type</Label>
                                <Input id="engineType" name="engineType" value={vehicle.engineType} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerId">Owner (Customer)</Label>
                            <Select name="customerId" value={vehicle.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
                                <SelectTrigger><SelectValue placeholder="Select a customer..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.firstName} {customer.lastName} - {customer.phone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
                                <FaTimes className="mr-2" /> Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                <FaSave className="mr-2" />
                                {saving ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VehicleForm;
