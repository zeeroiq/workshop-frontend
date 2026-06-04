import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Eye, Plus, Search, Car, History, Wrench, AlertTriangle } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';
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
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, [currentPage, searchTerm, activeFilter, sortConfig]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await vehicleService.getAll(
                currentPage, 
                10, 
                searchTerm, 
                activeFilter,
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

    return (
        <div className="w-full mx-auto space-y-8 pb-10">
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
                filters={
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar flex-1">
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
                }
                data={vehicles}
                renderCard={renderCard}
                columns={columns}
                onRowClick={(v) => navigate(`/vehicles/${v.id}`)}
                onSort={handleSort}
                sortConfig={sortConfig}
                loading={loading && vehicles.length === 0}
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
