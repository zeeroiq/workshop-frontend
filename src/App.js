// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import { authService } from './services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import DebugInfo from "./components/DebugInfo";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app load
        if (authService.isAuthenticated()) {
            const userData = authService.getUser();
            setUser(userData);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className="app">
                {process.env.NODE_ENV === 'development' && <DebugInfo />}
                {user && <Header />}
                <div className="app-body">
                    {user && <Sidebar />}
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
                            {/* Add more protected routes as needed */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
                <ToastContainer position="bottom-right" />
            </div>
        </Router>
    );
}

export default App;