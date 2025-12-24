
export const INVOICE_STATUS = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED'
};

export const PAYMENT_METHODS = [
    'CASH',
    // 'CREDIT_CARD',
    // 'DEBIT_CARD',
    // 'BANK_TRANSFER',
    // 'CHECK',
    'UPI'
];

export const INVOICE_STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft', color: '#9e9e9e' },
    { value: 'SENT', label: 'Sent', color: '#2196f3' },
    { value: 'PAID', label: 'Paid', color: '#4caf50' },
    { value: 'PARTIALLY_PAID', label: 'Partially Paid', color: '#af814c' },
    { value: 'OVERDUE', label: 'Overdue', color: '#f44336' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#607d8b' }
];