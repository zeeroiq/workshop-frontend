import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, ArrowLeft, Car, Phone, Mail, MapPin, Calendar, Activity } from 'lucide-react';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";


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
            toast.error('Failed to fetch customer details');
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
            toast.success('Note added successfully');
            setNoteContent('');
            fetchCustomer();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add note';
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            await customerService.delete(id);
            toast.success('Customer deleted successfully');
            navigate('/customers');
        } catch (error) {
            toast.error('Failed to delete customer');
        }
    };

    const getDetailsActions = () => [
        {
            label: "Return to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => navigate('/customers'),
            variant: "outline"
        },
        {
            label: "Edit Profile",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => navigate(`/customers/edit/${id}`),
            variant: "outline"
        },
        {
            label: "Purge Record",
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

    if (!customer) {
        return (
            <div className="container mx-auto py-20 text-center space-y-4">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Node Not Found</h3>
                <Button onClick={() => navigate('/customers')} variant="outline">Return to Hub</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-xl mx-auto pb-12">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identity Profile</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                        {customer.firstName} {customer.lastName}
                    </h1>
                </div>
                <ResponsiveActions actions={getDetailsActions()} />
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6 md:p-10">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <span className="text-3xl md:text-4xl font-black">{customer.firstName[0]}{customer.lastName[0]}</span>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">Staff Node Metadata</CardTitle>
                            <CardDescription className="font-mono text-[10px] md:text-xs uppercase tracking-widest opacity-60">
                                UID_SEQUENCE: {id.padStart(12, '0')}
                            </CardDescription>
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
                                <TabsTrigger value="vehicles" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-none p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] relative">
                                    Fleet Assets ({customer.vehicles?.length || 0})
                                    {activeTab === 'vehicles' && <div className="absolute -bottom-4 left-0 w-full h-1 bg-primary rounded-full" />}
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-none p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] relative">
                                    System Intelligence ({customer.notes?.length || 0})
                                    {activeTab === 'notes' && <div className="absolute -bottom-4 left-0 w-full h-1 bg-primary rounded-full" />}
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <div className="p-6 md:p-10 lg:p-12">
                            <TabsContent value="details" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <DetailNode icon={<Phone />} label="Primary Hotline" value={customer.phone} />
                                    <DetailNode icon={<Mail />} label="Digital Node (Email)" value={customer.email || 'SIGNAL_NOT_FOUND'} />
                                    <DetailNode icon={<MapPin />} label="Physical Fulfillment Node" value={customer.address || 'LOCATION_UNSPECIFIED'} className="md:col-span-2" />
                                    <DetailNode icon={<Calendar />} label="Initialization Date" value={new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
                                </div>
                            </TabsContent>

                            <TabsContent value="vehicles" className="mt-0 animate-in fade-in duration-500">
                                {customer.vehicles && customer.vehicles.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {customer.vehicles.map(vehicle => (
                                            <Card key={vehicle.id} className="bg-background/50 border-border/50 hover:border-primary/50 transition-all group rounded-3xl overflow-hidden active:scale-[0.98]">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 bg-muted/10 border-b border-border/30">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-base font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                                                            {vehicle.make} {vehicle.model}
                                                        </CardTitle>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{vehicle.year} MODEL</p>
                                                    </div>
                                                    <Car className="text-primary h-5 w-5 opacity-30 group-hover:opacity-100 transition-all transform group-hover:rotate-12" />
                                                </CardHeader>
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">License Plate</p>
                                                            <p className="font-mono text-xs font-black bg-muted/30 w-fit px-2 py-0.5 rounded border border-border/50">{vehicle.licensePlate}</p>
                                                        </div>
                                                        <div className="space-y-1 text-right">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">VIN_NODE</p>
                                                            <p className="font-mono text-[10px] opacity-70 truncate">{vehicle.vin || 'NO_SIGNAL'}</p>
                                                        </div>
                                                    </div>
                                                    <Button asChild size="sm" variant="outline" className="w-full h-10 font-black uppercase tracking-widest text-[9px] rounded-xl border-border/50 active:scale-95">
                                                        <Link to={`/vehicles/${vehicle.id}`}>Connect to Asset</Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/5 space-y-6">
                                        <div className="h-16 w-16 rounded-3xl bg-muted mx-auto flex items-center justify-center">
                                            <Car className="h-8 w-8 text-muted-foreground opacity-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">Zero Assets Detected</h4>
                                            <p className="text-xs font-medium text-muted-foreground/30">Node currently has no registered fleet resources.</p>
                                        </div>
                                        <Button asChild variant="outline" className="h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95">
                                            <Link to="/vehicles/new">
                                                <Plus className="mr-2 h-4 w-4" /> Initialize First Asset
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="notes" className="mt-0 animate-in fade-in duration-500 space-y-10">
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Inject Intel Entry</Label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Record strategic observations for this client node..."
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
                                    {customer.notes && customer.notes.length > 0 ? (
                                        <div className="space-y-4">
                                            {customer.notes.map(note => (
                                                <Card key={note.id} className="bg-muted/10 border-border/30 rounded-3xl overflow-hidden hover:bg-muted/20 transition-colors">
                                                    <CardContent className="p-6 md:p-8">
                                                        <p className="text-sm md:text-base leading-relaxed font-medium text-foreground/90">{note.content}</p>
                                                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/10">
                                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <Activity className="h-3 w-3 text-primary" />
                                                            </div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                                Sync Time: {new Date(note.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/30 font-bold uppercase tracking-widest italic py-10 text-center">No intelligence entries logged for this node.</p>
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

const DetailNode = ({ icon, label, value, className }) => (
    <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 text-primary opacity-50">
            {React.cloneElement(icon, { size: 14 })}
            <Label className="text-[10px] font-black uppercase tracking-widest">{label}</Label>
        </div>
        <div className="p-5 md:p-6 bg-background/50 border border-border/50 rounded-[1.5rem] shadow-inner">
            <p className="text-base md:text-lg font-black text-foreground tracking-tight break-all uppercase leading-tight">{value}</p>
        </div>
    </div>
);

export default CustomerDetails;
