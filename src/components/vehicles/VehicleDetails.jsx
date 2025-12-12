import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaCar, FaUser, FaHistory, FaStickyNote, FaCog } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

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
    if (!vehicle) return <div>Vehicle not found</div>;

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <Button onClick={() => navigate('/vehicles')} variant="outline">
                    <FaArrowLeft className="mr-2" /> Back to Vehicles
                </Button>
                <div className="flex space-x-2">
                    <Button asChild variant="outline">
                        <Link to={`/vehicles/edit/${id}`}><FaEdit className="mr-2" /> Edit</Link>
                    </Button>
                    <Button onClick={handleDelete} variant="destructive">
                        <FaTrash className="mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
                    <CardDescription>License: {vehicle.licensePlate} | VIN: {vehicle.vin || 'N/A'}</CardDescription>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details"><FaCar className="mr-2" />Details</TabsTrigger>
                    <TabsTrigger value="history"><FaHistory className="mr-2" />Service History</TabsTrigger>
                    <TabsTrigger value="notes"><FaStickyNote className="mr-2" />Notes ({vehicle.notes?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                    <Card>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InfoItem label="Make & Model" value={`${vehicle.make} ${vehicle.model}`} />
                            <InfoItem label="Year" value={vehicle.year} />
                            <InfoItem label="Color">
                                <div className="flex items-center">
                                    <span className="w-6 h-6 rounded-full mr-2 border" style={{ backgroundColor: vehicle.color?.toLowerCase() || '#ccc' }}></span>
                                    {vehicle.color || 'N/A'}
                                </div>
                            </InfoItem>
                            <InfoItem label="License Plate" value={vehicle.licensePlate} />
                            <InfoItem label="VIN" value={vehicle.vin || 'N/A'} />
                            <InfoItem label="Mileage">
                                <div className="flex items-center">
                                    {vehicle.currentMileage?.toLocaleString() || '0'} miles
                                    <Button onClick={handleUpdateMileage} size="sm" variant="ghost" className="ml-2"><FaCog /></Button>
                                </div>
                            </InfoItem>
                            <InfoItem label="Engine Type" value={vehicle.engineType || 'N/A'} />
                            <InfoItem label="Registered" value={new Date(vehicle.createdAt).toLocaleDateString()} />
                        </CardContent>
                    </Card>
                    {vehicle.customerId && (
                        <Card className="mt-6">
                            <CardHeader><CardTitle>Owner Information</CardTitle></CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FaUser className="text-2xl text-muted-foreground mr-4" />
                                    <div>
                                        <p className="font-semibold">{vehicle.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{vehicle.customerPhone} {vehicle.customerEmail && `• ${vehicle.customerEmail}`}</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline">
                                    <Link to={`/customers/${vehicle.customerId}`}>View Customer</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map(record => (
                                        <div key={record.jobId} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <p className="font-semibold">{record.serviceType} on {new Date(record.serviceDate).toLocaleDateString()}</p>
                                                <p className="text-sm text-muted-foreground">{record.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{record.status}</p>
                                                <p className="text-sm text-muted-foreground">Cost: ${record.cost || '0'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaHistory className="mx-auto text-4xl text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No service history</h3>
                                    <p className="text-muted-foreground">This vehicle hasn't had any services yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <form onSubmit={handleAddNote} className="flex items-start space-x-4">
                                <Textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Add a note about this vehicle..."
                                    rows="3"
                                    className="flex-grow"
                                />
                                <Button type="submit" disabled={!noteContent.trim()}>Add Note</Button>
                            </form>
                            <div className="space-y-3">
                                {vehicle.notes && vehicle.notes.length > 0 ? (
                                    vehicle.notes.map(note => (
                                        <div key={note.id} className="p-3 border rounded-lg bg-muted/50">
                                            <p className="text-sm">{note.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <FaStickyNote className="mx-auto text-4xl text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold">No notes yet</h3>
                                        <p className="text-muted-foreground">Add your first note about this vehicle.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const InfoItem = ({ label, value, children }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {value ? <p>{value}</p> : children}
    </div>
);

export default VehicleDetails;
