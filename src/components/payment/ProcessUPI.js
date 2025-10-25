import React, {useEffect, useState} from 'react';
import {QRCodeCanvas, QRCodeSVG} from "qrcode.react";
import {paymentService} from "../../services/paymentService";
import {toast} from "react-toastify";
//
//         if (!validateForm()) return;
//
//         // If UPI is selected, generate QR code data
//         if (formData.paymentMethod === 'UPI') {
//             const upiData = `upi://pay?pa=merchant@upi&pn=MerchantName&am=${formData.amount}&cu=INR&tn=Payment for Invoice ${formData.invoiceNumber}`;
//             setQRData(upiData);
//         } else {
//             // For other payment methods, directly save the payment
//             onSave(formData);
//         }
//     };
//
//     return (
//         <form onSubmit={handleSubmit}>
//             {/* Form fields for invoiceNumber, amount, paymentDate, paymentMethod, reference, notes */}
//
//             {upiPaymentFlow && QRData && (
//                 <div>
//                     <h3>Scan this UPI QR Code to Pay</h3>
//                     <QRCodeSVG value={QRData} size={200} />
//                 </div>
//             )}
//
//             <button type="submit">Submit Payment</button>
//             <button type="button" onClick={onCancel}>Cancel</button>
//         </form>
//     );
// };
//
// export default PaymentForm;import { QRCodeSVG } from 'qrcode.react';

// Component to process UPI payments
const ProcessUPI = ({customerId, amount, merchantVPA, merchantName, transactionNote}) => {
    //
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        initiateUPI({customerId, amount, transactionNote})
    }, []);

    const initiateUPI = async (param) => {
        try {
            const response = await paymentService.initiateUPIPayment(param);
            if (response.status === 200 && response?.data?.success) {
                setOrderData(response.data);
                console.log('UPI Payment Order Created:', response.data);
            } else {
                toast.error("Failed to initiate UPI payment. Please try again.");
            }
        } catch (error) {
            console.error('Error initiating UPI payment:', error);
        }
    };

    // Generate UPI payment link
    const upiLink = `upi://pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    return (
        orderData?.qrCode ? (
            <div>
                <h2>UPI Payment</h2>
                <p>Please scan the QR code below to complete your payment of ₹{amount}.</p>
                <img src={orderData.qrCode} alt={`UPI QR Code for Order ${orderData.orderId}`}/>
                <p>Or use the following UPI ID: <strong>{merchantVPA}</strong></p>
            </div>
        ) : (
            orderData?.upiIntentUrl && (
                <div>
                    <h2>UPI Payment</h2>
                    <p>Please scan the QR code below to complete your payment of ₹{amount}.</p>
                    <QRCodeSVG value={orderData.upiIntentUrl} size={250}/>
                    <p>Or use the following UPI ID: <strong>{merchantVPA}</strong></p>
                </div>
            )
        )
    );
};

export default ProcessUPI;