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
            // The service now handles the response structure
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
            fetchCustomer(); // Refresh customer data
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
        return <div>Customer not found</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <Button onClick={() => navigate('/customers')} variant="outline">
                    <FaArrowLeft className="mr-2" /> Back to Customers
                </Button>
                <div className="flex space-x-2">
                    <Button asChild variant="outline">
                        <Link to={`/customers/edit/${id}`}>
                            <FaEdit className="mr-2" /> Edit
                        </Link>
                    </Button>
                    <Button onClick={handleDelete} variant="destructive">
                        <FaTrash className="mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{customer.firstName} {customer.lastName}</CardTitle>
                    <CardDescription>Customer details and related information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="vehicles">Vehicles ({customer.vehicles?.length || 0})</TabsTrigger>
                            <TabsTrigger value="notes">Notes ({customer.notes?.length || 0})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Phone:</Label>
                                    <Input value={customer.phone} readOnly />
                                </div>
                                <div>
                                    <Label>Email:</Label>
                                    <Input value={customer.email || 'N/A'} readOnly />
                                </div>
                                <div>
                                    <Label>Address:</Label>
                                    <Input value={customer.address || 'N/A'} readOnly />
                                </div>
                                <div>
                                    <Label>Registered:</Label>
                                    <Input value={new Date(customer.createdAt).toLocaleDateString()} readOnly />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vehicles" className="p-4">
                            {customer.vehicles && customer.vehicles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customer.vehicles.map(vehicle => (
                                        <Card key={vehicle.id}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-lg font-medium">
                                                    {vehicle.make} {vehicle.model} ({vehicle.year})
                                                </CardTitle>
                                                <FaCar className="text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <p className="text-sm text-muted-foreground">License: {vehicle.licensePlate}</p>
                                                <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
                                                <p className="text-sm text-muted-foreground">Mileage: {vehicle.currentMileage || 'N/A'}</p>
                                                <Button asChild size="sm" className="w-full mt-2">
                                                    <Link to={`/vehicles/${vehicle.id}`}>View Details</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 space-y-4">
                                    <p className="text-muted-foreground">No vehicles registered for this customer.</p>
                                    <Button asChild>
                                        <Link to="/vehicles/new">
                                            <FaPlus className="mr-2" /> Add Vehicle
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="p-4 space-y-4">
                            <form onSubmit={handleAddNote} className="space-y-4">
                                <Textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Add a note about this customer..."
                                    rows="3"
                                />
                                <Button type="submit" disabled={!noteContent.trim()}>
                                    Add Note
                                </Button>
                            </form>

                            <div className="space-y-3">
                                {customer.notes && customer.notes.length > 0 ? (
                                    customer.notes.map(note => (
                                        <Card key={note.id}>
                                            <CardContent className="p-4">
                                                <p className="text-sm">{note.content}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No notes yet.</p>
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