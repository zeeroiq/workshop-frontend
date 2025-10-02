import React, {useEffect, useState} from 'react';
import {
    FaArrowLeft,
    FaBox,
    FaCalendar,
    FaCar, FaFileAlt,
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

import {formatDate, formatDateTimeAMPM} from "../helper/utils";
import {customerService} from "../../services/customerService";
import {userService} from "../../services/userService";
import {inventoryService} from "../../services/inventoryService";

import {toast} from "react-toastify";
import '../../styles/Jobs.css';
import '../../styles/App.css';
import {authService} from "../../services/authService";

const JobForm = ({job, onSave, onCancel}) => {
    const isEdit = Boolean(job?.jobNumber);
    const initialFormState = {
        id: '',
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
        items: []
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
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userInfo = authService.getUserInfo();
        setCurrentUser(userInfo);
    }, []);

    useEffect(() => {
        // Load technicians and parts for both new and existing jobs
        loadTechnician();
        loadParts();
    }, []); // Run only once on mount

    useEffect(() => {
        if (job) {
            setFormData({
                id: job.id || '',
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
                items: job.items || [],
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
            jobNumber: job?.jobNumber
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

    const handleAddNote = () => {
        if (!newNoteContent.trim()) {
            toast.warn("Note content cannot be empty.");
            return;
        }

        const newNote = {
            id: `new-${Date.now()}`, // Temporary unique ID
            content: newNoteContent,
            authorId: currentUser?.id,
            authorName: `${currentUser.firstName} ${currentUser.lastName}`,
            currentUsername: currentUser?.username || '',
            // Assuming current user info is available in context or props
            // authorName: `${currentUser.firstName} ${currentUser.lastName}`,
            // authorId: currentUser.id,
            // authorUsername: currentUser.username,
            // authorEmail: currentUser.email,
            // authorRole: currentUser.role,
            // authorAvatar: currentUser.avatarUrl,
            // authorPhone: currentUser.phone,
            // authorAddress: currentUser.address,
            // authorJoinedAt: currentUser.joinedAt,
            // authorLastActive: currentUser.lastActive,
            // authorStatus: currentUser.status,
            // authorNotesCount: currentUser.notesCount,
            // authorJobsCount: currentUser.jobsCount,
            createdAt: new Date().toISOString(),
        };
        setFormData(prev => ({
            ...prev,
            notes: [
                ...(prev.notes || []),
                newNote
            ]
        }));
        setNewNoteContent('');
        setShowAddNote(false);
        toast.success("Note added.");
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

    const handleAddItem = (itemType) => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                jobNumber: Date.now(), // temporary ID
                partId: '',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                type: itemType,
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        const currentItem = formData.items[index];
        if (!isEdit && job?.items?.find(item => item.jobNumber === currentItem.jobNumber)) {
            toast.warn('Cannot remove items from an existing order');
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...(formData.items || [])];
        let currentItem = {...updatedItems[index]};

        if (field === 'partId') {
            const selectedPart = parts.find(p => p.id .toString() === value);
            if (selectedPart) {
                currentItem.partId = selectedPart.id;
                currentItem.partName = selectedPart.partName || selectedPart.description;
                currentItem.rate = selectedPart.sellingPrice; // Auto-fill price
            } else {
                currentItem.partId = '';
                currentItem.partName = '';
                currentItem.rate = 0;
            }
        } else {
            currentItem[field] = ['quantity', 'rate'].includes(field) ? parseFloat(value) || 0 : value;
        }

        // Recalculate total cost for the item
        currentItem.totalCost = (currentItem.quantity || 0) * (currentItem.rate || 0);

        updatedItems[index] = currentItem;

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Calculate total cost whenever items change
    useEffect(() => {
        const totalItemsCost = formData.items.reduce((total, item) => {
            return total + (item.totalCost || 0);
        }, 0);
        setFormData(prev => ({ ...prev, cost: totalItemsCost }));
    }, [formData.items]);

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
                    <div className="section-header">
                        <h3>Parts Used</h3>
                        <div className='btn-group'>
                            <button type="button" className="btn-add" onClick={() => handleAddItem('LABOR')}>
                                <FaPlus/> Add Labor
                            </button>
                            <button type="button" className="btn-add" onClick={() => handleAddItem('PART')}>
                                <FaPlus/> Add Part
                            </button>
                        </div>
                    </div>

                    {formData?.items?.length > 0 ? (
                        <div className="order-items-container">
                            {formData.items.map((item, index) => (
                                <div key={item.id} className="order-item-card">
                                    <div className="item-header">
                                        <span className="item-number">{item.type}</span>
                                        {(isEdit || !job?.items?.find(oi => oi.id === item.id)) && (
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
                                            {item.type === 'PART'
                                                ? (
                                                    <>
                                                        <label>Part *</label>
                                                        <select
                                                            value={item.partId || ''}
                                                            onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Part</option>
                                                            {isEdit && item.partName && !parts.some(p => p.id === item.partId) && (
                                                                <option key={item.partId} value={item.partId}>
                                                                    {item.partName}
                                                                </option>
                                                            )}
                                                            {parts.map(part => (
                                                                <option key={part.id} value={part.id}>
                                                                    {part.partName || part.description}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </>
                                                )
                                                : (
                                                    <>
                                                        <label>Labor *</label>
                                                        <input type="text"
                                                               value={item.description || ''}
                                                               onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                               placeholder="Labor description"
                                                               required
                                                        />
                                                    </>
                                                )
                                            }
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
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                    disabled={item.type === 'PART'} // Price is fixed for parts
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
                                <FaRupeeSign className="input-icon"/> Job Estimate *
                            </label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost.toFixed(2)}
                                // onChange={handleChange}
                                // className={errors.cost ? 'error' : ''}
                                // step="0.01"
                                // min="0"
                                disabled
                            />
                            {errors.cost && <span className="error-text">{errors.cost}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className='section-header'>
                        <h2>Job Notes</h2>
                        {!showAddNote && (
                        <button type="button" className="btn-add" onClick={() => setShowAddNote(true)}>
                            <FaPlus/> Add Note
                        </button>
                        )}
                    </div>
                    <div className="notes-list">
                        {formData.notes?.map((note) => (
                            <div key={note.id} className="note-item">
                                <p className="note-content">{note.content}</p>
                                <p className="note-meta">
                                    — {note.authorName} on {formatDate(note.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {showAddNote && (
                        <div className="add-note-area">
                             <textarea
                                placeholder="Add a new note..."
                                rows="3"
                                className="input-field textarea"
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                             />
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowAddNote(false)}
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn-primary" onClick={handleAddNote}>
                                    Post Note
                                </button>
                            </div>
                        </div>
                    )}
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