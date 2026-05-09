import {toast} from "react-toastify";
import { formatDate, formatDateForInput } from "../helper/utils";

export const handleOrderEditClick = (order, onEdit) => {
    // Only block editing for COMPLETED, CANCELLED, DELIVERED
    const status = order.status.toUpperCase();
    if (['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(status)) {
        toast.warn(`Cannot edit ${order.status.toLowerCase()} order`);
        return;
    }
    onEdit(order);
};


export const isOrderEditable = (order) => {
    // Allow editing for PENDING and ORDERED; only prevent COMPLETED, CANCELLED, DELIVERED
    const status = order.status.toUpperCase();
    const nonEditable = ['COMPLETED', 'CANCELLED', 'DELIVERED'];
    return !nonEditable.includes(status);

};

export { formatDate, formatDateForInput };