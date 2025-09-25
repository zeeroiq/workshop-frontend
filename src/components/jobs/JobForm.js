import React, {useState, useEffect} from 'react';
import {
    FaArrowLeft,
    FaCar,
    FaCalendar,
    FaRupeeSign,
    FaSave,
    FaSearch,
    FaTimes,
    FaUser,
    FaWrench,
    FaUserCog
} from 'react-icons/fa';
import '../../styles/Jobs.css';
import {customerService} from "../../services/customerService";
import {toast} from "react-toastify";

const JobForm = ({job, onSave, onCancel}) => {
    const isEdit = Boolean(job && job.id);
    const initialFormState = {
        customer: '',
        customerId: '',
        vehicle: '',
        license: '',
        service: '',
        technician: '',
        status: 'scheduled',
        estimatedCompletion: '',
        cost: '',
        description: '',
        notes: ''
    };

    const [formData, setFormData] = useState({
        // customer: job?.customer || '',
        // customerId: job?.customerId || '',
        // vehicle: job?.vehicle || '',
        // license: job?.license || '',
        // service: job?.service || '',
        // technician: job?.technician || '',
        // status: job?.status || 'scheduled',
        // estimatedCompletion: job?.estimatedCompletion || '',
        // cost: job?.cost || '',
        // description: job?.description || '',
        // notes: job?.notes || ''
        ...initialFormState,
        ...(job || {})
    });

    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [renderJobForm, setRenderJobForm] = useState(isEdit);
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    

    useEffect(() => {
        if (job) {
            setFormData({
                customer: job.customer || '',
                customerId: job.customerId || '',
                vehicle: job.vehicle || '',
                license: job.license || '',
                service: job.service || '',
                technician: job.technician || '',
                status: job.status || 'scheduled', // Keep default
                estimatedCompletion: job.estimatedCompletion || '',
                cost: job.cost || '',
                description: job.description || '',
                notes: job.notes || ''
            });
        }
    }, [job]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customer.trim()) newErrors.customer = 'Customer is required';
        if (!formData.vehicle.trim()) newErrors.vehicle = 'Vehicle is required';
        if (!formData.service.trim()) newErrors.service = 'Service is required';
        if (!formData.technician.trim()) newErrors.technician = 'Technician is required';
        if (!formData.estimatedCompletion) newErrors.estimatedCompletion = 'Estimated completion is required';
        if (!formData.cost || formData.cost <= 0) newErrors.cost = 'Valid cost is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const jobData = {
            ...formData,
            cost: parseFloat(formData.cost),
            id: job?.id
        };

        onSave(jobData);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm?.trim()) {
            await searchCustomer(searchTerm.trim());
        }
    };

    const searchCustomer = async (query) => {
        try {
            const response = await customerService.search(query);
            if (response?.status === 200 && response?.data?.length > 0) {
                setCustomerSearchResults(response.data);
                toast.success(`${response.data.length} customer(s) found.`);
            } else {
                setCustomerSearchResults([]);
                toast.error('Customer not found');
            }
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            customer: `${customer.firstName} ${customer.lastName}`,
            customerId: customer.id
        }));
        setCustomerSearchResults([]); // Clear search results
        // Don't render job form yet, wait for vehicle selection
    };

    const handleSelectVehicle = (vehicle) => {
        setFormData(prev => ({ ...prev, vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, license: vehicle.licensePlate }));
        setRenderJobForm(true); // Now show the full form
    };

    const searchExistingCustomerForm = () => {
        return (
            <form className="job-form-search" onSubmit={handleSearch} >
                <div className="form-section">
                    <input
                        type="text"
                        placeholder="Customer first/last name, phone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                    />
                    <button type="submit" className="save-btn">
                        <FaSearch /> Search
                    </button>
                </div>
                {customerSearchResults.length > 0 && (
                    <div className="customer-search-results">
                        <h4>Select a Customer</h4>
                        <ul>
                            {customerSearchResults.map(cust => (
                                <li key={cust.id} onClick={() => handleSelectCustomer(cust)}>
                                    <strong>{cust.firstName} {cust.lastName}</strong>
                                    <span>{cust.email} | {cust.contactNo}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
        )
    }

    const selectVehicleForm = () => {
        if (!selectedCustomer) return null;

        return (
            <div className="vehicle-selection-form">
                <div className="form-section">
                    <h4>Select a Vehicle for {selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                    {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                        <div className="vehicle-list">
                            {selectedCustomer.vehicles.map(vehicle => (
                                <div key={vehicle.id} className="vehicle-item" onClick={() => handleSelectVehicle(vehicle)}>
                                    <FaCar />
                                    <div>
                                        <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
                                        <span>License: {vehicle.licensePlate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No vehicles found for this customer. Please add vehicle details manually.</p>
                    )}
                </div>
            </div>
        )
    }

    const getJobForm = () => {
        return (
            <form className="job-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Customer Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaUser className="input-icon"/> Customer Name *
                            </label>
                            <input
                                type="text"
                                name="customer"
                                value={formData.customer}
                                onChange={handleChange}
                                disabled={!isEdit}
                                className={errors.customer ? 'error' : ''}
                            />
                            {errors.customer && <span className="error-text">{errors.customer}</span>}
                        </div>
                        <div className="form-group">
                            <label>Customer ID</label>
                            <input
                                type="text"
                                name="customerId"
                                value={formData.customerId}
                                disabled
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Vehicle Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaCar className="input-icon"/> Vehicle *
                            </label>
                            <input
                                type="text"
                                name="vehicle"
                                value={formData.vehicle}
                                onChange={handleChange}
                                className={errors.vehicle ? 'error' : ''}
                                placeholder="Year, Make, Model"
                            />
                            {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
                        </div>
                        <div className="form-group">
                            <label>License Plate</label>
                            <input
                                type="text"
                                name="license"
                                value={formData.license}
                                onChange={handleChange}
                                placeholder="License plate number"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Service Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaWrench className="input-icon"/> Service *
                            </label>
                            <input
                                type="text"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                className={errors.service ? 'error' : ''}
                                placeholder="Service description"
                            />
                            {errors.service && <span className="error-text">{errors.service}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaUserCog className="input-icon"/> Technician *
                            </label>
                            <select
                                name="technician"
                                value={formData.technician}
                                onChange={handleChange}
                                className={errors.technician ? 'error' : ''}
                            >
                                <option value="">Select Technician</option>
                                <option value="Mike Johnson">Mike Johnson</option>
                                <option value="Emily Chen">Emily Chen</option>
                                <option value="Carlos Rodriguez">Carlos Rodriguez</option>
                                <option value="David Wilson">David Wilson</option>
                            </select>
                            {errors.technician && <span className="error-text">{errors.technician}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Service Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Detailed service description"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Schedule & Pricing</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                <FaCalendar className="input-icon"/> Est. Completion *
                            </label>
                            <input
                                type="datetime-local"
                                name="estimatedCompletion"
                                value={formData.estimatedCompletion}
                                onChange={handleChange}
                                className={errors.estimatedCompletion ? 'error' : ''}
                            />
                            {errors.estimatedCompletion &&
                                <span className="error-text">{errors.estimatedCompletion}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaRupeeSign className="input-icon"/> Cost *
                            </label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                className={errors.cost ? 'error' : ''}
                                step="0.01"
                                min="0"
                            />
                            {errors.cost && <span className="error-text">{errors.cost}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Additional Notes</h3>
                    <div className="form-group">
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional notes or special instructions"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        <FaTimes/> Cancel
                    </button>
                    <button type="submit" className="save-btn">
                        <FaSave/> {isEdit ? 'Update Job' : 'Create Job'}
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div className="job-form-container">
            <div className="job-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft/> Back to Jobs
                </button>
                <h2>{isEdit ? 'Edit Job' : 'Create New Job'}</h2>
            </div>
            <div className="job-form">
                {!isEdit && searchExistingCustomerForm()}
                {!isEdit && !renderJobForm && selectVehicleForm()}
                {renderJobForm && getJobForm()}
            </div>
        </div>
    );
};

export default JobForm;