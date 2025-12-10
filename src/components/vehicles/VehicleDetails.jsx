import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaCar, FaUser, FaHistory, FaStickyNote, FaCog } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import '../../styles/Vehicles.css';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [noteContent, setNoteContent] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    const fetchVehicle = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getById(id);
            setVehicle(response.data);

            if (activeTab === 'history') {
                fetchVehicleHistory();
            }
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
            console.error('Error fetching vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleHistory = async () => {
        try {
            const response = await vehicleService.getHistory(id);
            setHistory(response.data.serviceRecords || []);
        } catch (error) {
            console.error('Error fetching vehicle history:', error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        try {
            await vehicleService.addNote(id, { content: noteContent });
            toast.success('Note added successfully');
            setNoteContent('');
            fetchVehicle(); // Refresh vehicle data
        } catch (error) {
            toast.error('Failed to add note');
            console.error('Error adding note:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) {
            return;
        }

        try {
            await vehicleService.delete(id);
            toast.success('Vehicle deleted successfully');
            navigate('/vehicles');
        } catch (error) {
            toast.error('Failed to delete vehicle');
            console.error('Delete error:', error);
        }
    };

    const handleUpdateMileage = async () => {
        const newMileage = prompt('Enter new mileage:', vehicle.currentMileage);
        if (newMileage === null) return;

        try {
            await vehicleService.updateMileage(id, parseInt(newMileage));
            toast.success('Mileage updated successfully');
            fetchVehicle();
        } catch (error) {
            toast.error('Failed to update mileage');
            console.error('Error updating mileage:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!vehicle) {
        return <div>Vehicle not found</div>;
    }

    return (
        <div className="vehicle-details">
            <div className="page-header">
                <div className="header-actions">
                    <button onClick={() => navigate('/vehicles')} className="btn btn-secondary">
                        <FaArrowLeft /> Back to Vehicles
                    </button>
                    <div>
                        <Link to={`/vehicles/edit/${id}`} className="btn btn-warning">
                            <FaEdit /> Edit
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger">
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
                <h1>{vehicle.make} {vehicle.model} ({vehicle.year})</h1>
                <p className="vehicle-subtitle">License: {vehicle.licensePlate} | VIN: {vehicle.vin || 'N/A'}</p>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === 'details' ? 'active' : ''}
                    onClick={() => setActiveTab('details')}
                >
                    <FaCar /> Details
                </button>
                <button
                    className={activeTab === 'history' ? 'active' : ''}
                    onClick={() => {
                        setActiveTab('history');
                        fetchVehicleHistory();
                    }}
                >
                    <FaHistory /> Service History
                </button>
                <button
                    className={activeTab === 'notes' ? 'active' : ''}
                    onClick={() => setActiveTab('notes')}
                >
                    <FaStickyNote /> Notes ({vehicle.notes?.length || 0})
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'details' && (
                    <div className="details-section">
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Make & Model</label>
                                <span>{vehicle.make} {vehicle.model}</span>
                            </div>
                            <div className="detail-item">
                                <label>Year</label>
                                <span>{vehicle.year}</span>
                            </div>
                            <div className="detail-item">
                                <label>Color</label>
                                <span>
                  <span className="color-badge" style={{ backgroundColor: vehicle.color?.toLowerCase() || '#ccc' }}></span>
                                    {vehicle.color || 'N/A'}
                </span>
                            </div>
                            <div className="detail-item">
                                <label>License Plate</label>
                                <span className="license-plate">{vehicle.licensePlate}</span>
                            </div>
                            <div className="detail-item">
                                <label>VIN</label>
                                <span>{vehicle.vin || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Mileage</label>
                                <span>
                  {vehicle.currentMileage?.toLocaleString() || '0'} miles
                  <button onClick={handleUpdateMileage} className="btn btn-sm btn-link">
                    <FaCog /> Update
                  </button>
                </span>
                            </div>
                            <div className="detail-item">
                                <label>Engine Type</label>
                                <span>{vehicle.engineType || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Registered</label>
                                <span>{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {vehicle.customerId && (
                            <div className="owner-section">
                                <h3>Owner Information</h3>
                                <div className="owner-card">
                                    <div className="owner-icon">
                                        <FaUser />
                                    </div>
                                    <div className="owner-info">
                                        <h4>{vehicle.customerName}</h4>
                                        <p>{vehicle.customerPhone} {vehicle.customerEmail && `• ${vehicle.customerEmail}`}</p>
                                        <p>{vehicle.customerAddress}</p>
                                    </div>
                                    <div className="owner-actions">
                                        <Link to={`/customers/${vehicle.customerId}`} className="btn btn-sm btn-info">
                                            View Customer
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-section">
                        {history.length > 0 ? (
                            <div className="history-list">
                                {history.map(record => (
                                    <div key={record.jobId} className="history-item">
                                        <div className="history-date">
                                            {new Date(record.serviceDate).toLocaleDateString()}
                                        </div>
                                        <div className="history-details">
                                            <h4>{record.serviceType}</h4>
                                            <p>{record.description}</p>
                                            <div className="history-meta">
                                                <span>Mileage: {record.mileage?.toLocaleString() || 'N/A'}</span>
                                                <span>Cost: ${record.cost || '0'}</span>
                                                {record.mechanicName && <span>Mechanic: {record.mechanicName}</span>}
                                            </div>
                                        </div>
                                        <div className={`history-status ${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FaHistory size={48} />
                                <h3>No service history</h3>
                                <p>This vehicle hasn't had any services yet</p>
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
                  placeholder="Add a note about this vehicle..."
                  rows="3"
                  className="form-control"
              />
                            <button type="submit" className="btn btn-primary">
                                Add Note
                            </button>
                        </form>

                        <div className="notes-list">
                            {vehicle.notes && vehicle.notes.length > 0 ? (
                                vehicle.notes.map(note => (
                                    <div key={note.id} className="note-card">
                                        <p>{note.content}</p>
                                        <small>{new Date(note.createdAt).toLocaleString()}</small>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <FaStickyNote size={48} />
                                    <h3>No notes yet</h3>
                                    <p>Add your first note about this vehicle</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleDetails;