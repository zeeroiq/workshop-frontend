import React from 'react';
import { FaArrowLeft, FaEdit, FaBox, FaTag, FaIndustry, FaRupeeSign, FaMapMarkerAlt, FaUserTie, FaExclamationTriangle, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

const PartDetails = ({ part, onBack, onEdit }) => {
    const getStatusColor = (quantity, minStockLevel) => {
        if (quantity === 0) return 'bg-red-100 text-red-800';
        if (quantity <= minStockLevel) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (quantity, minStockLevel) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= minStockLevel) return 'Low Stock';
        return 'In Stock';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!part) {
        return (
            <div className="bg-card p-6 rounded-lg">
                <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4" onClick={onBack}>
                    <FaArrowLeft className="mr-2" /> Back to Parts
                </button>
                <h2 className="text-xl font-semibold">Part not found</h2>
            </div>
        );
    }

    return (
        <div className="bg-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary" onClick={onBack}>
                    <FaArrowLeft className="mr-2" /> Back to Parts
                </button>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={onEdit}>
                    <FaEdit className="mr-2" /> Edit Part
                </button>
            </div>

            <div className="border-b border-border pb-4 mb-6">
                <h2 className="text-2xl font-bold">{part.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-muted-foreground">{part.partNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(part.quantityInStock, part.minStockLevel)}`}>
                        {getStatusText(part.quantityInStock, part.minStockLevel)}
                        {part.quantityInStock <= part.minStockLevel && <FaExclamationTriangle className="inline-block ml-1" />}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h3>
                    <div className="flex items-start">
                        <FaBox className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Name</label>
                            <p>{part.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FaTag className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Part Number</label>
                            <p>{part.partNumber}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Category</label>
                        <p>{part.category}</p>
                    </div>
                    {part.description && (
                        <div className="flex items-start">
                            <FaFileAlt className="text-muted-foreground mt-1 mr-3" />
                            <div>
                                <label className="text-sm text-muted-foreground">Description</label>
                                <p className="whitespace-pre-wrap">{part.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing & Inventory */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Pricing & Inventory</h3>
                    <div className="flex items-start">
                        <FaRupeeSign className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Cost Price</label>
                            <p>₹{part.costPrice?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FaRupeeSign className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Selling Price</label>
                            <p>₹{part.sellingPrice?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Current Stock</label>
                        <p>{part.quantityInStock} units</p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Minimum Stock Level</label>
                        <p>{part.minStockLevel} units</p>
                    </div>
                </div>

                {/* Supplier & Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Supplier & Location</h3>
                    <div className="flex items-start">
                        <FaIndustry className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Manufacturer</label>
                            <p>{part.manufacturer}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FaUserTie className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Supplier</label>
                            <p>{part.supplierName}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FaMapMarkerAlt className="text-muted-foreground mt-1 mr-3" />
                        <div>
                            <label className="text-sm text-muted-foreground">Location</label>
                            <p>{part.location}</p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="space-y-4 col-span-full">
                     <h3 className="text-lg font-semibold border-b border-border pb-2">Dates</h3>
                     <div className="flex space-x-8">
                        <div className="flex items-start">
                            <FaCalendarAlt className="text-muted-foreground mt-1 mr-3" />
                            <div>
                                <label className="text-sm text-muted-foreground">Created At</label>
                                <p>{formatDate(part.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FaCalendarAlt className="text-muted-foreground mt-1 mr-3" />
                            <div>
                                <label className="text-sm text-muted-foreground">Last Updated</label>
                                <p>{formatDate(part.updatedAt)}</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetails;
