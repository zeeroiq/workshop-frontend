import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import '../../styles/Vehicles.css';

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
        year: new Date().getFullYear(),
        vin: '',
        licensePlate: '',
        color: '',
        currentMileage: 0,
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
            setVehicle(response.data);
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
            console.error('Error fetching vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicle(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEdit) {
                await vehicleService.update(id, vehicle);
                toast.success('Vehicle updated successfully');
            } else {
                await vehicleService.create(vehicle);
                toast.success('Vehicle created successfully');
            }
            navigate('/vehicles');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save vehicle';
            toast.error(message);
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="vehicle-form">
            <div className="page-header">
                <h1>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="make">Make *</label>
                        <input
                            type="text"
                            id="make"
                            name="make"
                            value={vehicle.make}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="model">Model *</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            value={vehicle.model}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="year">Year *</label>
                        <select
                            id="year"
                            name="year"
                            value={vehicle.year}
                            onChange={handleChange}
                            required
                            className="form-control"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="color">Color</label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={vehicle.color}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="vin">VIN</label>
                        <input
                            type="text"
                            id="vin"
                            name="vin"
                            value={vehicle.vin}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="licensePlate">License Plate *</label>
                        <input
                            type="text"
                            id="licensePlate"
                            name="licensePlate"
                            value={vehicle.licensePlate}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="currentMileage">Current Mileage</label>
                        <input
                            type="number"
                            id="currentMileage"
                            name="currentMileage"
                            value={vehicle.currentMileage}
                            onChange={handleChange}
                            min="0"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="engineType">Engine Type</label>
                        <input
                            type="text"
                            id="engineType"
                            name="engineType"
                            value={vehicle.engineType}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="customerId">Owner (Customer)</label>
                    <select
                        id="customerId"
                        name="customerId"
                        value={vehicle.customerId || ''}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select a customer...</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName} - {customer.phone}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/vehicles')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleForm;