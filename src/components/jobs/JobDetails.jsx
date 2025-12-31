import React from 'react';
import { FaArrowLeft, FaEdit, FaUser, FaCar, FaWrench, FaUserCog, FaFileAlt, FaCalendar, FaClock, FaRupeeSign } from 'react-icons/fa';
import { getStatusBadge } from "./helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const JobDetails = ({ job, onBack, onEdit }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (!job) {
        return (
            <div className="container mx-auto py-6">
                <Button onClick={onBack} variant="outline"><FaArrowLeft className="mr-2" /> Back to Jobs</Button>
                <Card className="mt-4">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold">Job not found</h2>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button onClick={onBack} variant="outline"><FaArrowLeft className="mr-2" /> Back to Jobs</Button>
                <Button onClick={onEdit}><FaEdit className="mr-2" /> Edit Job</Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">{job.service}</CardTitle>
                            <p className="text-sm text-muted-foreground">{job.jobNumber}</p>
                        </div>
                        {getStatusBadge(job.status)}
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {/* Customer & Vehicle */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Customer & Vehicle</h3>
                        <InfoItem icon={<FaUser />} label="Customer" value={job.customer} />
                        <InfoItem icon={<FaCar />} label="Vehicle" value={job.vehicle} />
                        {job.license && <InfoItem label="License Plate" value={job.license} />}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Service Details</h3>
                        <InfoItem icon={<FaWrench />} label="Service" value={job.service} />
                        <InfoItem icon={<FaUserCog />} label="Technician" value={job.technician} />
                        {job.description && <InfoItem icon={<FaFileAlt />} label="Description" value={job.description} />}
                    </div>

                    {/* Schedule & Pricing */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Schedule & Pricing</h3>
                        <InfoItem icon={<FaCalendar />} label="Created" value={formatDate(job.createdAt)} />
                        <InfoItem icon={<FaClock />} label="Estimated Completion" value={formatDate(job.estimatedCompletion)} />
                        <InfoItem icon={<FaRupeeSign />} label="Cost" value={`₹ ${job.cost.toFixed(2)}`} />
                    </div>
                </CardContent>
            </Card>

            {/* Parts Used */}
            {job?.items?.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Parts & Labor</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Item</th>
                                        <th className="px-4 py-2 text-right">Quantity</th>
                                        <th className="px-4 py-2 text-right">Unit Price</th>
                                        <th className="px-4 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {job.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2">{item.type === 'LABOR' ? item.description : `[${item.partNumber}]  ${item.partName}`}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">₹ {item.rate.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-semibold">₹ {(item.quantity * item.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {job.notes && job.notes.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {job.notes.map((note) => (
                            <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm">{note.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">— {note.authorName} on {formatDate(note.createdAt)}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="text-muted-foreground mr-3 mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    </div>
);

export default JobDetails;
