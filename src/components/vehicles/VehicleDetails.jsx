import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaCar, FaUser, FaHistory, FaStickyNote, FaCog, FaPalette, FaHashtag, FaCalendarAlt, FaTachometerAlt } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
            toast.success('Note added successfully');
            setNoteContent('');
            fetchVehicle();
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await vehicleService.delete(id);
                toast.success('Vehicle deleted successfully');
                navigate('/vehicles');
            } catch (error) {
                toast.error('Failed to delete vehicle');
            }
        }
    };

    const handleUpdateMileage = async () => {
        const newMileage = prompt('Enter new mileage:', vehicle.currentMileage);
        if (newMileage !== null && !isNaN(newMileage)) {
            try {
                await vehicleService.updateMileage(id, parseInt(newMileage));
                toast.success('Mileage updated successfully');
                fetchVehicle();
            } catch (error) {
                toast.error('Failed to update mileage');
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!vehicle) return <div className="p-8 text-center">Vehicle not found</div>;

    return (
        <div className="container mx-auto py-4 md:py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button onClick={() => navigate('/vehicles')} variant="outline" size="sm" className="w-fit">
                    <FaArrowLeft className="mr-2" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Link to={`/vehicles/edit/${id}`}><FaEdit className="mr-2" /> Edit</Link>
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" size="sm" className="flex-1 sm:flex-none">
                        <FaTrash className="mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl md:text-3xl font-bold">{vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <span className="bg-muted px-2 py-0.5 rounded font-mono text-xs">{vehicle.licensePlate}</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span className="font-mono text-xs">{vehicle.vin || 'NO VIN'}</span>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Odometer</p>
                                <p className="text-xl font-black">{vehicle.currentMileage?.toLocaleString() || '0'} <span className="text-sm font-medium text-muted-foreground">mi</span></p>
                            </div>
                            <Button onClick={handleUpdateMileage} size="icon" variant="outline" className="h-10 w-10">
                                <FaCog className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="overflow-x-auto pb-1">
                            <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0">
                                <TabsTrigger value="details" className="flex-1 sm:flex-none"><FaCar className="mr-2 h-3 w-3" />Details</TabsTrigger>
                                <TabsTrigger value="history" className="flex-1 sm:flex-none"><FaHistory className="mr-2 h-3 w-3" />History</TabsTrigger>
                                <TabsTrigger value="notes" className="flex-1 sm:flex-none"><FaStickyNote className="mr-2 h-3 w-3" />Notes ({vehicle.notes?.length || 0})</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="details" className="mt-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <InfoBlock icon={<FaCar />} label="Make & Model" value={`${vehicle.make} ${vehicle.model}`} />
                                <InfoBlock icon={<FaCalendarAlt />} label="Year" value={vehicle.year} />
                                <InfoBlock icon={<FaPalette />} label="Color">
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: vehicle.color?.toLowerCase() || '#ccc' }}></span>
                                        <span className="font-medium">{vehicle.color || 'N/A'}</span>
                                    </div>
                                </InfoBlock>
                                <InfoBlock icon={<FaHashtag />} label="License Plate" value={vehicle.licensePlate} />
                                <InfoBlock icon={<FaHashtag />} label="VIN Number" value={vehicle.vin || 'N/A'} isMono />
                                <InfoBlock icon={<FaTachometerAlt />} label="Current Mileage" value={`${vehicle.currentMileage?.toLocaleString() || '0'} miles`} />
                                <InfoBlock icon={<FaCog />} label="Engine Type" value={vehicle.engineType || 'N/A'} />
                                <InfoBlock icon={<FaCalendarAlt />} label="Registration Date" value={new Date(vehicle.createdAt).toLocaleDateString()} />
                            </div>

                            {vehicle.customerId && (
                                <Card className="mt-8 border-emerald-500/20 bg-emerald-500/5">
                                    <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <FaUser className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-widest">Registered Owner</p>
                                                <p className="text-lg font-bold">{vehicle.customerName}</p>
                                                <p className="text-xs text-muted-foreground">{vehicle.customerPhone} {vehicle.customerEmail && `• ${vehicle.customerEmail}`}</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto border-emerald-500/20 hover:bg-emerald-500/10">
                                            <Link to={`/customers/${vehicle.customerId}`}>View Profile</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="mt-6 animate-in fade-in duration-300">
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map(record => (
                                        <Card key={record.jobId} className="bg-muted/10 border-border/50 hover:bg-muted/20 transition-colors">
                                            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{record.serviceType}</Badge>
                                                        <span className="text-xs text-muted-foreground font-medium">{new Date(record.serviceDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="font-bold text-foreground">{record.description}</p>
                                                </div>
                                                <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">{record.status}</Badge>
                                                    <p className="text-sm font-black text-foreground mt-1">₹{record.cost?.toLocaleString() || '0.00'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
                                    <FaHistory className="mx-auto text-4xl text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold text-muted-foreground">No service history</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">This vehicle hasn't undergone any recorded services yet.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-6 animate-in fade-in duration-300 space-y-6">
                            <form onSubmit={handleAddNote} className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Add Service Note</Label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Record specific mechanical details or observations..."
                                        rows="2"
                                        className="flex-grow bg-muted/20"
                                    />
                                    <Button type="submit" disabled={!noteContent.trim()} className="sm:h-auto">Add</Button>
                                </div>
                            </form>
                            
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Historical Notes</h4>
                                {vehicle.notes && vehicle.notes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vehicle.notes.map(note => (
                                            <Card key={note.id} className="bg-muted/10 border-border/30">
                                                <CardContent className="p-4">
                                                    <p className="text-sm leading-relaxed">{note.content}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-tighter">
                                                        {new Date(note.createdAt).toLocaleString()}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No notes recorded for this vehicle.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

const InfoBlock = ({ icon, label, value, children, isMono }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">{icon}</span>
            <Label className="text-[10px] uppercase tracking-wider font-bold">{label}</Label>
        </div>
        <div className={cn(
            "text-base font-medium p-2 bg-muted/30 rounded-md border border-border/50",
            isMono && "font-mono text-xs break-all"
        )}>
            {value || children}
        </div>
    </div>
);

export default VehicleDetails;
