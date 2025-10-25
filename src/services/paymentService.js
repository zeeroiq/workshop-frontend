import api from './api';

const SERVICE_BASE = '/payments';
export const paymentService = {
    createOrder : (data) => {
        const {amount, currency, receipt} = data;
        return api.post(`${SERVICE_BASE}/create-order`, {
            amount,
            currency,
            receipt
        }).then(response => {
            if (response?.data?.success) {
                return {
                    ...response,
                    data: response.data.data
                };
            }
            return response;
        });
    },

    initiateUPIPayment : (data) => {
        const {customerId, amount, transactionNote} = data;
        return api.post(`${SERVICE_BASE}/upi/create-order`, {
            customerId,
            amount,
            transactionNote
        }).then(response => {
            if (response?.data?.success) {
                return {
                    ...response,
                    data: response.data.data
                };
            }
            return response;
        });
    }
}