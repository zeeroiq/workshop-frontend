import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, ArrowLeft, Car, User, History, StickyNote, Cog, Palette, Hash, Calendar, Gauge, Fingerprint, Activity, Phone, Mail } from "lucide-react";
import { vehicleService } from '@/services/vehicleService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from '@/lib/utils';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [noteContent, setNoteContent] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchVehicleHistory();
        }
    }, [activeTab]);

    const fetchVehicle = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getById(id);
            setVehicle(response.data);
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleHistory = async () => {
        try {
            const response = await vehicleService.getHistory(id);
            setHistory(response.data.serviceRecords || []);
        } catch (error) {
            console.error('Error fetching vehicle history:', error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteContent.trim()) return;
        try {
            await vehicleService.addNote(id, { content: noteContent });
            toast.success('Intelligence entry deployed.');
            setNoteContent('');
            fetchVehicle();
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to decommission this vehicle?')) {
            try {
                await vehicleService.delete(id);
                toast.success('Asset decommissioned successfully.');
                navigate('/vehicles');
            } catch (error) {
                toast.error('Failed to decommission vehicle');
            }
        }
    };

    const handleUpdateMileage = async () => {
        const newMileage = prompt('Enter new odometer reading:', vehicle.currentMileage);
        if (newMileage !== null && !isNaN(newMileage)) {
            try {
                await vehicleService.updateMileage(id, parseInt(newMileage));
                toast.success('Logistics updated.');
                fetchVehicle();
            } catch (error) {
                toast.error('Failed to update logistics.');
            }
        }
    };

    const getVehicleDetailsActions = () => [
        {
            label: "Return to Fleet",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => navigate('/vehicles'),
            variant: "outline"
        },
        {
            label: "Update Logistics",
            icon: <Gauge className="h-4 w-4" />,
            onClick: handleUpdateMileage,
            variant: "outline"
        },
        {
            label: "Modify Spec",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => navigate(`/vehicles/edit/${id}`),
            variant: "outline"
        },
        {
            label: "Decommission",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "destructive"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="container mx-auto py-20 text-center space-y-4">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Asset Not Found</h3>
                <Button onClick={() => navigate('/vehicles')} variant="outline">Return to Fleet</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-xl mx-auto pb-12">
            {/* Header Node */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Asset Spec Node</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                        {vehicle.make} {vehicle.model}
                    </h1>
                </div>
                <ResponsiveActions actions={getVehicleDetailsActions()} />
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                                <Car className="h-10 w-10 md:h-12 md:w-12" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">{vehicle.year} Production Cycle</CardTitle>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge variant="outline" className="font-mono text-[10px] md:text-xs font-black tracking-widest uppercase bg-background/50">
                                        {vehicle.licensePlate}
                                    </Badge>
                                    <Badge variant="outline" className="font-mono text-[10px] md:text-xs font-medium opacity-60 bg-background/50">
                                        VIN: {vehicle.vin || 'SIGNAL_MISSING'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 bg-background/40 p-4 md:p-6 rounded-3xl border border-border/50 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics Metrics</p>
                                <p className="text-2xl md:text-3xl font-black text-foreground tabular-nums leading-none">
                                    {vehicle.currentMileage?.toLocaleString() || '0'}
                                    <span className="text-xs ml-1 font-bold text-muted-foreground">MI</span>
                                </p>
                            </div>
                            <Button onClick={handleUpdateMileage} size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors">
                                <Gauge className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 md:px-10 py-4 bg-muted/10 border-b border-border/30 overflow-x-auto whitespace-nowrap">
                            <TabsList className="bg-transparent border-none shadow-none gap-8">
                                <TabsTrigger value="details" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-none p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] relative">
                                    Specifications
                                    {activeTab === 'details' && <div className="absolute -bottom-4 left-0 w-full h-1 bg-primary rounded-full" />}
                                </TabsTrigger>
                                <TabsTrigger value="history" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-none p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] relative">
                                    Service Pipeline
                                    {activeTab === 'history' && <div className="absolute -bottom-4 left-0 w-full h-1 bg-primary rounded-full" />}
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-none p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] relative">
                                    Intel History ({vehicle.notes?.length || 0})
                                    {activeTab === 'notes' && <div className="absolute -bottom-4 left-0 w-full h-1 bg-primary rounded-full" />}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 md:p-10 lg:p-12">
                            <TabsContent value="details" className="mt-0 animate-in fade-in duration-500 space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                    <InfoNode icon={<Car />} label="Architecture" value={`${vehicle.make} ${vehicle.model}`} />
                                    <InfoNode icon={<Calendar />} label="Deployment Year" value={vehicle.year} />
                                    <InfoNode icon={<Palette />} label="Visual Palette" value={vehicle.color || 'SIGNAL_NOT_FOUND'} />
                                    <InfoNode icon={<Cog />} label="Propulsion System" value={vehicle.engineType || 'COMBUSTION_GENERIC'} />
                                </div>

                                {vehicle.customerId && (
                                    <Card className="mt-12 border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] overflow-hidden group hover:bg-emerald-500/10 transition-colors">
                                        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                    <User className="h-7 w-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.3em]">Registered Node Owner</p>
                                                    <p className="text-xl font-black text-foreground uppercase tracking-tight">{vehicle.customerName}</p>
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
                                                        <span className="flex items-center gap-1.5"><Phone size={12} className="opacity-40" /> {vehicle.customerPhone}</span>
                                                        {vehicle.customerEmail && <span className="flex items-center gap-1.5"><Mail size={12} className="opacity-40" /> {vehicle.customerEmail}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 border-emerald-500/20 hover:bg-emerald-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl active:scale-95">
                                                <Link to={`/customers/${vehicle.customerId}`}>View Owner Node</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="mt-0 animate-in fade-in duration-500 space-y-6">
                                {history.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {history.map(record => (
                                            <Card key={record.jobId} className="bg-background/50 border-border/50 hover:border-primary/50 transition-all rounded-3xl overflow-hidden group">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">{record.serviceType}</Badge>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(record.serviceDate).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="font-black text-foreground text-sm uppercase tracking-tight mt-1">{record.description}</p>
                                                        </div>
                                                        <History className="text-primary h-5 w-5 opacity-20 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[8px] font-black">{record.status}</Badge>
                                                        <p className="font-black text-emerald-500">₹{record.cost?.toLocaleString() || '0.00'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/5 space-y-6">
                                        <div className="h-16 w-16 rounded-3xl bg-muted mx-auto flex items-center justify-center">
                                            <History className="h-8 w-8 text-muted-foreground opacity-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">Zero Service History</h4>
                                            <p className="text-xs font-medium text-muted-foreground/30">Asset has no recorded operational maintenance cycles.</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="notes" className="mt-0 animate-in fade-in duration-500 space-y-10">
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Inject Technical Intel</Label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Record specific mechanical observations or diagnostic data..."
                                            rows="3"
                                            className="bg-background/50 border-border/50 rounded-2xl font-medium focus:ring-primary/20 pt-4"
                                        />
                                        <Button type="submit" disabled={!noteContent.trim()} className="sm:h-auto sm:w-32 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95">
                                            Deploy Entry
                                        </Button>
                                    </div>
                                </form>
                                
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 border-b border-border/30 pb-3">Intel History Log</h4>
                                    {vehicle.notes && vehicle.notes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {vehicle.notes.map(note => (
                                                <Card key={note.id} className="bg-muted/10 border-border/30 rounded-3xl overflow-hidden hover:bg-muted/20 transition-colors">
                                                    <CardContent className="p-6">
                                                        <p className="text-sm leading-relaxed font-medium text-foreground/90">{note.content}</p>
                                                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/10">
                                                            <Activity className="h-3 w-3 text-primary opacity-50" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                                Log Time: {new Date(note.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/30 font-bold uppercase tracking-widest italic py-10 text-center">Zero intel nodes logged.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

const InfoNode = ({ icon, label, value }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary opacity-50">
            {React.cloneElement(icon, { size: 14 })}
            <Label className="text-[10px] font-black uppercase tracking-widest">{label}</Label>
        </div>
        <div className="p-5 bg-background/50 border border-border/50 rounded-2xl shadow-inner">
            <p className="text-sm md:text-base font-black text-foreground tracking-widest uppercase leading-tight truncate">{value}</p>
        </div>
    </div>
);

export default VehicleDetails;
