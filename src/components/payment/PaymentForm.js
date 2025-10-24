import React, { useState } from 'react';

const PaymentForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        amount: '',
        upiId: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.amount || !formData.upiId) {
            alert('Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount)
        });
    };

    return (
        <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="amount">Amount (₹)*</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        min="1"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="upiId">Your UPI ID*</label>
                    <input
                        type="text"
                        id="upiId"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                        required
                    />
                    <small className="help-text">
                        Enter your UPI ID to receive payment notifications
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Payment description (optional)"
                        rows="3"
                    />
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Creating Payment...' : 'Generate Payment QR'}
                </button>
            </form>

            <div className="payment-instructions">
                <h3>How to pay:</h3>
                <ol>
                    <li>Fill in the payment details</li>
                    <li>Generate QR code</li>
                    <li>Scan QR code with any UPI app</li>
                    <li>Complete payment in your UPI app</li>
                    <li>Payment will be verified automatically</li>
                </ol>
            </div>
        </div>
    );
};

export default PaymentForm;