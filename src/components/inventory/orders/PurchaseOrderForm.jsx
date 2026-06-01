import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { formatDateForInput, isOrderEditable } from "../Utils";
import api from "@/services/api";
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';

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
    const isOrdered = order?.status === 'ORDERED';
    const canEditOrder = isEditMode ? isOrderEditable(order) : true;
    const canEditItems = canEditOrder && !isOrdered;

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [suppliersRes, partsRes] = await Promise.all([
                    inventoryService.getSuppliers(),
                    inventoryService.getParts({ size: 1000 }) // Fetch more parts to avoid missing items
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
                orderNumber: order.orderNumber || '',
                supplierId: order.supplierId || '',
                orderDate: formatDateForInput(order.orderDate),
                expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate),
                status: order.status || 'PENDING',
                items: (order.items || []).map(item => {
                    const partId = item.partId || item.part?.id || '';
                    return {
                        ...item,
                        partId: partId.toString(),
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0
                    };
                }),
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
        if (isOrdered && name === 'expectedDeliveryDate') return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        if (!canEditItems) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { partId: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (!canEditItems) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        if (!canEditItems) return;
        const updatedItems = formData.items.map((item, i) => {
            if (i === index) {
                const newItem = { ...item, [field]: value };
                if (field === 'partId') {
                    const selectedPart = parts.find(p => p.id.toString() === value);
                    if (selectedPart) {
                        newItem.unitPrice = selectedPart.costPrice;
                        newItem.partName = selectedPart.name;
                        newItem.partNumber = selectedPart.partNumber;
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
                supplierId: formData.supplierId,
                orderDate: formData.orderDate,
                expectedDeliveryDate: formData.expectedDeliveryDate,
                status: formData.status,
                totalAmount: calculateTotal(),
                items: formData.items.map(item => ({
                    id: item.id,
                    partId: parseInt(item.partId, 10),
                    quantity: parseInt(item.quantity, 10),
                    unitPrice: parseFloat(item.unitPrice),
                    totalPrice: parseFloat(item.quantity * item.unitPrice)
                }))
            };

            if (formData.id) {
                apiData.id = formData.id;
                apiData.orderNumber = formData.orderNumber;
            }
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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <FaTimes className="mr-2" /> Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save Order'}
                    </Button>
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
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Order Date *</label>
                            <DatePicker
                                value={formData.orderDate}
                                onChange={(e) => {
                                    if (!isEditMode) {
                                        setFormData(prev => ({ ...prev, orderDate: e.target.value }));
                                    }
                                }}
                                disabled={isEditMode}
                                placeholder="Pick a date"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Expected Delivery *</label>
                            <DatePicker
                                value={formData.expectedDeliveryDate}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }));
                                }}
                                disabled={isOrdered}
                                placeholder="Pick a date"
                            />
                        </div>
                        <Input label="Status" name="status" value={formData.status} onChange={handleInputChange}>
                             <select disabled={!canEditOrder}>
                                <option value="PENDING">Pending</option>
                                <option value="ORDERED">Ordered</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </Input>
                    </div>
                </div>

                <div className="p-5 border border-border rounded-lg">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold">Order Items</h3>
                        {canEditItems && (
                            <Button type="button" size="sm" variant="secondary" onClick={handleAddItem}>
                                <FaPlus className="mr-2" /> Add Item
                            </Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 gap-4 items-start sm:grid-cols-12 sm:items-center">
                                <div className="sm:col-span-5">
                                    <Input label="Part" name="partId" value={item.partId} onChange={(e) => handleItemChange(index, 'partId', e.target.value)} required>
                                        <select disabled={!canEditItems}>
                                            <option value="">Select Part</option>
                                            {parts.map(p => <option key={p.id} value={p.id.toString()}>{p.name} ({p.partNumber})</option>)}
                                            {item.partId && !parts.find(p => p.id.toString() === item.partId) && (
                                                <option value={item.partId}>{item.partName || 'Unknown Part'} ({item.partNumber || item.partId})</option>
                                            )}
                                        </select>
                                    </Input>
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="Quantity" name="quantity" type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required disabled={!canEditItems} />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="Unit Price" name="unitPrice" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} required disabled={!canEditItems} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                                    <p className="mt-2">₹{(item.quantity * item.unitPrice).toFixed(2)}</p>
                                </div>
                                <div className="flex items-end sm:col-span-1">
                                    {canEditItems && (
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveItem(index)} aria-label={`Remove item ${index + 1}`}>
                                            <FaTrash />
                                        </Button>
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
        </div>
    );
};

export default PurchaseOrderForm;
