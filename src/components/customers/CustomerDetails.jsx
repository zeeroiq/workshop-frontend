import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    Edit, 
    Trash, 
    Plus, 
    ArrowLeft, 
    Car, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    FileText, 
    User,
    TrendingUp,
    Zap
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await customerService.getWithVehicles(id);
            setCustomer(response.data);
        } catch (error) {
            toast.error('Failed to sync customer profile.');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        try {
            await customerService.addNote(id, { content: noteContent });
            toast.success('Operational note added.');
            setNoteContent('');
            fetchCustomer();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to archive note');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this customer? This action is permanent.')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer profile purged.');
            navigate('/customers');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete customer');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
    if (!customer) return <div className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest">Customer Record Missing</div>;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button onClick={() => navigate('/customers')} variant="outline" className="border-border/50 bg-muted/20 hover:bg-muted/40 gap-2 px-6 rounded-xl">
                    <ArrowLeft size={16} /> Back to Database
                </Button>
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="border-border/50 rounded-xl px-6">
                        <Link to={`/customers/edit/${id}`} className="gap-2">
                            <Edit size={16} className="text-primary" /> Edit Profile
                        </Link>
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none px-6 rounded-xl gap-2">
                        <Trash size={16} /> Purge Record
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
                        <CardHeader className="bg-muted/20 border-b border-border/50 text-center pb-8 pt-8">
                            <div className="h-24 w-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <User size={48} className="text-emerald-500" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{customer.firstName} {customer.lastName}</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80 mt-1">Verified Customer</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                                <Phone size={16} className="text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold truncate">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                                <Mail size={16} className="text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold truncate">{customer.email || 'No email'}</span>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                                    <span>Statistics</span>
                                    <TrendingUp size={12} className="text-emerald-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl border border-border/40 bg-background/50 text-center">
                                        <div className="text-xl font-black">{customer.vehicles?.length || 0}</div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Vehicles</div>
                                    </div>
                                    <div className="p-3 rounded-xl border border-border/40 bg-background/50 text-center">
                                        <div className="text-xl font-black">{customer.notes?.length || 0}</div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Reports</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full bg-muted/30 border-border/50 p-1 mb-6 justify-start h-12">
                            <TabsTrigger value="details" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-8 h-10 rounded-lg">
                                <FileText size={16} className="mr-2" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="vehicles" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-8 h-10 rounded-lg text-xs md:text-sm">
                                <Car size={16} className="mr-2" /> Fleet Assets
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-8 h-10 rounded-lg text-xs md:text-sm">
                                <Edit size={16} className="mr-2" /> Intelligence
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-0 space-y-6 outline-none">
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><MapPin size={12} className="text-emerald-500" /> Physical Address</Label>
                                        <div className="p-4 rounded-xl border border-border/50 bg-muted/20 font-bold text-sm min-h-[80px]">
                                            {customer.address || 'No physical address archived for this profile.'}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Calendar size={12} className="text-emerald-500" /> Registration Lifecycle</Label>
                                            <div className="p-4 rounded-xl border border-border/50 bg-muted/20 font-mono font-bold text-sm">
                                                Since {new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Zap size={12} className="text-emerald-500" /> Profile Status</Label>
                                            <div className="flex gap-2">
                                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-black uppercase tracking-widest px-4 py-1 text-[10px]">ACTIVE_ACCOUNT</Badge>
                                                <Badge variant="outline" className="font-black uppercase tracking-widest px-4 py-1 text-[10px]">SMS_ENABLED</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vehicles" className="mt-0 outline-none">
                            {customer.vehicles && customer.vehicles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {customer.vehicles.map(vehicle => (
                                        <Card key={vehicle.id} className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                                            <CardHeader className="bg-muted/20 border-b border-border/50 p-5 flex flex-row items-center justify-between space-y-0">
                                                <div>
                                                    <CardTitle className="text-lg font-black group-hover:text-emerald-500 transition-colors">
                                                        {vehicle.make} {vehicle.model}
                                                    </CardTitle>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{vehicle.year} Production</span>
                                                </div>
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                    <Car size={20} />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">License</p>
                                                        <Badge variant="outline" className="font-mono font-bold border-border/50 bg-background">{vehicle.licensePlate}</Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Odometer</p>
                                                        <p className="font-black text-sm">{vehicle.currentMileage?.toLocaleString() || '---'} <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">KM</span></p>
                                                    </div>
                                                </div>
                                                <Button asChild variant="outline" size="sm" className="w-full mt-2 h-10 border-border/50 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-emerald-950 transition-all">
                                                    <Link to={`/vehicles/${vehicle.id}`}>Analyze Vehicle Logs</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <div className="md:col-span-1">
                                        <Link to="/vehicles/new" className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group">
                                            <Plus size={32} className="text-muted-foreground group-hover:text-emerald-500 transition-colors mb-3" />
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Register New Asset</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <Card className="border-dashed border-2 bg-transparent">
                                    <CardContent className="flex flex-col items-center justify-center py-20 gap-6">
                                        <div className="p-6 rounded-full bg-muted/30">
                                            <Car size={48} className="text-muted-foreground opacity-20" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h4 className="text-lg font-black uppercase tracking-tight">No Fleet Assets</h4>
                                            <p className="text-sm text-muted-foreground max-w-[300px]">Register vehicles to start tracking service history and maintenance cycles.</p>
                                        </div>
                                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 h-12 font-black uppercase tracking-widest">
                                            <Link to="/vehicles/new"><Plus size={18} className="mr-2" /> Register First Vehicle</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0 space-y-6 outline-none">
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Edit size={18} className="text-emerald-500" /> New Intelligence Entry
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleAddNote} className="space-y-4">
                                        <Textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Document customer preferences, vehicle quirks, or service feedback..."
                                            rows="4"
                                            className="bg-background/50 border-border/50 font-bold p-4 rounded-xl focus:border-emerald-500/50"
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={!noteContent.trim()} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 h-11 font-black uppercase tracking-widest">
                                                Commit Entry
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2 text-muted-foreground">
                                    <FileText size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Archived Records</span>
                                </div>
                                {customer.notes && customer.notes.length > 0 ? (
                                    customer.notes.map(note => (
                                        <Card key={note.id} className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden group hover:border-emerald-500/20 transition-all">
                                            <CardContent className="p-6">
                                                <p className="text-sm font-bold leading-relaxed">{note.content}</p>
                                                <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-t border-border/30 pt-3">
                                                    <Calendar size={12} className="text-emerald-500" />
                                                    {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No entries archived</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
