import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Car, User, Fingerprint, Hash, Gauge, Filter } from 'lucide-react';
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
import ResponsiveActions from "@/components/common/ResponsiveActions";

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

    const getVehicleActions = (vehicle) => [
        {
            label: "Inspect Asset",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => navigate(`/vehicles/${vehicle.id}`),
            variant: "outline"
        },
        {
            label: "Edit Spec",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => navigate(`/vehicles/edit/${vehicle.id}`),
            variant: "outline"
        },
        {
            label: "Decommission",
            icon: <Trash className="h-4 w-4" />,
            onClick: () => handleDelete(vehicle.id),
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

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Header Transformation */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase">Staff Hub: Fleet</h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">Managing node for registered vehicle assets.</p>
                </div>
                <Button asChild className="h-12 px-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 w-full lg:w-auto">
                    <Link to="/vehicles/new"><Plus className="mr-2 h-4 w-4" /> Register New Asset</Link>
                </Button>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input
                                    type="text"
                                    placeholder="Search by make, model, plate or VIN..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pl-10 bg-background/50 border-border/50 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-xl">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Matrix */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-b border-border/30">
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Asset Spec</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Ownership</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Tracking</TableHead>
                                    <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">System Controls</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/20">
                                {vehicles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="4" className="h-40 text-center text-muted-foreground italic font-medium">
                                            Zero assets matching current criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <TableRow key={vehicle.id} className="hover:bg-primary/[0.02] transition-colors group border-b border-border/10">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {vehicle.make} {vehicle.model}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground opacity-60 uppercase">{vehicle.year} • TYPE_CHASSIS</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                {vehicle.customerName ? (
                                                    <Link to={`/customers/${vehicle.customerId}`} className="flex flex-col group/link">
                                                        <span className="text-xs font-bold text-foreground group-hover/link:underline decoration-primary underline-offset-4">{vehicle.customerName}</span>
                                                        <span className="text-[10px] text-muted-foreground opacity-60 uppercase font-black tracking-tighter">Authorized Owner</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs font-black text-muted-foreground opacity-30 italic uppercase">Independent</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <Badge variant="outline" className="w-fit font-mono text-[10px] font-black tracking-widest uppercase bg-muted/30 border-border/50">
                                                        {vehicle.licensePlate}
                                                    </Badge>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                        <Gauge className="h-3 w-3 opacity-40" /> {vehicle.currentMileage?.toLocaleString() || '0'} MI
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-right">
                                                <ResponsiveActions actions={getVehicleActions(vehicle)} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Deconstruction */}
                    <div className="md:hidden p-4 space-y-4">
                        {vehicles.length === 0 ? (
                            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                            </div>
                        ) : (
                            vehicles.map((vehicle) => (
                                <Card key={vehicle.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                                    {vehicle.make} {vehicle.model}
                                                </CardTitle>
                                                <p className="text-[9px] font-black tracking-widest text-primary uppercase opacity-70">{vehicle.year} Asset Node</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-muted/20 border-border/50">
                                                    {vehicle.licensePlate}
                                                </Badge>
                                                <ResponsiveActions actions={getVehicleActions(vehicle)} side="horizontal" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Authorized Owner</p>
                                                <p className="font-bold text-foreground truncate">
                                                    {vehicle.customerName || 'INDEPENDENT'}
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics (Mileage)</p>
                                                <p className="font-black text-foreground">
                                                    {vehicle.currentMileage?.toLocaleString() || '0'} <span className="text-[10px] opacity-40">MI</span>
                                                </p>
                                            </div>
                                            <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-2">
                                                    <Fingerprint className="h-3 w-3" /> Chassis Node (VIN)
                                                </p>
                                                <p className="font-mono text-xs text-foreground/70 break-all bg-muted/20 p-2 rounded-lg border border-border/30">
                                                    {vehicle.vin || 'NODATA_SIGNAL_MISSING'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="pt-4 flex justify-center">
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default VehicleList;
