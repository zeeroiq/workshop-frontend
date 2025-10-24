import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
// import './PaymentStatus.css';

const PaymentStatus = ({ orderId }) => {
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);

    const checkPaymentStatus = async () => {
        setLoading(true);
        try {
            const response = await paymentService.getPaymentStatus(orderId);
            setPaymentStatus(response.status);
            setLastChecked(new Date());
        } catch (error) {
            console.error('Failed to check payment status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            checkPaymentStatus();

            // Set up polling for payment status
            const interval = setInterval(checkPaymentStatus, 10000); // Check every 10 seconds

            return () => clearInterval(interval);
        }
    }, [orderId]);

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'CAPTURED':
                return '✅';
            case 'FAILED':
                return '❌';
            case 'PENDING':
                return '⏳';
            default:
                return 'ℹ️';
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'CAPTURED':
                return 'Payment completed successfully!';
            case 'FAILED':
                return 'Payment failed. Please try again.';
            case 'PENDING':
                return 'Waiting for payment...';
            default:
                return 'Checking payment status...';
        }
    };

    return (
        <div className="payment-status-container">
            <h3>Payment Status</h3>

            <div className={`status-indicator ${paymentStatus.toLowerCase()}`}>
                <span className="status-icon">{getStatusIcon()}</span>
                <span className="status-text">{getStatusMessage()}</span>
            </div>

            <div className="status-details">
                <div className="detail-row">
                    <span>Current Status:</span>
                    <span className={`status-badge ${paymentStatus.toLowerCase()}`}>
            {paymentStatus}
          </span>
                </div>

                {lastChecked && (
                    <div className="detail-row">
                        <span>Last Checked:</span>
                        <span>{lastChecked.toLocaleTimeString()}</span>
                    </div>
                )}
            </div>

            <button
                className="refresh-btn"
                onClick={checkPaymentStatus}
                disabled={loading}
            >
                {loading ? 'Checking...' : 'Refresh Status'}
            </button>

            {paymentStatus === 'PENDING' && (
                <div className="pending-instructions">
                    <p>
                        <strong>Note:</strong> Payment status updates automatically.
                        You can also refresh manually or wait for automatic updates.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentStatus;