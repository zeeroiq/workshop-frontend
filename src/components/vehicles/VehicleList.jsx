import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Car, History, Wrench, AlertTriangle, Filter } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import PaginationComponent from "@/components/common/PaginationComponent";
import { cn } from '@/lib/utils';
import ResponsiveDataContainer from '../common/layout/ResponsiveDataContainer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchVehicles();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm, activeFilter, sortConfig]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await vehicleService.getAll(
                currentPage, 
                10, 
                searchTerm, 
                activeFilter || 'ALL',
                sortConfig.key,
                sortConfig.direction
            );
            if (response.data) {
                setVehicles(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to sync fleet data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (filterValue) => {
        if (activeFilter === filterValue) {
            setActiveFilter(''); // Toggle off
        } else {
            setActiveFilter(filterValue);
        }
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Decommission this vehicle from the fleet registry?')) {
            try {
                await vehicleService.delete(id);
                toast.success('Vehicle decommissioned successfully');
                fetchVehicles();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to decommission asset');
            }
        }
    };

    const renderVehicleCard = (vehicle) => (
        <Card 
            className="overflow-hidden border-border/50 hover:bg-card/80 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                    <CardTitle className="text-mg font-black group-hover:text-emerald-500 transition-colors">
                        {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{vehicle.licensePlate}</p>
                </div>
                <Badge variant="outline" className="bg-background border-border/50 text-[10px] font-mono font-black">{vehicle.year}</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Ownership</p>
                        <p className="font-bold truncate">{vehicle.customerName || 'PRIVATE_FLEET'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Technical Odo</p>
                        <p className="font-black">{vehicle.mileage?.toLocaleString() || 0} <span className="text-[9px] text-muted-foreground">KM</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Color Finish</p>
                        <p className="font-bold uppercase text-muted-foreground">{vehicle.color || 'NO_DATA'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">File Status</p>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">SYNCED</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${vehicle.id}`); }}>
                        <Eye size={18} /> FULL INTEL
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/edit/${vehicle.id}`); }}>
                        <Edit size={18} /> EDIT
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const columns = [
        {
            header: 'Asset Identity',
            sortable: true,
            sortKey: 'make',
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/50">
                        <Car size={18} className="text-emerald-500" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">{v.make} {v.model}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">{v.licensePlate}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Year',
            sortable: true,
            sortKey: 'year',
            render: (v) => <span className="font-mono text-xs font-bold">{v.year}</span>
        },
        {
            header: 'Owner Mapping',
            sortable: true,
            sortKey: 'customer.firstName',
            render: (v) => (
                <div className="text-xs font-bold text-foreground/80">
                    {v.customerName || <span className="text-muted-foreground opacity-50 italic">Unassigned</span>}
                </div>
            )
        },
        {
            header: 'Odometer',
            sortable: true,
            sortKey: 'currentMileage',
            render: (v) => <span className="font-black text-xs">{v.mileage?.toLocaleString() || 0} <span className="text-[9px] text-muted-foreground ml-0.5">KM</span></span>
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (v) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500" onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${v.id}`); }}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/edit/${v.id}`); }}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}>
                        <Trash size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1 shrink-0">
                    <Filter size={10} /> Filters:
                </span>
                
                <Select value={activeFilter || 'ALL'} onValueChange={handleFilter}>
                    <SelectTrigger className="w-[180px] h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/50 bg-card/50">
                        <SelectValue placeholder="Fleet Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">ALL ASSETS</SelectItem>
                        <SelectItem value="UNDER_MAINTENANCE">IN SERVICE</SelectItem>
                        <SelectItem value="HISTORY_PENDING">PENDING DOCUMENTATION</SelectItem>
                        <SelectItem value="ALERT">HIGH MILEAGE ALERTS</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    placeholder="Search by VIN or Plate..."
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto space-y-8 pb-10 pr-10">
            <ResponsiveDataContainer
                title="Fleet Intelligence"
                description={
                    <span>Monitoring <span className="text-foreground font-bold">{totalPages * 10}+</span> high-performance assets.</span>
                }
                actions={
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                        <Link to="/vehicles/new" className="flex items-center gap-2">
                            <Plus size={14} strokeWidth={3} /> Register Asset
                        </Link>
                    </Button>
                }
                filters={filters}
                data={vehicles}
                renderCard={renderVehicleCard}
                columns={columns}
                onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
                onSort={handleSort}
                sortConfig={sortConfig}
                loading={loading && vehicles.length == 0}
            />

            {!loading && vehicles.length > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default VehicleList;