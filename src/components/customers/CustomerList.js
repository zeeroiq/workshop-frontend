import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
// import './../../styles/Customer.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAll(currentPage, 10, searchTerm);
            setCustomers(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchCustomers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to delete customer');
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="customer-list">
            <div className="page-header">
                <div>
                    <h1>Customers</h1>
                    <p>Manage your workshop customers</p>
                </div>
                <Link to="/customers/new" className="btn btn-primary">
                    <FaPlus /> Add New Customer
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Customers</h2>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-secondary">
                            <FaFilter /> Filter
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search customers by name or phone..."
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
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Vehicles</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        <div className="empty-state">
                                            <h3>No customers found</h3>
                                            <p>Try adjusting your search or add a new customer</p>
                                            <Link to="/customers/new" className="btn btn-primary">
                                                Add Customer
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="customer-name">
                                                <strong>{customer.firstName} {customer.lastName}</strong>
                                            </div>
                                        </td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.email || '-'}</td>
                                        <td>
                                            <span className="badge bg-secondary">{customer.vehicleCount || 0}</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/customers/${customer.id}`}
                                                    className="btn btn-sm btn-info"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <Link
                                                    to={`/customers/edit/${customer.id}`}
                                                    className="btn btn-sm btn-warning"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
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

export default CustomerList;