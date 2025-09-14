import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaCar } from 'react-icons/fa';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import './../../styles/Customer.css';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await customerService.getWithVehicles(id);
            // The service now handles the response structure
            setCustomer(response.data);
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        try {
            await customerService.addNote(id, { content: noteContent });
            toast.success('Note added successfully');
            setNoteContent('');
            fetchCustomer(); // Refresh customer data
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add note';
            toast.error(message);
            console.error('Error adding note:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer deleted successfully');
            navigate('/customers');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete customer';
            toast.error(message);
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <div className="customer-details">
            <div className="page-header">
                <div className="header-actions">
                    <button onClick={() => navigate('/customers')} className="btn btn-secondary">
                        <FaArrowLeft /> Back to Customers
                    </button>
                    <div>
                        <Link to={`/customers/edit/${id}`} className="btn btn-warning">
                            <FaEdit /> Edit
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger">
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
                <h1>{customer.firstName} {customer.lastName}</h1>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === 'details' ? 'active' : ''}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                <button
                    className={activeTab === 'vehicles' ? 'active' : ''}
                    onClick={() => setActiveTab('vehicles')}
                >
                    Vehicles ({customer.vehicles?.length || 0})
                </button>
                <button
                    className={activeTab === 'notes' ? 'active' : ''}
                    onClick={() => setActiveTab('notes')}
                >
                    Notes ({customer.notes?.length || 0})
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'details' && (
                    <div className="details-section">
                        <div className="detail-row">
                            <label>Phone:</label>
                            <span>{customer.phone}</span>
                        </div>
                        <div className="detail-row">
                            <label>Email:</label>
                            <span>{customer.email || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Address:</label>
                            <span>{customer.address || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Registered:</label>
                            <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'vehicles' && (
                    <div className="vehicles-section">
                        {customer.vehicles && customer.vehicles.length > 0 ? (
                            <div className="vehicles-list">
                                {customer.vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="vehicle-card">
                                        <div className="vehicle-icon">
                                            <FaCar />
                                        </div>
                                        <div className="vehicle-info">
                                            <h4>{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
                                            <p>License: {vehicle.licensePlate}</p>
                                            <p>VIN: {vehicle.vin}</p>
                                            <p>Mileage: {vehicle.currentMileage || 'N/A'}</p>
                                        </div>
                                        <div className="vehicle-actions">
                                            <Link to={`/vehicles/${vehicle.id}`} className="btn btn-sm btn-info">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data">
                                <p>No vehicles registered for this customer</p>
                                <Link to="/vehicles/new" className="btn btn-primary">
                                    <FaPlus /> Add Vehicle
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="notes-section">
                        <form onSubmit={handleAddNote} className="note-form">
              <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note about this customer..."
                  rows="3"
              />
                            <button type="submit" className="btn btn-primary">
                                Add Note
                            </button>
                        </form>

                        <div className="notes-list">
                            {customer.notes && customer.notes.length > 0 ? (
                                customer.notes.map(note => (
                                    <div key={note.id} className="note-card">
                                        <p>{note.content}</p>
                                        <small>{new Date(note.createdAt).toLocaleString()}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No notes yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;