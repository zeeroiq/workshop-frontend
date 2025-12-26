import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Car, User } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchVehicles();
    }, [currentPage]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await vehicleService.getAll(currentPage, 10, searchTerm);
            setVehicles(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchVehicles();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) {
            return;
        }

        try {
            await vehicleService.delete(id);
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to delete vehicle');
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Vehicles</h1>
                    <p className="text-muted-foreground">Manage your workshop vehicles</p>
                </div>
                <Button asChild>
                    <Link to="/vehicles/new"><Plus className="mr-2 h-4 w-4" /> Add New Vehicle</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Vehicles</CardTitle>
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search vehicles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>VIN</TableHead>
                                <TableHead>License Plate</TableHead>
                                <TableHead>Mileage</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="6" className="h-24 text-center">
                                        No vehicles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>
                                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                                            <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                                        </TableCell>
                                        <TableCell>
                                            {vehicle.customerName ? (
                                                <Link to={`/customers/${vehicle.customerId}`} className="flex items-center gap-2 hover:underline">
                                                    <User className="h-4 w-4" />
                                                    {vehicle.customerName}
                                                </Link>
                                            ) : (
                                                'No owner'
                                            )}
                                        </TableCell>
                                        <TableCell>{vehicle.vin || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{vehicle.licensePlate}</Badge>
                                        </TableCell>
                                        <TableCell>{vehicle.currentMileage?.toLocaleString() || '0'} miles</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link to={`/vehicles/${vehicle.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link to={`/vehicles/edit/${vehicle.id}`}><Edit className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(vehicle.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

        </div>
    );
};

export default VehicleList;