import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaCar } from 'react-icons/fa';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


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
            console.error('Error adding note:', error);
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
            const message = error.response?.data?.message || 'Failed to delete customer';
            toast.error(message);
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!customer) {
        return <div className="p-8 text-center">Customer not found</div>;
    }

    return (
        <div className="container mx-auto py-4 md:py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button onClick={() => navigate('/customers')} variant="outline" size="sm" className="w-fit">
                    <FaArrowLeft className="mr-2" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Link to={`/customers/edit/${id}`}>
                            <FaEdit className="mr-2" /> Edit
                        </Link>
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" size="sm" className="flex-1 sm:flex-none">
                        <FaTrash className="mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl md:text-3xl font-bold">{customer.firstName} {customer.lastName}</CardTitle>
                    <CardDescription>Customer account ID: {id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="overflow-x-auto pb-1">
                            <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0">
                                <TabsTrigger value="details" className="flex-1 sm:flex-none">Details</TabsTrigger>
                                <TabsTrigger value="vehicles" className="flex-1 sm:flex-none">Vehicles ({customer.vehicles?.length || 0})</TabsTrigger>
                                <TabsTrigger value="notes" className="flex-1 sm:flex-none">Notes ({customer.notes?.length || 0})</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <TabsContent value="details" className="mt-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Phone Number</Label>
                                    <p className="text-lg font-medium p-2 bg-muted/30 rounded-md border border-border/50">{customer.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Email Address</Label>
                                    <p className="text-lg font-medium p-2 bg-muted/30 rounded-md border border-border/50 truncate">{customer.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Physical Address</Label>
                                    <p className="text-lg font-medium p-2 bg-muted/30 rounded-md border border-border/50">{customer.address || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Member Since</Label>
                                    <p className="text-base font-medium p-2 bg-muted/30 rounded-md border border-border/50">
                                        {new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vehicles" className="mt-6 animate-in fade-in duration-300">
                            {customer.vehicles && customer.vehicles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customer.vehicles.map(vehicle => (
                                        <Card key={vehicle.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-base font-bold">
                                                    {vehicle.make} {vehicle.model}
                                                </CardTitle>
                                                <FaCar className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Year</p>
                                                        <p>{vehicle.year}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">License</p>
                                                        <p className="font-mono">{vehicle.licensePlate}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">VIN</p>
                                                        <p className="font-mono text-xs truncate">{vehicle.vin}</p>
                                                    </div>
                                                </div>
                                                <Button asChild size="sm" variant="outline" className="w-full mt-2">
                                                    <Link to={`/vehicles/${vehicle.id}`}>View Details</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground mb-4">No vehicles registered for this customer.</p>
                                    <Button asChild variant="outline">
                                        <Link to="/vehicles/new">
                                            <FaPlus className="mr-2" /> Add First Vehicle
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-6 animate-in fade-in duration-300 space-y-6">
                            <form onSubmit={handleAddNote} className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Add New Note</Label>
                                <Textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Type important customer details here..."
                                    rows="3"
                                    className="bg-muted/20"
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={!noteContent.trim()} size="sm">
                                        Post Note
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Note History</h4>
                                {customer.notes && customer.notes.length > 0 ? (
                                    <div className="space-y-3">
                                        {customer.notes.map(note => (
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
                                    <p className="text-sm text-muted-foreground italic">No notes recorded for this customer yet.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerDetails;
