import React, { useState, useEffect, useCallback } from 'react';
import { 
    ArrowLeft, 
    Edit, 
    User, 
    Car, 
    Wrench, 
    UserCog, 
    FileText, 
    Calendar, 
    Clock, 
    IndianRupee,
    CheckCircle2,
    Play,
    Pause,
    Receipt,
    History,
    AlertTriangle,
    Plus,
    Package,
    Search,
    Loader2,
    Zap,
    Trash2
} from 'lucide-react';
import { getStatusBadge, formatDate } from "./helper/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { jobService } from '@/services/jobService';
import { inventoryService } from '@/services/inventoryService';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const JobDetails = ({ job, onBack, onEdit, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [isAddPartOpen, setIsAddPartOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [partSearch, setPartPartSearch] = useState('');
    const [newNote, setNewNote] = useState('');
    const [partResults, setPartResults] = useState([]);
    const [searchingParts, setSearchingParts] = useState(false);
    const user = authService.getUser();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (partSearch.length >= 2) {
                setSearchingParts(true);
                try {
                    const response = await inventoryService.getParts({ page: 0, size: 5, search: partSearch });
                    setPartResults(response.data.content || []);
                } catch (error) {
                    console.error('Part search failed:', error);
                } finally {
                    setSearchingParts(false);
                }
            } else {
                setPartResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [partSearch]);

    if (!job) {
        return (
            <div className="w-full max-w-4xl mx-auto py-12 text-center space-y-6">
                <div className="p-6 rounded-full bg-muted/30 w-fit mx-auto">
                    <AlertTriangle size={48} className="text-muted-foreground opacity-20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight">Job Not Found</h2>
                    <p className="text-sm text-muted-foreground">The requested job cycle could not be located in the database.</p>
                </div>
                <Button onClick={onBack} variant="outline" className="rounded-xl px-8 border-border/50">
                    <ArrowLeft size={16} className="mr-2" /> Back to Database
                </Button>
            </div>
        );
    }

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            await jobService.updateJobStatus(job.id, newStatus);
            toast.success(`Job status updated to ${newStatus.replace(/_/g, ' ')}`);
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPart = async (part) => {
        setLoading(true);
        try {
            await jobService.addJobItem(job.id, {
                type: 'PART',
                partId: part.id,
                description: part.name,
                quantity: 1,
                rate: part.sellingPrice,
                discount: 0
            });
            toast.success(`${part.name} added to job.`);
            setIsAddPartOpen(false);
            setPartPartSearch('');
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add part');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setLoading(true);
        try {
            await jobService.addJobNote(job.id, {
                content: newNote,
                authorId: user?.id
            });
            toast.success('Note added successfully');
            setNewNote('');
            setIsAddNoteOpen(false);
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Remove this item from the job?')) return;
        setLoading(true);
        try {
            await jobService.removeJobItem(job.id, itemId);
            toast.success('Item removed.');
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async () => {
        setLoading(true);
        try {
            const response = await jobService.createInvoice(job.id);
            toast.success(`Invoice generated successfully`);
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
                <Button onClick={onBack} variant="outline" className="border-border/50 bg-muted/20 hover:bg-muted/40 gap-2 px-6 rounded-xl">
                    <ArrowLeft size={16} /> Back to Database
                </Button>
                <div className="flex items-center gap-3">
                    <Button onClick={onEdit} variant="outline" className="border-border/50 rounded-xl px-6 gap-2">
                        <Edit size={16} className="text-primary" /> Edit Parameters
                    </Button>
                    
                    <div className="h-8 w-px bg-border/50 mx-2 hidden sm:block"></div>
                    
                    {job.status === 'estimate-pending' && (
                        <Button onClick={() => handleStatusUpdate('ESTIMATE_SENT')} disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-xl gap-2 px-6 font-black uppercase tracking-widest text-[10px]">
                            Dispatch Estimate
                        </Button>
                    )}
                    
                    {(job.status === 'estimate-sent' || job.status === 'awaiting-approval') && (
                        <Button onClick={() => handleStatusUpdate('APPROVED')} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 rounded-xl gap-2 px-6 font-black uppercase tracking-widest text-[10px]">
                            Approve Cycle
                        </Button>
                    )}

                    {job.status === 'approved' && (
                        <Button onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={loading} className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20 rounded-xl gap-2 px-6 font-black uppercase tracking-widest text-[10px]">
                            <Play size={14} fill="currentColor" /> Start Work
                        </Button>
                    )}

                    {job.status === 'in-progress' && (
                        <Button onClick={() => handleStatusUpdate('COMPLETED')} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 rounded-xl gap-2 px-6 font-black uppercase tracking-widest text-[10px]">
                            <CheckCircle2 size={14} /> Finalize Job
                        </Button>
                    )}

                    {job.status === 'completed' && (
                        <Button onClick={handleCreateInvoice} disabled={loading} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 rounded-xl gap-2 px-6 font-black uppercase tracking-widest text-[10px]">
                            <Receipt size={14} /> Generate Invoice
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Job Overview */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                        <CardHeader className="bg-muted/20 border-b border-border/50 p-6 flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-background border-border/50">
                                        {job.jobNumber}
                                    </Badge>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Registered {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight">{job.service}</CardTitle>
                            </div>
                            {getStatusBadge(job.status)}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-2">
                                <div className="p-8 border-b md:border-b-0 md:border-r border-border/50 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity Manifest</h4>
                                    <div className="space-y-4">
                                        <InfoItem icon={<User size={18} className="text-blue-500" />} label="Customer Contact" value={job.customer} />
                                        <InfoItem icon={<Car size={18} className="text-amber-500" />} label="Target Vehicle" value={job.vehicle} />
                                        {job.license && <InfoItem icon={<FileText size={18} className="text-purple-500" />} label="License Reference" value={job.license} className="pl-0" />}
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cycle Parameters</h4>
                                    <div className="space-y-4">
                                        <InfoItem icon={<UserCog size={18} className="text-emerald-500" />} label="Lead Technician" value={job.technician || 'Awaiting Assignment'} />
                                        <InfoItem icon={<Clock size={18} className="text-rose-500" />} label="Target Completion" value={job.estimatedCompletion ? formatDate(job.estimatedCompletion) : 'Not Scheduled'} />
                                        <InfoItem icon={<IndianRupee size={18} className="text-emerald-500" />} label="Accrued Cost" value={`₹ ${job.cost?.toLocaleString() || '0.00'}`} />
                                    </div>
                                </div>
                            </div>
                            {job.description && (
                                <div className="p-8 border-t border-border/50 bg-muted/10">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Service Brief</h4>
                                    <p className="text-sm font-medium leading-relaxed text-foreground/80">{job.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Parts & Labor Table */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                        <CardHeader className="bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between p-6">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Wrench size={18} className="text-emerald-500" /> Line Item Audit
                            </CardTitle>
                            <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-9 border-border/50 bg-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-emerald-950 transition-all">
                                        <Plus size={14} className="mr-1" /> Quick Add Part
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-black uppercase tracking-tight">Consume Inventory</DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest">Add parts directly to this job cycle.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search SKU or Part Name..." 
                                                value={partSearch}
                                                onChange={(e) => setPartPartSearch(e.target.value)}
                                                className="pl-10 h-12 bg-muted/30 border-border/50 font-bold"
                                                autoFocus
                                            />
                                            {searchingParts && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />}
                                        </div>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {partResults.map((part) => (
                                                <button
                                                    key={part.id}
                                                    onClick={() => handleAddPart(part)}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left group"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{part.name}</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{part.partNumber} &middot; {part.quantityInStock} in stock</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{part.sellingPrice}</p>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Add to Job</p>
                                                    </div>
                                                </button>
                                            ))}
                                            {partSearch.length >= 2 && partResults.length === 0 && !searchingParts && (
                                                <div className="py-8 text-center opacity-50">
                                                    <p className="text-xs font-bold uppercase tracking-widest">No matching parts found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            {job?.items?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-8">Resource Description</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Unit Count</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Rate</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Total</TableHead>
                                                <TableHead className="w-10 pr-8"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {job.items.map((item, index) => (
                                                <TableRow key={index} className="border-border/40 hover:bg-emerald-500/[0.02] group">
                                                    <TableCell className="pl-8 py-4">
                                                        <div className="font-bold text-sm">
                                                            {item.type?.toUpperCase() === 'LABOR' ? item.description : item.partName}
                                                        </div>
                                                        {item.type?.toUpperCase() !== 'LABOR' && (
                                                            <div className="text-[10px] font-mono text-muted-foreground uppercase">{item.partNumber}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-black">{item.quantity}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground font-medium">₹{item.rate?.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                                                        ₹{(item.quantity * item.rate)?.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="pr-8 text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-3">
                                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                                        <Plus size={20} className="text-muted-foreground opacity-30" />
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No resources allocated to this job cycle yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Intelligence & Logs */}
                <div className="space-y-8">
                    {/* Notes Section */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                        <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <History size={18} className="text-emerald-500" /> Operational Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {job.notes && job.notes.length > 0 ? (
                                job.notes.map((note) => (
                                    <div key={note.id} className="p-4 bg-muted/30 border border-border/40 rounded-xl space-y-2 relative group transition-all hover:bg-muted/50">
                                        <p className="text-sm font-bold leading-relaxed">{note.content}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground">
                                                <User size={10} className="text-emerald-500" />
                                                {note.authorName}
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground/60">{formatDate(note.createdAt)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No intelligence logged</p>
                                </div>
                            )}
                            
                            <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full h-11 border-dashed border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/5 hover:border-emerald-500/30 rounded-xl mt-2">
                                        <Plus size={14} className="mr-2" /> Add Field Note
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-black uppercase tracking-tight">Add Intelligence</DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest">Log technical details or updates for this job.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Textarea 
                                            placeholder="Enter note content..." 
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="min-h-[120px] bg-muted/30 border-border/50 font-medium"
                                            autoFocus
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddNote} disabled={loading || !newNote.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-11">
                                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Log Note'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Timeline */}
                    <Card className="border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden rounded-2xl">
                         <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Zap size={20} className="text-emerald-500" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-foreground">Operational Pulse</span>
                            </div>
                            <div className="space-y-4">
                                <TimelineItem label="Cycle Initiated" date={formatDate(job.createdAt)} active />
                                <TimelineItem label="Last Parameter Update" date={formatDate(job.updatedAt)} active={job.updatedAt !== job.createdAt} />
                                <TimelineItem label="Cycle Completion" date={job.completedAt ? formatDate(job.completedAt) : 'PENDING'} active={!!job.completedAt} />
                            </div>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({ label, date, active }) => (
    <div className="flex items-start gap-3 relative pb-4 last:pb-0 group">
        <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border/50 group-last:hidden"></div>
        <div className={cn(
            "h-3.5 w-3.5 rounded-full border-2 mt-1 shrink-0 z-10",
            active ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted border-muted-foreground/30"
        )}></div>
        <div className="space-y-0.5">
            <p className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-foreground" : "text-muted-foreground")}>{label}</p>
            <p className="text-[9px] font-bold text-muted-foreground/60">{date}</p>
        </div>
    </div>
);

const InfoItem = ({ icon, label, value, className }) => (
    <div className={cn("flex items-start gap-4 group", className)}>
        <div className="p-2.5 rounded-xl bg-muted/50 border border-border/50 shadow-inner group-hover:bg-background transition-all">
            {icon}
        </div>
        <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{value}</p>
        </div>
    </div>
);

export default JobDetails;
