import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import VehicleList from './components/vehicles/VehicleList';
import JobList from './components/jobs/JobList';
import JobCalendar from './components/jobs/JobCalendar';
import PartList from './components/inventory/PartList';
import InvoiceList from './components/invoices/InvoiceList';
import FinancialReports from './components/reports/FinancialReports';
import ErrorBoundary from './components/common/ErrorBoundary';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="app">
                    <Header />
                    <div className="app-body">
                        <Sidebar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/customers" element={<CustomerList />} />
                                <Route path="/customers/new" element={<CustomerForm />} />
                                <Route path="/customers/edit/:id" element={<CustomerForm />} />
                                <Route path="/vehicles" element={<VehicleList />} />
                                <Route path="/jobs" element={<JobList />} />
                                <Route path="/calendar" element={<JobCalendar />} />
                                <Route path="/inventory" element={<PartList />} />
                                <Route path="/invoices" element={<InvoiceList />} />
                                <Route path="/reports/financial" element={<FinancialReports />} />
                            </Routes>
                        </main>
                    </div>
                    <ToastContainer position="bottom-right" />
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;