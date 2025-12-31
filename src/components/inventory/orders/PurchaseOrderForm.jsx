import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { formatDateForInput, isOrderEditable } from "../Utils";
import api from "@/services/api";

const Input = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        {children ? 
            React.cloneElement(children, {
                className: "w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
                ...props
            }) :
            <input className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" {...props} />
        }
    </div>
);

const PurchaseOrderForm = ({ order, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        orderNumber: '',
        supplierId: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        items: [],
        status: 'PENDING'
    });
    const [suppliers, setSuppliers] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(order?.id);
    const canEditOrder = isEditMode ? isOrderEditable(order) : true;

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [suppliersRes, partsRes] = await Promise.all([
                    inventoryService.getSuppliers(),
                    inventoryService.getParts()
                ]);
                if (suppliersRes?.data?.success) {
                    setSuppliers(suppliersRes.data.content || suppliersRes.data);
                }
                if (partsRes?.data?.success) {
                    setParts(partsRes.data.content || partsRes.data);
                }
            } catch (error) {
                toast.error("Failed to load necessary data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []); // Run only once

    useEffect(() => {
        if (order) {
            setFormData({
                ...order,
                orderDate: formatDateForInput(order.orderDate),
                expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate),
                items: order.items || []
            });
        } else {
            // Reset form for new order
            setFormData({
                orderNumber: '',
                supplierId: '',
                orderDate: new Date().toISOString().split('T')[0],
                expectedDeliveryDate: '',
                items: [],
                status: 'PENDING'
            });
        }
    }, [order]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (isEditMode && ['orderNumber', 'supplierId', 'orderDate'].includes(name)) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { partId: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = formData.items.map((item, i) => {
            if (i === index) {
                const newItem = { ...item, [field]: value };
                if (field === 'partId') {
                    const selectedPart = parts.find(p => p.id.toString() === value);
                    if (selectedPart) {
                        newItem.unitPrice = selectedPart.costPrice;
                    }
                }
                return newItem;
            }
            return item;
        });
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiData = {
                ...formData,
                totalAmount: calculateTotal(),
                items: formData.items.map(item => ({
                    ...item,
                    partId: parseInt(item.partId),
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.unitPrice),
                    totalPrice: parseFloat(item.quantity * item.unitPrice)
                }))
            };
            const method = formData.id ? 'PUT' : 'POST';
            const url = formData.id
                ? `/inventory/purchase-orders/${formData.id}/items`
                : '/inventory/purchase-orders';
            // if (isEditMode) {
            //     await inventoryService.updatePurchaseOrder(order.id, apiData);
            //     toast.success("Purchase order updated successfully!");
            // } else {
            //     await inventoryService.createPurchaseOrder(apiData);
            //     toast.success("Purchase order created successfully!");
            // }
            // onSave();
            const response = await api[method.toLowerCase()](url, apiData);
            if (response?.data?.success) {
                // todo: update it so that post update/create it should opens up detail page instead of going back to list
                // const submittedOrder = response.data;
                // setFormData({
                //     ...submittedOrder,
                //     orderDate: formatDateForInput(submittedOrder.orderDate),
                //     expectedDeliveryDate: formatDateForInput(submittedOrder.expectedDeliveryDate)
                // });
                toast.success('Order ' + formData.orderNumber + ' saved successfully!');
                onSave();
            } else {
                console.error('Failed to save purchase order:', response?.data?.message);
                toast.error('Failed to save purchase order - ' + response?.data?.message);
            }
        } catch (error) {
            console.error('Error saving purchase order:', error);
            toast.error(error.response?.data?.message || "Failed to save order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
                <div className="flex space-x-2">
                    <button className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md flex items-center" onClick={onCancel}>
                        <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={handleSubmit} disabled={loading}>
                        <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input label="Order Number" name="orderNumber" value={formData.orderNumber} disabled placeholder="Auto-generated" />
                        <Input label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleInputChange} disabled={isEditMode} required>
                            <select>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </Input>
                        <Input label="Order Date" name="orderDate" type="date" value={formData.orderDate} onChange={handleInputChange} disabled={isEditMode} required />
                        <Input label="Expected Delivery" name="expectedDeliveryDate" type="date" value={formData.expectedDeliveryDate} onChange={handleInputChange} required />
                        <Input label="Status" name="status" value={formData.status} onChange={handleInputChange}>
                             <select>
                                <option value="PENDING">Pending</option>
                                <option value="ORDERED">Ordered</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </Input>
                    </div>
                </div>

                <div className="p-5 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Order Items</h3>
                        {canEditOrder && (
                            <button type="button" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 rounded-md flex items-center text-sm" onClick={handleAddItem}>
                                <FaPlus className="mr-2" /> Add Item
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5">
                                    <Input label="Part" name="partId" value={item.partId} onChange={(e) => handleItemChange(index, 'partId', e.target.value)} required>
                                        <select disabled={!canEditOrder}>
                                            <option value="">Select Part</option>
                                            {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.partNumber})</option>)}
                                        </select>
                                    </Input>
                                </div>
                                <div className="col-span-2">
                                    <Input label="Quantity" name="quantity" type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required disabled={!canEditOrder} />
                                </div>
                                <div className="col-span-2">
                                    <Input label="Unit Price" name="unitPrice" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} required disabled={!canEditOrder} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                                    <p className="mt-2">₹{(item.quantity * item.unitPrice).toFixed(2)}</p>
                                </div>
                                <div className="col-span-1 flex items-end">
                                    {canEditOrder && (
                                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveItem(index)}>
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {formData.items.length === 0 && <p className="text-muted-foreground text-center py-4">No items in this order.</p>}
                </div>

                <div className="flex justify-end">
                    <div className="text-right">
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">₹{calculateTotal().toFixed(2)}</p>
                    </div>
                </div>
            </form>


            <div className="flex justify-end items-center mb-6">
                <div className="flex space-x-2">
                    <button className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md flex items-center" onClick={onCancel}>
                        <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={handleSubmit} disabled={loading}>
                        <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderForm;
