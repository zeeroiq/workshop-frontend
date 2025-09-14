import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import './../../styles/Customer.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAll(currentPage, 10, searchTerm);
            // The service now handles the response structure
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
            const message = error.response?.data?.message || 'Failed to delete customer';
            toast.error(message);
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="customer-list">
            <div className="page-header">
                <h1>Customers</h1>
                <Link to="/customers/new" className="btn btn-primary">
                    <FaPlus /> Add New Customer
                </Link>
            </div>

            <div className="search-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search customers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary">
                        <FaSearch /> Search
                    </button>
                </form>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <span>Showing {customers.length} of {totalElements} customers</span>
                </div>

                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Vehicles</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {customers.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="no-data">
                                No customers found
                            </td>
                        </tr>
                    ) : (
                        customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.firstName} {customer.lastName}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.email}</td>
                                <td>{customer.address}</td>
                                <td>{customer.vehicleCount || 0}</td>
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
                    >
                        Previous
                    </button>
                    <span>Page {currentPage + 1} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerList;