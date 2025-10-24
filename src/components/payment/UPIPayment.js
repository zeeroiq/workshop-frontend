import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentService } from '../../services/paymentService';
import PaymentForm from './PaymentForm';
import QRDisplay from './QRDisplay';
import PaymentStatus from './PaymentStatus';
import ShareModal from './ShareModal';
import './UPIPayment.css';

const UPIPayment = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);

    const handlePaymentCreate = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await paymentService.createUPIPayment({
                amount: formData.amount,
                upiId: formData.upiId,
                description: formData.description,
                merchantVPA: 'your-merchant@upi' // Replace with actual merchant UPI
            });

            if (response.success) {
                setPaymentData(response.data);
                setCurrentOrderId(response.data.payment.orderId);
            } else {
                setError(response.error || 'Failed to create payment');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleShareSubmit = async (shareData) => {
        try {
            await paymentService.sharePaymentQR(currentOrderId, shareData);
            alert('Payment QR shared successfully!');
            setShowShareModal(false);
        } catch (err) {
            setError(err.message || 'Failed to share payment QR');
        }
    };

    const handleNewPayment = () => {
        setPaymentData(null);
        setCurrentOrderId(null);
        setError(null);
    };

    return (
        <div className="upi-payment-container">
            <div className="payment-header">
                <h1>UPI Payment Gateway</h1>
                <p>Secure and fast UPI payments with QR code</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!paymentData ? (
                <PaymentForm
                    onSubmit={handlePaymentCreate}
                    loading={loading}
                />
            ) : (
                <div className="payment-result">
                    <div className="result-header">
                        <h2>Payment Created Successfully!</h2>
                        <button
                            className="new-payment-btn"
                            onClick={handleNewPayment}
                        >
                            Create New Payment
                        </button>
                    </div>

                    <div className="payment-details">
                        <div className="details-section">
                            <h3>Payment Details</h3>
                            <div className="detail-item">
                                <span>Order ID:</span>
                                <span>{paymentData.payment.orderId}</span>
                            </div>
                            <div className="detail-item">
                                <span>Amount:</span>
                                <span>₹{paymentData.payment.amount}</span>
                            </div>
                            <div className="detail-item">
                                <span>Status:</span>
                                <span className={`status-${paymentData.payment.status.toLowerCase()}`}>
                  {paymentData.payment.status}
                </span>
                            </div>
                            <div className="detail-item">
                                <span>UPI ID:</span>
                                <span>{paymentData.payment.upiId}</span>
                            </div>
                        </div>

                        <QRDisplay
                            qrData={paymentData.qrCode}
                            upiString={paymentData.upiString}
                            orderId={paymentData.payment.orderId}
                            onShare={handleShare}
                        />

                        <PaymentStatus
                            orderId={paymentData.payment.orderId}
                        />
                    </div>
                </div>
            )}

            {showShareModal && (
                <ShareModal
                    orderId={currentOrderId}
                    onClose={() => setShowShareModal(false)}
                    onSubmit={handleShareSubmit}
                />
            )}
        </div>
    );
};

export default UPIPayment;