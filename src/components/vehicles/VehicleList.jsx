import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Filter, Car, History, Wrench, AlertTriangle, Loader2 } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaginationComponent from "@/components/common/PaginationComponent";
import { cn } from '@/lib/utils';
import ResponsiveDataContainer from '../common/layout/ResponsiveDataContainer';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, [currentPage, searchTerm, activeFilter]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // Backend now supports 'activeFilter' directly in getAll.
            const response = await vehicleService.getAll(currentPage, 10, searchTerm, activeFilter);
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

    const renderCard = (vehicle) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-background transition-colors">
                        <Car size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm tracking-tight">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{vehicle.licensePlate}</p>
                    </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] bg-background border-border/50">
                    {vehicle.year}
                </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/30">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Owner</p>
                    <p className="text-xs font-bold truncate">{vehicle.customerName || 'Private Fleet'}</p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Odometer</p>
                    <p className="text-xs font-bold">{vehicle.mileage?.toLocaleString() || 0} KM</p>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg border-border/50 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                    <Eye size={14} /> Full Intel
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg border-border/50 p-0" onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}>
                    <Edit size={14} />
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg border-border/50 p-0 text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(vehicle.id)}>
                    <Trash size={14} />
                </Button>
            </div>
        </div>
    );

    const columns = [
        {
            header: 'Asset Identity',
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
            render: (v) => <span className="font-mono text-xs font-bold">{v.year}</span>
        },
        {
            header: 'Owner Mapping',
            render: (v) => (
                <div className="text-xs font-bold text-foreground/80">
                    {v.customerName || <span className="text-muted-foreground opacity-50 italic">Unassigned</span>}
                </div>
            )
        },
        {
            header: 'Odometer',
            render: (v) => <span className="font-black text-xs">{v.mileage?.toLocaleString() || 0} <span className="text-[9px] text-muted-foreground ml-0.5">KM</span></span>
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (v) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => navigate(`/vehicles/${v.id}`)}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate(`/vehicles/edit/${v.id}`)}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(v.id)}>
                        <Trash size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Registry: Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Fleet Intelligence</h1>
                    <p className="text-muted-foreground font-medium">Monitoring <span className="text-foreground font-bold">{totalPages * 10}+</span> high-performance assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Search by VIN or Plate..."
                            className="pl-10 w-64 h-12 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
                        <Link to="/vehicles/new" className="flex items-center gap-2">
                            <Plus size={16} strokeWidth={3} /> Register Asset
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'ALL', label: 'All Assets', icon: <Car size={14} /> },
                    { id: 'UNDER_MAINTENANCE', label: 'In Service', icon: <Wrench size={14} /> },
                    { id: 'HISTORY_PENDING', label: 'Pending Docs', icon: <History size={14} /> },
                    { id: 'ALERT', label: 'Alerts', icon: <AlertTriangle size={14} /> }
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => {
                            setActiveFilter(filter.id);
                            toast.info(`Filtering by ${filter.label}`);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                            activeFilter === filter.id 
                                ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-lg shadow-emerald-500/20" 
                                : "bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground"
                        )}
                    >
                        {filter.icon}
                        {filter.label}
                    </button>
                ))}
            </div>

            {loading && vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Fleet Registry...</p>
                </div>
            ) : vehicles.length === 0 ? (
                <Card className="border-dashed border-border/50 bg-card/30">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                            <Search size={32} className="text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-1">No Assets Found</h3>
                        <p className="text-sm text-muted-foreground mb-6">Your search parameters returned zero registry matches.</p>
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setActiveFilter('ALL'); }} className="rounded-xl border-border/50 uppercase text-[10px] font-black tracking-widest">
                            Clear Parameters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <ResponsiveDataContainer
                        data={vehicles}
                        renderCard={renderCard}
                        columns={columns}
                    />

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
