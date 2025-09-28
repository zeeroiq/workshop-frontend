import React, {useState, useEffect} from 'react';
import {
    FaSave,
    FaTimes,
    FaPlus,
    FaMinus,
    FaBox,
    FaRupeeSign
} from 'react-icons/fa';
import {inventoryService} from "../../../services/inventoryService";
import './../../../styles/inventory/order/PurchaseOrderForm.css';
import {toast} from "react-toastify";
import api from "../../../services/api";
import {formatDateForInput, isOrderEditable} from "../Utils";

const PurchaseOrderForm = ({order, onSave, onCancel}) => {
    const [formData, setFormData] = useState({
        orderNumber: '',
        supplierId: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        parts: [],
        status: 'PENDING'
    });
    const [suppliers, setSuppliers] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(order?.id);
    const canEditOrder = isEditMode ? isOrderEditable(order) : true;

    useEffect(() => {
        if (order) {
            setFormData({
                ...order,
                orderDate: formatDateForInput(order.orderDate),
                expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate)
            });
        }
        fetchSuppliers();
        fetchParts();
    }, [order]);

    const fetchSuppliers = async () => {
        try {
            const response = await inventoryService.getSuppliers();
            if (response?.data?.success && response.data.data) {
                setSuppliers(response.data.data);
            } else {
                toast.warn('Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error('Error fetching suppliers - ', error.message);
        }
    };

    const fetchParts = async () => {
        try {
            const response = await inventoryService.getParts();
            if (response?.data?.success && response.data.data?.content) { // todo: api returns a pageable response, handle it later
                setParts(response.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching parts:', error);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (isEditMode && (name === 'orderNumber' || name === 'supplierId')) {
            return; // Prevent changes to orderNumber and supplierId in edit mode
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            parts: [...prev.parts, {
                id: Date.now(), // temporary ID
                partId: '',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        const currentItem = formData.parts[index];
        if (!canEditOrder && order.parts.find(item => item.id === currentItem.id)) {
            toast.warn('Cannot remove items from an existing order');
            return;
        }
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.parts];
        const numericValue = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) : value;

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: numericValue
        };

        // Calculate totalPrice if quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
        }

        setFormData(prev => ({
            ...prev,
            parts: updatedItems
        }));
    };

    const calculateTotal = () => {
        return formData.parts.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = formData.id ? 'PUT' : 'POST';
            const url = formData.id
                ? `/inventory/purchase-orders/${formData.id}/items`
                : '/inventory/purchase-orders';

            // Prepare data for API
            const apiData = {
                ...formData,
                orderDate: formData.orderDate,
                expectedDeliveryDate: formData.expectedDeliveryDate,
                totalAmount: calculateTotal() // should not be needed as backend calculates it, but just in case
            };

            const response = await api[method.toLowerCase()](url, apiData);
            if (response?.data?.success) {
                // todo: update it so that post update/create it should opens up detail page instead of going back to list
                // const submittedOrder = response.data.data;
                // setFormData({
                //     ...submittedOrder,
                //     orderDate: formatDateForInput(submittedOrder.orderDate),
                //     expectedDeliveryDate: formatDateForInput(submittedOrder.expectedDeliveryDate)
                // });

                onSave();
            } else {
                console.error('Failed to save purchase order:', result.message);
                toast.error('Failed to save purchase order - ' + result.message);
            }
        } catch (error) {
            console.error('Error saving purchase order:', error);
            if (error.response?.data?.message) {
                console.error(error.response.data.message);
            }
            toast.error('Error saving purchase order - ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="purchase-order-form">
            <div className="form-header">
                <h2>{formData.id ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
                <div className="form-actions">
                    <button className="btn-secondary" onClick={onCancel}>
                        <FaTimes/> Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        <FaSave/> {loading ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
                <div className="form-section">
                    <h3>Order Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Order Number *</label>
                            <input
                                type="text"
                                name="orderNumber"
                                value={formData.orderNumber}
                                onChange={handleInputChange}
                                required
                                placeholder={!isEditMode ? "AUTO GENERATED" : "e.g., PO-2023-1001"}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Supplier *</label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleInputChange}
                                required
                                disabled={isEditMode}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Order Date *</label>
                            <input
                                type="date"
                                name="orderDate"
                                value={formData.orderDate || ''}
                                onChange={handleInputChange}
                                required
                                disabled={isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Expected Delivery Date *</label>
                            <input
                                type="date"
                                name="expectedDeliveryDate"
                                value={formData.expectedDeliveryDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="ORDERED">Ordered</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h3>Order Items</h3>
                        <button type="button" className="btn-secondary" onClick={handleAddItem}>
                            <FaPlus/> Add Item
                        </button>
                    </div>

                    {formData.parts.length > 0 ? (
                        <div className="order-items-container">
                            {formData.parts.map((item, index) => (
                                <div key={item.id} className="order-item-card">
                                    <div className="item-header">
                                        <span className="item-number">Item #{index + 1}</span>
                                        {(canEditOrder || !order.parts.find(oi => oi.id === item.id)) && (
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveItem(index)}
                                                title="Remove item"
                                            >
                                                <FaMinus/>
                                            </button>
                                        )}
                                    </div>
                                    {/* TODO: might need to restrict update to existing items as well. we'll keep it for now*/}
                                    <div className="item-form-grid">
                                        <div className="form-group">
                                            <label>Part *</label>
                                            <select
                                                value={item.partId}
                                                onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Part</option>
                                                {parts.map(part => (
                                                    <option key={part.id} value={part.id}>
                                                        {part.name} ({part.partNumber})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Quantity *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Unit Price (₹) *</label>
                                            <div className="price-input-flex-container">
                                                <FaRupeeSign className="price-flex-icon"/>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="item-total">
                                            <label>Total</label>
                                            <div className="total-amount">
                                                <FaRupeeSign className="price-icon"/>
                                                <span>{(item.quantity * item.unitPrice).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-items-placeholder">
                            <FaBox className="placeholder-icon"/>
                            <p>No items added to this order</p>
                            <button type="button" className="btn-secondary" onClick={handleAddItem}>
                                <FaPlus/> Add Your First Item
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3>Order Summary</h3>
                    <div className="order-summary">
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>&#8377;{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </form>


            <div className="form-footer">
                <div className="form-actions">
                    <button className="btn-secondary" onClick={onCancel}>
                        <FaTimes/> Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        <FaSave/> {loading ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderForm;