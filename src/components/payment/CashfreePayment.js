import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import QRDisplay from './QRDisplay';
import PaymentStatus from './PaymentStatus';
import PaymentForm from "./PaymentForm";

const CashfreePayment = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUPIPayment = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await paymentService.createUPIPayment({
                orderId: `ORDER_${Date.now()}`,
                amount: formData.amount,
                upiId: formData.upiId,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                description: formData.description
            });

            if (response.success) {
                setPaymentData(response);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Payment creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cashfree-payment-container">
            <h2>Cashfree UPI Payment</h2>

            {!paymentData ? (
                <PaymentForm
                    onSubmit={handleUPIPayment}
                    loading={loading}
                />
            ) : (
                <div className="payment-result">
                    <QRDisplay
                        qrCode={paymentData.qrCode.split(",")[1]} // Extract base64 part
                        upiIntentUrl={paymentData.upiIntentUrl}
                        orderId={paymentData.orderId}
                    />
                    <PaymentStatus
                        orderId={paymentData.orderId}
                    />
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CashfreePayment;