import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Car, User, Filter } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const VehicleList = () => {
    const navigate = useNavigate();
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

    const columns = [
        {
            header: "Vehicle",
            accessor: "vehicle",
            cell: (row) => (
                <div>
                    <div className="font-semibold text-foreground">{row.make} {row.model}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.year}</div>
                </div>
            )
        },
        {
            header: "Owner",
            accessor: "customerName",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    <span className="text-sm font-medium">{row.customerName || 'No owner'}</span>
                </div>
            )
        },
        {
            header: "License Plate",
            accessor: "licensePlate",
            cell: (row) => (
                <Badge variant="outline" className="font-mono bg-muted/30 border-border/50">
                    {row.licensePlate}
                </Badge>
            )
        },
        {
            header: "VIN",
            accessor: "vin",
            cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.vin || '-'}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" asChild>
                        <Link to={`/vehicles/${row.id}`} onClick={(e) => e.stopPropagation()}>
                            <Eye className="h-4 w-4 text-emerald-500" />
                            {!isTablet && <span className="ml-2">View</span>}
                        </Link>
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" asChild>
                        <Link to={`/vehicles/edit/${row.id}`} onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4 text-primary" />
                            {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                        </Link>
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                    }}>
                        <Trash className="h-4 w-4" />
                        {!isTablet && <span className="ml-2">Delete</span>}
                    </Button>
                </div>
            )
        }
    ];

    const renderVehicleCard = (vehicle) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors">
                    {vehicle.make} {vehicle.model}
                </CardTitle>
                <Badge variant="outline" className="font-mono">{vehicle.licensePlate}</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Owner</p>
                        <p className="font-medium mt-1 truncate">{vehicle.customerName || 'No owner'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Year</p>
                        <p className="font-medium mt-1">{vehicle.year}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">VIN</p>
                        <p className="font-mono text-xs mt-1 truncate">{vehicle.vin || '-'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-11 gap-2 border-border/50"
                        asChild
                    >
                        <Link to={`/vehicles/edit/${vehicle.id}`} onClick={(e) => e.stopPropagation()}>
                            <Edit size={16} />
                            <span>Edit</span>
                        </Link>
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="flex-1 h-11 gap-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(vehicle.id);
                        }}
                    >
                        <Trash size={16} />
                        <span>Delete</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search vehicles by make, model, plate or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                />
            </form>
            <Button variant="outline" className="border-border/50 gap-2">
                <Filter size={16} />
                <span>Filters</span>
            </Button>
        </div>
    );

    const actions = (
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Link to="/vehicles/new"><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Link>
        </Button>
    );

    return (
        <div className="pb-10">
            <ResponsiveDataContainer
                title="Vehicles"
                description="Manage customer vehicles and service history"
                actions={actions}
                filters={filters}
                columns={columns}
                data={vehicles}
                renderCard={renderVehicleCard}
                onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
                loading={loading}
                emptyMessage="No vehicles found. Click 'Add Vehicle' to register a new vehicle."
            />
            
            {!loading && vehicles.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default VehicleList;
