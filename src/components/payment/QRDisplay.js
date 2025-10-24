import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../styles/payment/QRDisplay.css';

const QRDisplay = ({ qrData, upiString, orderId, onShare, amount }) => {
    const qrRef = useRef();

    const downloadQRAsPNG = async () => {
        if (qrRef.current) {
            const canvas = await html2canvas(qrRef.current);
            const pngUrl = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `upi-payment-${orderId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const downloadQRAsPDF = async () => {
        if (qrRef.current) {
            const canvas = await html2canvas(qrRef.current);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`upi-payment-${orderId}.pdf`);
        }
    };

    const copyUPILink = () => {
        navigator.clipboard.writeText(upiString)
            .then(() => alert('UPI link copied to clipboard!'))
            .catch(err => console.error('Failed to copy: ', err));
    };

    return (
        <div className="qr-display-container">
            <div className="qr-section">
                <h3>Scan QR Code to Pay</h3>

                <div ref={qrRef} className="qr-code-wrapper">
                    {/*
                      Priority 1: Render the base64 image from the API if it exists.
                      The full data URI (e.g., "data:image/png;base64,...") is the correct value for the src attribute.
                    */}
                    {qrData?.startsWith('data:image/') ? (
                        <img src={qrData} alt={`UPI QR Code for Order ${orderId}`} className="qr-image" />
                    ) : (
                        /* Fallback: Generate QR code from UPI string if base64 is not provided */
                        <QRCodeSVG
                            value={upiString}
                            size={256}
                            level="H"
                            includeMargin={true}
                        />
                    )}
                    <div className="qr-overlay">
                        <div className="payment-text">Scan to Pay</div>
                        <div className="order-id">Order ID: {orderId}</div>
                    </div>
                </div>

                <div className="qr-actions">
                    <button
                        className="action-btn primary"
                        onClick={downloadQRAsPNG}
                    >
                        Download PNG
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={downloadQRAsPDF}
                    >
                        Download PDF
                    </button>
                    <button
                        className="action-btn tertiary"
                        onClick={copyUPILink}
                    >
                        Copy UPI Link
                    </button>
                    <button
                        className="action-btn share"
                        onClick={onShare}
                    >
                        Share
                    </button>
                </div>

                <div className="upi-instructions">
                    <h4>How to pay with QR:</h4>
                    <ul>
                        <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                        <li>Tap on "Scan QR Code"</li>
                        <li>Point camera at this QR code</li>
                        <li>Verify amount and confirm payment</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QRDisplay;