import React from 'react';
import {
    FaArrowLeft,
    FaBoxOpen,
    FaCheckCircle,
    FaEdit,
    FaPrint,
    FaTimesCircle
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


import {formatDate, handleOrderEditClick} from "../Utils";



const PurchaseOrderDetails = ({order, onBack, onEdit}) => {

    if (!order) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-between mb-6">
                    <Button onClick={onBack} variant="outline">
                        <FaArrowLeft className="mr-2" /> Back to Orders
                    </Button>
                    <h2 className="text-2xl font-bold">Orders Details</h2>
                </div>
                <Card>
                    <CardContent className="p-4 text-center">
                        No Order Selected
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        let variant;
        let icon;
        switch (status) {
            case 'COMPLETED':
                variant = 'success';
                icon = <FaCheckCircle className="mr-1" />;
                break;
            case 'ORDERED':
                variant = 'info';
                icon = <FaBoxOpen className="mr-1" />;
                break;
            case 'CANCELLED':
                variant = 'destructive';
                icon = <FaTimesCircle className="mr-1" />;
                break;
            default:
                variant = 'secondary';
                icon = null;
        }
        return (
            <Badge variant={variant} className="flex items-center">
                {icon} {status}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <Button onClick={onBack} variant="outline">
                    <FaArrowLeft className="mr-2" /> Back to List
                </Button>
                <h2 className="text-2xl font-bold">Purchase Order Details</h2>
                <div className="flex space-x-2">
                    <Button onClick={() => handleOrderEditClick(order, onEdit)} variant="outline">
                        <FaEdit className="mr-2" /> Edit
                    </Button>
                    <Button variant="outline">
                        <FaPrint className="mr-2" /> Print
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Number:</span>
                            <span>{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Date:</span>
                            <span>{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Delivery Date:</span>
                            <span>{formatDate(order.expectedDeliveryDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Received Date:</span>
                            <span>{formatDate(order.receivedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span>{getStatusBadge(order.status)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span>{order.supplierName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Supplier ID:</span>
                            <span>{order.supplierId}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span>₹ {order.totalAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part Name</TableHead>
                                <TableHead>Part Number</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.partName}</TableCell>
                                        <TableCell>{item.partNumber}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>₹{item.totalPrice.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No items in this order</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PurchaseOrderDetails;