import React, { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ orderId, onClose, onSubmit }) => {
    const [shareMethod, setShareMethod] = useState('WHATSAPP');
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState(`Please pay using this UPI QR code for order ${orderId}`);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!recipient) {
            alert('Please enter recipient details');
            return;
        }

        onSubmit({
            method: shareMethod,
            recipient,
            message
        });
    };

    const getPlaceholder = () => {
        switch (shareMethod) {
            case 'EMAIL':
                return 'email@example.com';
            case 'SMS':
                return 'Phone number';
            case 'WHATSAPP':
                return 'Phone number with country code';
            default:
                return 'Recipient';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Share Payment QR</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="share-form">
                    <div className="form-group">
                        <label>Share Method</label>
                        <select
                            value={shareMethod}
                            onChange={(e) => setShareMethod(e.target.value)}
                        >
                            <option value="WHATSAPP">WhatsApp</option>
                            <option value="EMAIL">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="LINK">Shareable Link</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Recipient</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder={getPlaceholder()}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="share-submit-btn">
                            Share Payment QR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareModal;