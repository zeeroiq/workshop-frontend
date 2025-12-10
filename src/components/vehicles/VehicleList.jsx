import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaCar, FaUser } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import '../../styles/Vehicles.css';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchVehicles();
    }, [currentPage]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getAll(currentPage, 10, searchTerm);
            setVehicles(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchVehicles();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) {
            return;
        }

        try {
            await vehicleService.delete(id);
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to delete vehicle');
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="vehicle-list">
            <div className="page-header">
                <div>
                    <h1>Vehicles</h1>
                    <p>Manage your workshop vehicles</p>
                </div>
                <Link to="/vehicles/new" className="btn btn-primary">
                    <FaPlus /> Add New Vehicle
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Vehicles</h2>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">{totalElements} vehicles found</span>
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search vehicles by make, model, license plate, or VIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control"
                            />
                            <button type="submit" className="btn btn-primary">
                                <FaSearch /> Search
                            </button>
                        </div>
                    </form>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Owner</th>
                                <th>VIN</th>
                                <th>License Plate</th>
                                <th>Mileage</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <div className="empty-state">
                                            <FaCar size={48} className="empty-icon" />
                                            <h3>No vehicles found</h3>
                                            <p>Try adjusting your search or add a new vehicle</p>
                                            <Link to="/vehicles/new" className="btn btn-primary">
                                                Add Vehicle
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <tr key={vehicle.id}>
                                        <td>
                                            <div className="vehicle-info">
                                                <div className="vehicle-make-model">
                                                    <strong>{vehicle.make} {vehicle.model}</strong>
                                                    <span>{vehicle.year}</span>
                                                </div>
                                                <div className="vehicle-color">
                                                    <span className="color-badge" style={{ backgroundColor: vehicle.color?.toLowerCase() || '#ccc' }}></span>
                                                    {vehicle.color}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {vehicle.customerName ? (
                                                <Link to={`/customers/${vehicle.customerId}`} className="customer-link">
                                                    <FaUser /> {vehicle.customerName}
                                                </Link>
                                            ) : (
                                                'No owner'
                                            )}
                                        </td>
                                        <td>{vehicle.vin || '-'}</td>
                                        <td>
                                            <span className="license-plate">{vehicle.licensePlate}</span>
                                        </td>
                                        <td>
                                            <span className="mileage">{vehicle.currentMileage?.toLocaleString() || '0'} miles</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/vehicles/${vehicle.id}`}
                                                    className="btn btn-sm btn-info"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <Link
                                                    to={`/vehicles/edit/${vehicle.id}`}
                                                    className="btn btn-sm btn-warning"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    className="btn btn-sm btn-danger"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                            <span>Page {currentPage + 1} of {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages - 1}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="btn btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleList;