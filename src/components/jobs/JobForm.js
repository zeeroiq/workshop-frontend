import React, {useEffect, useState} from 'react';
import {
    FaArrowLeft,
    FaBox,
    FaCalendar,
    FaCar,
    FaMinus,
    FaPlus,
    FaRupeeSign,
    FaSave,
    FaSearch,
    FaTimes,
    FaUser,
    FaUserCog,
    FaWrench
} from 'react-icons/fa';

import {formatDateTimeAMPM} from "../helper/utils";
import {customerService} from "../../services/customerService";
import {userService} from "../../services/userService";
import {inventoryService} from "../../services/inventoryService";

import {toast} from "react-toastify";
import '../../styles/Jobs.css';

const JobForm = ({job, onSave, onCancel}) => {
    const isEdit = Boolean(job?.id);
    const initialFormState = {
        customerName: '',
        customerId: '',
        vehicle: '',
        license: '',
        service: '',
        vehicleId: '',
        technicianId: '',
        technician: '',
        status: 'scheduled',
        estimatedCompletion: '',
        cost: 0,
        description: '',
        notes: [],
        parts: []
    };

    const [formData, setFormData] = useState({
        ...initialFormState,
        ...(job || {})
    });

    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [renderJobForm, setRenderJobForm] = useState(isEdit);
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [technicians, setTechnicians] = useState(null);
    const [parts, setParts] = useState([]);

    useEffect(() => {
        // Load technicians and parts for both new and existing jobs
        loadTechnician();
        loadParts();
    }, []); // Run only once on mount

    useEffect(() => {
        if (job) {
            setFormData({
                customerName: job.customer || '',
                customerId: job.customerId || '',
                vehicle: job.vehicle || '',
                license: job.license || '',
                service: job.service || '',
                technicianId: job.technicianId || '',
                technician: job.technician || '',
                vehicleId: job.vehicleId || '',
                status: job.status || 'scheduled', // Keep default
                estimatedCompletion: formatDateTimeAMPM(job.estimatedCompletion) || '',
                cost: job.cost || 0,
                // Ensure notes and parts are always arrays
                description: job.description || '',
                parts: job.parts || [],
                notes: job.notes || []
            });
        }
    }, [job, technicians]); // Re-run when job or technicians list changes

    const loadTechnician = async () => {
        try {
            const response = await userService.getByRole("MECHANIC");
            const results = response?.data || [];
            if (response?.status === 200 && results.length > 0) {
                setTechnicians(results);
            } else {
                setTechnicians([]);
                console.error('No Technician available in system');
            }
        } catch (error) {
            toast.error('Failed to fetch technician details');
            console.error('Error fetching technicians:', error);
        }
    }

    const loadParts = async () => {
        try {
            const response = await inventoryService.getParts();
            if (response?.status === 200 && response?.data?.data?.content?.length > 0) {
                setParts(response.data.data.content);
            } else {
                setParts([]);
                console.error('No parts available in inventory');
            }
        } catch (error) {
            console.error('Error loading parts:', error);
        }
    };

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

        if (!formData.customerName.trim()) newErrors.customerName = 'Customer is required';
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
            status: formData.status || 'scheduled',
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
            const results = response?.data || [];
            if (response?.status === 200 && results.length > 0) {
                setCustomerSearchResults(results);
                toast.success(`${results.length} customer(s) found.`);
                if (results.length === 1) {
                    // If only one customer, select them automatically
                    handleSelectCustomer(results[0]);
                } else {
                    // If multiple customers, show the form with a dropdown
                    setRenderJobForm(true);
                }
            } else {
                setCustomerSearchResults([]);
                setRenderJobForm(false); // Stay on search form
                toast.error('Customer not found');
            }
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        }
    };

    const handleSelectCustomer = (customer) => {
        const customerVehicles = customer?.vehicles || [];
        let vehicle = '';
        let license = '';
        let vehicleId = '';

        // If there's only one vehicle, pre-populate it
        if (customerVehicles?.length === 1) {
            const singleVehicle = customerVehicles[0];
            vehicle = `${singleVehicle.year} ${singleVehicle.make} ${singleVehicle.model}`;
            license = singleVehicle.licensePlate;
            vehicleId = singleVehicle.id;
        }

        setFormData(prev => ({
                ...prev,
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerId: customer.id,
                vehicle,
                license,
                vehicleId
            })
        );
        setSelectedCustomer(customer);
        setRenderJobForm(true);
    };

    const handleSelectVehicle = (vehicle) => {
        setFormData(prev => ({
                ...prev,
                vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                license: vehicle.licensePlate,
                vehicleId: vehicle.id
            })
        );
    };

    const handleTechnicianChange = (e) => {
        const technicianId = e.target.value;
        const selectedTechnician = technicians.find(t => t.id.toString() === technicianId);

        if (selectedTechnician) {
            setFormData(prev => ({
                ...prev,
                technicianId: selectedTechnician.id,
                technician: `${selectedTechnician.firstName} ${selectedTechnician.lastName}`
            }));
        } else {
            // Handle case where "Select Technician" is chosen
            setFormData(prev => ({...prev, technicianId: '', technician: ''}));
        }
    };

    const handleNewSearch = () => {
        setRenderJobForm(false);
        setCustomerSearchResults([]);
        setSelectedCustomer(null);
        setFormData(initialFormState);
        setSearchTerm('');
    };

    const searchExistingCustomerForm = () => {
        return (
            <form onSubmit={handleSearch}>
                <div className="form-control-search">
                    <input
                        type="text"
                        placeholder="Customer first/last name, phone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                    />
                    <button type="submit" className="form-control-search-btn">
                        <FaSearch/>
                    </button>
                </div>
            </form>
        )
    }

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            parts: [...prev.parts, {
                id: Date.now(), // temporary ID
                partId: '',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        const currentItem = formData.parts[index];
        if (!isEdit && job?.parts?.find(item => item.id === currentItem.id)) {
            toast.warn('Cannot remove items from an existing order');
            return;
        }
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...(formData.parts || [])];
        let currentItem = {...updatedItems[index]};

        if (field === 'partId') {
            const selectedPart = parts.find(p => p.id.toString() === value);
            if (selectedPart) {
                currentItem.partId = selectedPart.id;
                currentItem.name = selectedPart.name || selectedPart.description;
                currentItem.price = selectedPart.sellingPrice; // Auto-fill price
            } else {
                currentItem.partId = '';
                currentItem.name = '';
                currentItem.price = 0;
            }
        } else {
            currentItem[field] = ['quantity', 'price'].includes(field) ? parseFloat(value) || 0 : value;
        }

        // Recalculate total cost for the item
        currentItem.totalCost = (currentItem.quantity || 0) * (currentItem.price || 0);

        updatedItems[index] = currentItem;

        setFormData(prev => ({
            ...prev,
            parts: updatedItems
        }));
    };

    const calculateTotal = () => {
        let partsCost = formData?.parts?.reduce((total, item) => {
            return total + (item.quantity * item.price);
        }, 0);
        return (partsCost + (parseFloat(formData.cost) || 0)).toFixed(2);
    };


    const getJobForm = () => {
        const customerVehicles = selectedCustomer?.vehicles || [];
        const showVehicleDropdown = !isEdit && customerVehicles.length > 1;
        const showCustomerDropdown = !isEdit && customerSearchResults.length > 1;

        return (
            <form className="job-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Customer Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaUser className="input-icon"/> Customer Name *
                            </label>
                            {showCustomerDropdown ? (
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={(e) => {
                                        if (e.target.value === '--new-search--') {
                                            handleNewSearch();
                                            return;
                                        }
                                        const cust = customerSearchResults.find(c => c.id.toString() === e.target.value);
                                        if (cust) {
                                            handleSelectCustomer(cust);
                                        }
                                    }}
                                    className={errors.customerName ? 'error' : ''}
                                >
                                    <option value="">Select a customer</option>
                                    {customerSearchResults.map(c => (
                                        <option key={c.id}
                                                value={c.id}>{`${c.firstName} ${c.lastName} (${c.phone})`}</option>
                                    ))}
                                    <option value="--new-search--" className="new-search-option">-- Perform a new search
                                        --
                                    </option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    disabled
                                    className={errors.customerName ? 'error' : ''}
                                />
                            )}
                            {errors.customerName && <span className="error-text">{errors.customerName}</span>}
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
                            {showVehicleDropdown ? (
                                <select
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={(e) => {
                                        const selectedVeh = customerVehicles.find(v => v.id.toString() === e.target.value);
                                        if (selectedVeh) {
                                            handleSelectVehicle(selectedVeh);
                                        }
                                    }}
                                    className={errors.vehicle ? 'error' : ''}
                                >
                                    <option value="">Select a vehicle</option>
                                    {customerVehicles.map(v => (
                                        <option key={v.id} value={v.id}>{`${v.year} ${v.make} ${v.model}`}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="vehicle"
                                    value={formData.vehicle}
                                    onChange={handleChange}
                                    className={errors.vehicle ? 'error' : ''}
                                    placeholder="Year, Make, Model"
                                    disabled={isEdit}
                                />
                            )}
                            {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
                        </div>
                        <div className="form-group">
                            <label>License Plate</label>
                            <input
                                type="text"
                                name="license"
                                value={formData.license}
                                onChange={handleChange}
                                disabled={isEdit || showVehicleDropdown}
                                placeholder="License plate number"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h3>Parts Used</h3>
                        <button type="button" className="btn-secondary" onClick={handleAddItem}>
                            <FaPlus/> Add Item
                        </button>
                    </div>

                    {formData?.parts?.length > 0 ? (
                        <div className="order-items-container">
                            {formData.parts.map((item, index) => (
                                <div key={item.id} className="order-item-card">
                                    <div className="item-header">
                                        <span className="item-number">Item #{index + 1}</span>
                                        {(isEdit || !job?.parts?.find(oi => oi.id === item.id)) && (
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveItem(index)}
                                                title="Remove item"
                                            >
                                                <FaMinus/>
                                            </button>
                                        )}
                                    </div>
                                    {/* TODO: might need to restrict update to existing items as well. we'll keep it for now*/}
                                    <div className="item-form-grid">
                                        <div className="form-group">
                                            <label>Part *</label>
                                            <select
                                                value={item.partId || ''}
                                                onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Part</option>
                                                {isEdit && item.name && !parts.some(p => p.id === item.partId) && (
                                                    <option key={item.partId} value={item.partId}>
                                                        {item.name}
                                                    </option>
                                                )}
                                                {parts.map(part => (
                                                    <option key={part.id} value={part.id}>
                                                        {part.name || part.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Quantity *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Unit Price (₹) *</label>
                                            <div className="price-input-flex-container">
                                                <FaRupeeSign className="price-flex-icon"/>
                                                <input
                                                    type="number"
                                                    // min="0"
                                                    // step="0.01"
                                                    value={item.price}
                                                    // onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    disabled={item.price > 0}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="item-total">
                                            <label>Total</label>
                                            <div className="total-amount">
                                                <FaRupeeSign className="price-icon"/>
                                                <span>{item?.totalCost?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-items-placeholder">
                            <FaBox className="placeholder-icon"/>
                            <p>No items added to this job</p>
                            <button type="button" className="btn-secondary" onClick={handleAddItem}>
                                <FaPlus/> Add Your First Item
                            </button>
                        </div>
                    )}
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
                                name="technicianId"
                                value={formData.technicianId || ''}
                                onChange={handleTechnicianChange}
                                className={errors.technician ? 'error' : ''}
                            >
                                <option value="">Select Technician</option>
                                {isEdit && formData.technicianId && !technicians?.some(t => t.id === formData.technicianId) && (
                                    <option key={formData.technicianId} value={formData.technicianId}>
                                        {formData.technician}
                                    </option>
                                )}
                                {technicians?.length > 0 &&
                                    technicians.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {`${t.firstName} ${t.lastName}`}
                                        </option>
                                    ))}
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
                                <option value="in_progress">In Progress</option>
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

                    <div className="form-section">
                        <h3>Job Estimate</h3>
                        <div className="order-summary">
                            {/*<div className="summary-row total">*/}
                            <span>Total Cost:</span>
                            <span>₹{calculateTotal()}</span>
                            {/*</div>*/}
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
                {
                    !isEdit && !renderJobForm && (
                        <div className="customer-search-container">{searchExistingCustomerForm()}</div>
                    )
                }
                <h2>{isEdit ? 'Edit Job' : 'Create New Job'}</h2>
            </div>
            <div className="job-form">
                {renderJobForm && getJobForm()}
            </div>
        </div>
    );
};

export default JobForm;