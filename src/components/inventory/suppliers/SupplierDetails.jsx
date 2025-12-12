import React from 'react';
import { FaArrowLeft, FaEdit, FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaCalendar, FaStickyNote } from 'react-icons/fa';

const SupplierDetails = ({ supplier, onBack, onEdit }) => {
    if (!supplier) {
        return (
            <div className="bg-card p-6 rounded-lg">
                <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4" onClick={onBack}>
                    <FaArrowLeft className="mr-2" /> Back to Suppliers
                </button>
                <h2 className="text-xl font-semibold">Supplier not found</h2>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusClass = status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary" onClick={onBack}>
                    <FaArrowLeft className="mr-2" /> Back to Suppliers
                </button>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={() => onEdit(supplier)}>
                    <FaEdit className="mr-2" /> Edit
                </button>
            </div>

            <div className="border-b border-border pb-4 mb-6">
                <div className="flex items-center">
                    <FaBuilding className="text-2xl text-primary mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">{supplier.name}</h2>
                        {getStatusBadge(supplier.status)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Contact Information</h3>
                    <InfoItem icon={<FaUser />} label="Contact Person" value={supplier.contactPerson} />
                    <InfoItem icon={<FaPhone />} label="Phone" value={supplier.phone} />
                    <InfoItem icon={<FaEnvelope />} label="Email" value={supplier.email} />
                    <InfoItem icon={<FaMapMarkerAlt />} label="Address" value={supplier.address} />
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Business Information</h3>
                    <InfoItem icon={<FaGlobe />} label="Website">
                        <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {supplier.website}
                        </a>
                    </InfoItem>
                    <InfoItem icon={<FaCalendar />} label="Supplier Since" value={formatDate(supplier.createdAt)} />
                    <InfoItem label="Category" value="Auto Parts" />
                </div>

                {/* Additional Information */}
                {supplier.notes && (
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Additional Information</h3>
                        <InfoItem icon={<FaStickyNote />} label="Notes" value={supplier.notes} />
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, children }) => (
    <div className="flex items-start">
        {icon && <div className="text-muted-foreground mt-1 mr-3">{icon}</div>}
        <div>
            <label className="text-sm text-muted-foreground">{label}</label>
            {value ? <p>{value}</p> : <div>{children}</div>}
        </div>
    </div>
);

export default SupplierDetails;
