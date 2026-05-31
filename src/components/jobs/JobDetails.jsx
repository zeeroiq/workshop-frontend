import React from 'react';
import { ArrowLeft, Edit, User, Car, Wrench, FileText, Calendar, Clock, IndianRupee, Info, ClipboardList, Activity } from 'lucide-react';
import { getStatusBadge, formatDate } from "./helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

const JobDetails = ({ job, onBack, onEdit }) => {
    if (!job) {
        return (
            <div className="container mx-auto py-20 text-center space-y-6">
                <Info className="h-16 w-16 text-muted-foreground mx-auto opacity-20" />
                <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Node Assignment Missing</h3>
                    <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">The requested job data node could not be established in current session.</p>
                </div>
                <Button onClick={onBack} variant="outline" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                    Return to Stream
                </Button>
            </div>
        );
    }

    const getJobDetailsActions = () => [
        {
            label: "Return to Stream",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: onBack,
            variant: "outline"
        },
        {
            label: "Modify Order",
            icon: <Edit className="h-4 w-4" />,
            onClick: onEdit,
            variant: "outline"
        }
    ];

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto pb-12">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Service Execution Node</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                        Work Order: {job.jobNumber}
                    </h1>
                </div>
                <ResponsiveActions actions={getJobDetailsActions()} />
            </div>

            {/* Strategic Overview Card */}
            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 p-6 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {getStatusBadge(job.status)}
                                <Badge variant="outline" className="font-mono text-[10px] font-black tracking-widest bg-background/50 border-border/50">#{job.id.toString().padStart(6, '0')}</Badge>
                            </div>
                            <CardTitle className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                                {job.service}
                            </CardTitle>
                        </div>
                        <div className="bg-emerald-500/10 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-emerald-500/20 flex flex-col items-center md:items-end shadow-inner w-full md:w-auto">
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-1">Total Valuation</p>
                            <p className="text-4xl md:text-5xl font-black text-emerald-500 tracking-tighter tabular-nums leading-none">
                                ₹{job.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        {/* Column 1: Identity & Asset */}
                        <div className="p-8 md:p-10 space-y-8">
                            <SectionHeader icon={<User />} title="Identity Matrix" />
                            <div className="space-y-6">
                                <InfoNode label="Lead Client Node" value={job.customer} />
                                <div className="p-6 bg-muted/20 rounded-3xl border border-border/30 group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Car className="text-primary h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Asset Spec</p>
                                    </div>
                                    <p className="text-lg font-black text-foreground uppercase tracking-tight">{job.vehicle}</p>
                                    {job.license && (
                                        <Badge variant="outline" className="mt-3 font-mono text-[10px] font-black tracking-[0.2em] bg-background/50 border-border/50 uppercase px-3 py-1">
                                            {job.license}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Operation Specs */}
                        <div className="p-8 md:p-10 space-y-8">
                            <SectionHeader icon={<Wrench />} title="Execution Protocol" />
                            <div className="space-y-6">
                                <InfoNode label="Primary Directives" value={job.service} />
                                <InfoNode label="Assigned Tech Analyst" value={job.technician || 'WAITING_FOR_ASSIGNMENT'} />
                                {job.description && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Instruction Set</p>
                                        <p className="text-sm font-medium italic text-foreground/80 leading-relaxed bg-muted/10 p-4 rounded-2xl border border-border/20">
                                            "{job.description}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 3: Logistics Timeline */}
                        <div className="p-8 md:p-10 space-y-8">
                            <SectionHeader icon={<Calendar />} title="Temporal Sync" />
                            <div className="space-y-6">
                                <InfoNode label="System Check-In" value={formatDate(job.createdAt)} />
                                <InfoNode label="SLA Completion Node" value={formatDate(job.estimatedCompletion)} />
                                <div className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl group">
                                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:rotate-12 transition-transform">
                                        <Clock className="text-blue-500 h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Temporal Status</p>
                                        <p className="text-xs font-bold text-foreground/70">Node synchronization active. Monitoring telemetry.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Itemized Billing Node */}
            {job?.items?.length > 0 && (
                <Card className="border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/30 backdrop-blur-md">
                    <CardHeader className="bg-muted/20 border-b border-border/50 p-6 md:p-8 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-black uppercase tracking-widest">Resource Ledger</CardTitle>
                        </div>
                        <Badge variant="secondary" className="font-black text-[9px] px-3 py-1 rounded-full">{job.items.length} LINE_ENTRIES</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Matrix */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/10">
                                    <tr className="border-b border-border/30">
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Classification / Node</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Units</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Unit Rate</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {job.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground uppercase tracking-tight">
                                                        {item.type?.toUpperCase() === 'LABOR' ? item.description : item.partName}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter opacity-50 px-1.5 py-0 border-border/30">{item.type}</Badge>
                                                        {item.type?.toUpperCase() !== 'LABOR' && (
                                                            <span className="text-[9px] font-mono text-muted-foreground opacity-40 uppercase">UID: {item.partNumber}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-foreground/70">{item.quantity}</td>
                                            <td className="px-8 py-6 text-right font-medium opacity-60">₹{item.rate.toFixed(2)}</td>
                                            <td className="px-8 py-6 text-right font-black text-emerald-500">₹{(item.quantity * item.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Unit Decomposition */}
                        <div className="md:hidden divide-y divide-border/20">
                            {job.items.map((item, index) => (
                                <div key={index} className="p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <p className="font-black text-sm uppercase tracking-tight leading-tight">
                                                {item.type?.toUpperCase() === 'LABOR' ? item.description : item.partName}
                                            </p>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-50 border-border/30 h-4">{item.type}</Badge>
                                        </div>
                                        <p className="font-black text-emerald-500 text-sm">₹{(item.quantity * item.rate).toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl border border-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black uppercase text-muted-foreground opacity-50">Operational Density</p>
                                            <p className="text-[11px] font-bold">{item.quantity} UNIT(S) @ ₹{item.rate.toFixed(2)}</p>
                                        </div>
                                        <Activity className="h-3 w-3 text-primary opacity-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Supplemental Intelligence Log */}
            {job.notes && job.notes.length > 0 && (
                <Card className="border-border/50 shadow-2xl rounded-[2.5rem] bg-card/30 backdrop-blur-md overflow-hidden">
                    <CardHeader className="bg-muted/20 border-b border-border/50 p-6 md:p-8">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                            <Activity className="h-5 w-5 text-primary" /> Technical Narrative Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/20">
                            {job.notes.map((note) => (
                                <div key={note.id} className="p-8 space-y-4 hover:bg-muted/10 transition-colors">
                                    <p className="text-base leading-relaxed text-foreground/90 font-medium">"{note.content}"</p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            <span>Analyst {note.authorName}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                                            Sync: {formatDate(note.createdAt)}
                                        </span>
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
    <div className="flex items-center gap-4 border-b border-border/30 pb-4 mb-2">
        <div className="p-2 bg-primary/10 rounded-xl text-primary transform group-hover:rotate-12 transition-transform">
            {React.cloneElement(icon, { size: 16 })}
        </div>
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-foreground opacity-70">{title}</h3>
    </div>
);

const InfoNode = ({ label, value }) => (
    <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 ml-1">{label}</p>
        <div className="p-5 bg-background/50 border border-border/50 rounded-2xl shadow-inner">
            <p className="text-sm md:text-base font-black text-foreground tracking-widest uppercase truncate leading-tight">{value}</p>
        </div>
    </div>
);

export default JobDetails;
