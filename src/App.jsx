import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import CustomerDetails from './components/customers/CustomerDetails';
import Login from './components/auth/Login';
import LandingPage from './components/landing/LandingPage';
import MainLayout from './components/common/MainLayout';
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
import Manage from "./components/manage/Manage";
import UserForm from "@/components/workshop/users/UserForm";
import RoleForm from "@/components/workshop/roles/RoleForm";
import Settings from "./components/workshop/Settings";

import {ThemeProvider} from './components/common/ThemeProvider';

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            if (authService.isAuthenticated()) {
                const userData = authService.getUser();
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        
        checkAuth();
        
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const toggleSidebarExpansion = () => {
        setSidebarExpanded((current) => !current);
    };

    const closeSidebar = () => {
        setSidebarExpanded(false);
    };

    if (loading) {
        return (<div className="fixed inset-0 flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>);
    }

    return (
        <>
            <Routes>
                {/* Public routes without layout */}
                <Route path="/login" element={user ? <Navigate to="/" replace/> : <Login/>}/>
                <Route path="/" element={user ? <Navigate to="/dashboard" replace/> : <LandingPage/>}/>

                {/* Protected routes with MainLayout */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <MainLayout 
                            sidebarExpanded={sidebarExpanded} 
                            onToggleSidebar={toggleSidebarExpansion}
                            onCloseSidebar={closeSidebar}
                        >
                            <Routes>
                                <Route path="/dashboard" element={<Dashboard/>}/>
                                <Route path="/customers" element={<CustomerList/>}/>
                                <Route path="/customers/new" element={<CustomerForm/>}/>
                                <Route path="/customers/edit/:id" element={<CustomerForm/>}/>
                                <Route path="/customers/:id" element={<CustomerDetails/>}/>
                                <Route path="/vehicles" element={<VehicleList/>}/>
                                <Route path="/vehicles/new" element={<VehicleForm/>}/>
                                <Route path="/vehicles/edit/:id" element={<VehicleForm/>}/>
                                <Route path="/vehicles/:id" element={<VehicleDetails/>}/>
                                <Route path="/inventory" element={<Inventory/>}/>
                                <Route path="/jobs" element={<Jobs/>}/>
                                <Route path="/jobs/new" element={<JobForm/>}/>
                                <Route path="/invoices" element={<Invoice/>}/>
                                <Route path="/invoices/new" element={<InvoiceForm/>}/>
                                <Route path="/reports" element={<Reports/>}/>
                                <Route path="/manage/users&roles" element={<Manage/>}/>
                                <Route path="/manage/users/new" element={<UserForm/>}/>
                                <Route path="/manage/users/edit/:id" element={<UserForm/>}/>
                                <Route path="/manage/roles/new" element={<RoleForm/>}/>
                                <Route path="/manage/roles/edit/:id" element={<RoleForm/>}/>
                                <Route path="/settings" element={<Settings/>}/>
                                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                            </Routes>
                        </MainLayout>
                    </ProtectedRoute>
                }/>
            </Routes>
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
        </>
    );
}

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;
