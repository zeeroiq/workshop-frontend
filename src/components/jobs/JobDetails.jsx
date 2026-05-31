import React from 'react';
import { FaArrowLeft, FaEdit, FaUser, FaCar, FaWrench, FaUserCog, FaFileAlt, FaCalendar, FaClock, FaRupeeSign, FaInfoCircle, FaClipboardList } from 'react-icons/fa';
import { getStatusBadge, formatDate } from "./helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const JobDetails = ({ job, onBack, onEdit }) => {
    if (!job) {
        return (
            <div className="container mx-auto py-6">
                <Button onClick={onBack} variant="outline" size="sm"><FaArrowLeft className="mr-2" /> Back</Button>
                <Card className="mt-4 border-destructive/20 bg-destructive/5">
                    <CardContent className="p-12 text-center">
                        <FaInfoCircle className="mx-auto text-4xl text-destructive/50 mb-4" />
                        <h2 className="text-xl font-bold">Job assignment not found</h2>
                        <p className="text-muted-foreground mt-2">The requested job details are no longer available or could not be loaded.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 md:py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button onClick={onBack} variant="outline" size="sm" className="w-fit">
                    <FaArrowLeft className="mr-2" /> Back to Jobs
                </Button>
                <Button onClick={onEdit} size="sm" className="w-full sm:w-auto">
                    <FaEdit className="mr-2" /> Edit Service Job
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="font-mono text-[10px] tracking-widest uppercase">{job.jobNumber}</Badge>
                                {getStatusBadge(job.status)}
                            </div>
                            <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">{job.service}</CardTitle>
                        </div>
                        <div className="bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50 flex flex-col items-end">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Estimated Cost</p>
                            <p className="text-2xl font-black text-emerald-500">₹{job.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        {/* Customer & Vehicle */}
                        <div className="p-6 space-y-6">
                            <SectionHeader icon={<FaUser />} title="Ownership" />
                            <div className="space-y-4">
                                <InfoItem label="Client Name" value={job.customer} />
                                <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaCar className="text-primary h-4 w-4" />
                                        <p className="text-sm font-bold">Vehicle Details</p>
                                    </div>
                                    <p className="text-base font-medium">{job.vehicle}</p>
                                    {job.license && (
                                        <p className="text-xs font-mono mt-1 text-muted-foreground bg-background/50 w-fit px-2 py-0.5 rounded border border-border/50 uppercase tracking-widest">
                                            {job.license}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="p-6 space-y-6">
                            <SectionHeader icon={<FaWrench />} title="Work Order" />
                            <div className="space-y-4">
                                <InfoItem label="Primary Service" value={job.service} />
                                <InfoItem label="Assigned Technician" value={job.technician || 'Pending Assignment'} />
                                {job.description && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Job Instructions</p>
                                        <p className="text-sm italic leading-relaxed text-foreground/80">{job.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule & Timing */}
                        <div className="p-6 space-y-6">
                            <SectionHeader icon={<FaCalendar />} title="Timeline" />
                            <div className="space-y-4">
                                <InfoItem label="Check-in Date" value={formatDate(job.createdAt)} />
                                <InfoItem label="Target Completion" value={formatDate(job.estimatedCompletion)} />
                                <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                    <FaClock className="text-blue-500 h-4 w-4" />
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Status Update</p>
                                        <p className="text-xs font-medium italic">Active operational tracking enabled.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Parts & Labor Table */}
            {job?.items?.length > 0 && (
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <FaClipboardList className="text-primary h-4 w-4" /> Itemized Billing
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                            {job.items.length} items
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-center">Qty</th>
                                        <th className="px-6 py-4 text-right">Unit Rate</th>
                                        <th className="px-6 py-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {job.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-foreground">
                                                    {item.type?.toUpperCase() === 'LABOR' ? item.description : item.partName}
                                                </p>
                                                {item.type?.toUpperCase() !== 'LABOR' && (
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">#{item.partNumber}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-medium text-muted-foreground">₹{item.rate.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-foreground">₹{(item.quantity * item.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List for Items */}
                        <div className="sm:hidden divide-y divide-border/50">
                            {job.items.map((item, index) => (
                                <div key={index} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">
                                                {item.type?.toUpperCase() === 'LABOR' ? item.description : item.partName}
                                            </p>
                                            {item.type?.toUpperCase() !== 'LABOR' && (
                                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">#{item.partNumber}</p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                                    </div>
                                    <div className="flex justify-between items-end bg-muted/20 p-2 rounded-lg">
                                        <div className="text-[10px]">
                                            <p className="text-muted-foreground font-bold uppercase tracking-widest">Rate × Qty</p>
                                            <p className="font-medium">₹{item.rate.toFixed(2)} × {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Subtotal</p>
                                            <p className="font-black text-emerald-500">₹{(item.quantity * item.rate).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {job.notes && job.notes.length > 0 && (
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-lg font-bold">Additional Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {job.notes.map((note) => (
                                <div key={note.id} className="p-4 md:p-6 space-y-3 hover:bg-muted/10 transition-colors">
                                    <p className="text-sm leading-relaxed text-foreground/90 font-medium">{note.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                        <span>{note.authorName}</span>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span>{formatDate(note.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3 border-b border-border/30 pb-3">
        <div className="text-primary text-sm">{icon}</div>
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/70">{title}</h3>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-base font-semibold text-foreground truncate">{value}</p>
    </div>
);

export default JobDetails;
