import React from 'react';
import { FaArrowLeft, FaEdit, FaUser, FaCar, FaWrench, FaUserCog, FaFileAlt, FaCalendar, FaClock, FaRupeeSign } from 'react-icons/fa';
import { getStatusBadge, formatDate } from "./helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const JobDetails = ({ job, onBack, onEdit }) => {
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button onClick={onBack} variant="outline"><FaArrowLeft className="mr-2" /> Back to Jobs</Button>
                <Button onClick={onEdit}><FaEdit className="mr-2" /> Edit Job</Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {job.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.type?.toUpperCase() === 'LABOR' ? item.description : `[${item.partNumber}]  ${item.partName}`}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">₹ {item.rate.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-semibold">₹ {(item.quantity * item.rate).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
