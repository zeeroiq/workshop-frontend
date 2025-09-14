import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    useEffect(() => {
        fetchCustomers();
    }, [currentPage]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAll(currentPage, 10);
            setCustomers(response.data.data.content);
            setTotalPages(response.data.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchCustomers();
            return;
        }

        try {
            setLoading(true);
            const response = await customerService.search(searchTerm);
            setCustomers(response.data.data);
            setTotalPages(1);
        } catch (error) {
            toast.error('Search failed');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
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
                <h1>Customers</h1>
                <Link to="/customers/new" className="btn btn-primary">
                    Add New Customer
                </Link>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="btn btn-secondary">
                    Search
                </button>
            </div>

            <div className="table-container">
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
                                    <Link
                                        to={`/customers/edit/${customer.id}`}
                                        className="btn btn-sm btn-info"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Delete
                                    </button>
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