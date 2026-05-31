import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '@/services/vehicleService';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaSave, FaTimes, FaCar, FaUser, FaFingerprint, FaHashtag, FaTachometerAlt, FaCog } from 'react-icons/fa';

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
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{isEdit ? 'Update Vehicle Record' : 'Register New Vehicle'}</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Initialize system tracking for a fleet asset or customer vehicle.</p>
            </div>

            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <FaCar className="text-primary text-xs" /> Technical Specifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Primary Identity */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="make" className="text-[10px] font-black uppercase tracking-widest opacity-70">Manufacturer *</Label>
                                <Input id="make" name="make" value={vehicle.make} onChange={handleChange} required className="h-11 bg-background/50 font-bold" placeholder="e.g. BMW" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-[10px] font-black uppercase tracking-widest opacity-70">Model Name *</Label>
                                <Input id="model" name="model" value={vehicle.model} onChange={handleChange} required className="h-11 bg-background/50 font-bold" placeholder="e.g. M3 Competition" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-[10px] font-black uppercase tracking-widest opacity-70">Production Year *</Label>
                                <Select name="year" value={vehicle.year} onValueChange={(value) => handleSelectChange('year', value)}>
                                    <SelectTrigger className="h-11 bg-background/50 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Logistics & Tracking */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/30">
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate" className="text-[10px] font-black uppercase tracking-widest opacity-70">License Plate *</Label>
                                <div className="relative">
                                    <FaHashtag className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input id="licensePlate" name="licensePlate" value={vehicle.licensePlate} onChange={handleChange} required className="h-11 pl-10 bg-background/50 font-black tracking-widest uppercase" placeholder="ABC-1234" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vin" className="text-[10px] font-black uppercase tracking-widest opacity-70">VIN / Chassis Number</Label>
                                <div className="relative">
                                    <FaFingerprint className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input id="vin" name="vin" value={vehicle.vin} onChange={handleChange} className="h-11 pl-10 bg-background/50 font-mono text-xs" placeholder="17-Digit Identifier" />
                                </div>
                            </div>
                        </div>

                        {/* Operational Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border/30">
                            <div className="space-y-2">
                                <Label htmlFor="currentMileage" className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Odometer</Label>
                                <div className="relative">
                                    <FaTachometerAlt className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input id="currentMileage" name="currentMileage" type="number" value={vehicle.currentMileage} onChange={handleChange} min="0" className="h-11 pl-10 bg-background/50 font-bold" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest opacity-70">Exterior Color</Label>
                                <Input id="color" name="color" value={vehicle.color} onChange={handleChange} className="h-11 bg-background/50 font-medium" placeholder="e.g. Midnight Blue" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="engineType" className="text-[10px] font-black uppercase tracking-widest opacity-70">Engine / Powertrain</Label>
                                <div className="relative">
                                    <FaCog className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input id="engineType" name="engineType" value={vehicle.engineType} onChange={handleChange} className="h-11 pl-10 bg-background/50 font-medium" placeholder="e.g. V8 Twin Turbo" />
                                </div>
                            </div>
                        </div>

                        {/* Ownership Mapping */}
                        <div className="space-y-2 pt-4 border-t border-border/30">
                            <Label htmlFor="customerId" className="text-[10px] font-black uppercase tracking-widest opacity-70">Registered Asset Owner</Label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-3.5 z-10 h-4 w-4 text-muted-foreground opacity-50 pointer-events-none" />
                                <Select name="customerId" value={vehicle.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
                                    <SelectTrigger className="h-11 pl-10 bg-background/50 font-bold"><SelectValue placeholder="Select a customer account..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Independent / Unassigned</SelectItem>
                                        {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.firstName} {customer.lastName} • {customer.phone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/50">
                            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} className="h-11 font-bold uppercase tracking-widest text-xs order-2 sm:order-1">
                                <FaTimes className="mr-2 h-3 w-3" /> Abort
                            </Button>
                            <Button type="submit" disabled={saving} className="h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 min-w-[140px] order-1 sm:order-2">
                                <FaSave className="mr-2 h-3 w-3" />
                                {saving ? 'Synchronizing...' : (isEdit ? 'Deploy Updates' : 'Initialize Asset')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VehicleForm;
