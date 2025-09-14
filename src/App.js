import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check if user is logged in on app load
        if (authService.isAuthenticated()) {
            const userData = authService.getUser();
            setUser(userData);
        }

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        setLoading(false);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app" data-theme={theme}>
                {user && <Header onToggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />}
                <div className="app-body">
                    {user && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
                    <main className="main-content">
                        <Routes>
                            <Route
                                path="/login"
                                element={user ? <Navigate to="/" replace /> : <Login />}
                            />
                            <Route
                                path="/register"
                                element={user ? <Navigate to="/" replace /> : <Register />}
                            />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customers"
                                element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                                        <CustomerList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customers/new"
                                element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                                        <CustomerForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customers/edit/:id"
                                element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                                        <CustomerForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customers/:id"
                                element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                                        <CustomerDetails />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Add more routes as needed */}
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
                    theme={theme}
                />
            </div>
        </Router>
    );
}

export default App;