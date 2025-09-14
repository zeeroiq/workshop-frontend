import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import DebugInfo from './components/DebugInfo';
import ErrorBoundary from './components/common/ErrorBoundary';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="app">
                    {process.env.NODE_ENV === 'development' && <DebugInfo />}
                    <Header />
                    <div className="app-body">
                        <Sidebar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/customers" element={<CustomerList />} />
                                <Route path="/customers/new" element={<CustomerForm />} />
                                <Route path="/customers/edit/:id" element={<CustomerForm />} />
                                {/* Add more routes as needed */}
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