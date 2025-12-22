import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import CustomerDetails from './components/customers/CustomerDetails';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import { authService } from './services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import VehicleDetails from "./components/vehicles/VehicleDetails";
import VehicleForm from "./components/vehicles/VehicleForm";
import VehicleList from "./components/vehicles/VehicleList";
import Inventory from "./components/inventory/Inventory";
import Jobs from "./components/jobs/Jobs";
import Invoice from "./components/invoices/Invoice";
import Reports from "./components/reports/Reports";
import JobForm from "./components/jobs/JobForm";
import InvoiceForm from "./components/invoices/InvoiceForm";

import { ThemeProvider } from './components/common/ThemeProvider';

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Removed: setSidebarExpanded(false) on location change to preserve sidebar state.
    }, [location]);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            const userData = authService.getUser();
            setUser(userData);
        }
        setLoading(false);
    }, []);

    const toggleSidebarExpansion = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const closeSidebar = () => {
        setSidebarExpanded(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            {user && <Sidebar isExpanded={sidebarExpanded} onClose={closeSidebar} />}
            <div className="flex flex-col flex-1">
                {user && <Header onToggleSidebar={toggleSidebarExpansion} />}
                <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${user && (sidebarExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20')}`}>
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto pt-16">
                        <Routes>
                            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
                            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
                            <Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                            <Route path="/customers/edit/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                            <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
                            <Route path="/vehicles" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
                            <Route path="/vehicles/new" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
                            <Route path="/vehicles/edit/:id" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
                            <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
                            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                            <Route path="/jobs/new" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
                            <Route path="/invoices" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
                            <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;