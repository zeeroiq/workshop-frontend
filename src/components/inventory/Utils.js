import {toast} from "react-toastify";
import { formatDate, formatDateForInput } from "../helper/utils";

export const handleOrderEditClick = (order, onEdit) => {
    if (order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'CANCELLED' || order.status.toUpperCase() === 'DELIVERED' && order.status.toUpperCase() !== 'PENDING') {
        toast.warn(`Cannot edit ${order.status.toLowerCase()} order`);
        return;
    }
    onEdit(order);
};


export const isOrderEditable = (order) => {
    const status = order.status.toUpperCase();
    const nonEditable = ['COMPLETED', 'CANCELLED', 'DELIVERED'];
    if (nonEditable.includes(status) || status !== 'PENDING') {
        toast.warn(`Cannot edit ${order.status.toLowerCase()} order`);
        return false;
    }
    return true;
};

export { formatDate, formatDateForInput };