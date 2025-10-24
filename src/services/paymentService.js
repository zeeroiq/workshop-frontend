import api from './api';

export const paymentService = {
    // createUPIPayment: (paymentData) => {
    //     api.post('/payments/upi/create-order', paymentData)
    // },

    // Create UPI payment with QR code
    createUPIPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/qr/generate', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Verify payment
    verifyPayment: async (verificationData) => {
        try {
            const response = await api.post('/verify', verificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get payment status
    getPaymentStatus: async (orderId) => {
        try {
            const response = await api.get(`/status/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get QR code for existing payment
    getPaymentQR: async (orderId) => {
        try {
            const response = await api.get(`/${orderId}/qr`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Share payment QR
    sharePaymentQR: async (orderId, shareData) => {
        try {
            const response = await api.post(`/${orderId}/share`, shareData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};