import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    User, 
    Car, 
    Wrench, 
    Package, 
    Command,
    Loader2,
    ArrowRight,
    History,
    FileText,
    Truck,
    ShoppingCart,
    X,
    Trash2
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { searchService } from '@/services/searchService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Omnisearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        customers: [],
        vehicles: [],
        jobs: [],
        parts: [],
        invoices: [],
        suppliers: [],
        purchaseOrders: []
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('search_history');
        return saved ? JSON.parse(saved) : [];
    });
    
    const navigate = useNavigate();

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Perform Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const response = await searchService.globalSearch(query);
                    if (response.data.success) {
                        setResults(response.data.data);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ 
                    customers: [], vehicles: [], jobs: [], parts: [], 
                    invoices: [], suppliers: [], purchaseOrders: [] 
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const addToHistory = (item) => {
        const newHistory = [item, ...history.filter(h => h.id !== item.id || h.type !== item.type)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('search_history');
    };

    const handleSelect = (type, item) => {
        setIsOpen(false);
        setQuery('');
        
        let path = '';
        let label = '';
        let icon = null;

        switch(type) {
            case 'customer':
                path = `/customers/${item.id}`;
                label = `${item.firstName} ${item.lastName}`;
                icon = 'user';
                break;
            case 'vehicle':
                path = `/vehicles/${item.id}`;
                label = `${item.make} ${item.model} (${item.licensePlate})`;
                icon = 'car';
                break;
            case 'job':
                path = `/jobs/${item.id}`;
                label = `${item.jobNumber} - ${item.customerName}`;
                icon = 'wrench';
                break;
            case 'part':
                path = `/inventory`; 
                label = `${item.name} (${item.partNumber})`;
                icon = 'package';
                break;
            case 'invoice':
                path = `/invoices/${item.id}`;
                label = `${item.invoiceNumber} - ${item.customerName}`;
                icon = 'invoice';
                break;
            case 'supplier':
                path = `/inventory`; 
                label = `${item.name}`;
                icon = 'supplier';
                break;
            case 'purchaseOrder':
                path = `/inventory`; 
                label = `${item.orderNumber} - ${item.supplierName}`;
                icon = 'po';
                break;
            default:
                break;
        }

        addToHistory({ id: item.id, type, label, path, icon });
        navigate(path);
    };

    const hasResults = results.customers.length > 0 || results.vehicles.length > 0 || 
                       results.jobs.length > 0 || results.parts.length > 0 || 
                       results.invoices.length > 0 || results.suppliers.length > 0 || 
                       results.purchaseOrders.length > 0;

    const getIcon = (type) => {
        switch(type) {
            case 'user': return <User size={16}/>;
            case 'car': return <Car size={16}/>;
            case 'wrench': return <Wrench size={16}/>;
            case 'package': return <Package size={16}/>;
            case 'invoice': return <FileText size={16}/>;
            case 'supplier': return <Truck size={16}/>;
            case 'po': return <ShoppingCart size={16}/>;
            default: return <Search size={16}/>;
        }
    };

    return (
        <div className="flex-1 w-full">
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-between w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-muted-foreground bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-all group"
            >
                <div className="flex items-center gap-2">
                    <Search size={14} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="hidden sm:inline">Search everything...</span><span className="sm:hidden">Search...</span>
                </div>
                <kbd className="hidden lg:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                    <div className="sr-only">
                        <DialogTitle>Global Search</DialogTitle>
                        <DialogDescription>Search for customers, vehicles, jobs, parts, invoices, and suppliers.</DialogDescription>
                    </div>

                    <div className="flex items-center border-b border-border/50 px-4 h-14">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            placeholder="Type to find anything..."
                            className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground font-bold"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                        {!loading && <Command className="h-4 w-4 text-muted-foreground opacity-50" />}
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                        {query.length < 2 && history.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <History size={12} /> Recent History
                                    </h3>
                                    <button 
                                        onClick={clearHistory}
                                        className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={10} /> Clear
                                    </button>
                                </div>
                                {history.map((item, idx) => (
                                    <SearchResultItem 
                                        key={idx}
                                        icon={getIcon(item.icon)}
                                        label={item.label}
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate(item.path);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {query.length >= 2 && !hasResults && !loading && (
                            <div className="py-10 text-center">
                                <Search className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No matches found for "{query}"</p>
                            </div>
                        )}

                        {results.customers.length > 0 && (
                            <SearchGroup label="Customers">
                                {results.customers.map(c => (
                                    <SearchResultItem 
                                        key={c.id} 
                                        icon={<User size={16} className="text-blue-500" />} 
                                        label={`${c.firstName} ${c.lastName}`}
                                        sublabel={c.phone}
                                        onClick={() => handleSelect('customer', c)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.vehicles.length > 0 && (
                            <SearchGroup label="Vehicles">
                                {results.vehicles.map(v => (
                                    <SearchResultItem 
                                        key={v.id} 
                                        icon={<Car size={16} className="text-amber-500" />} 
                                        label={`${v.make} ${v.model}`}
                                        sublabel={v.licensePlate}
                                        onClick={() => handleSelect('vehicle', v)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.jobs.length > 0 && (
                            <SearchGroup label="Jobs">
                                {results.jobs.map(j => (
                                    <SearchResultItem 
                                        key={j.id} 
                                        icon={<Wrench size={16} className="text-emerald-500" />} 
                                        label={j.jobNumber}
                                        sublabel={j.customerName}
                                        onClick={() => handleSelect('job', j)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.invoices.length > 0 && (
                            <SearchGroup label="Invoices">
                                {results.invoices.map(i => (
                                    <SearchResultItem 
                                        key={i.id} 
                                        icon={<FileText size={16} className="text-purple-500" />} 
                                        label={i.invoiceNumber}
                                        sublabel={`${i.customerName} - ₹${i.totalAmount}`}
                                        onClick={() => handleSelect('invoice', i)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.parts.length > 0 && (
                            <SearchGroup label="Inventory Parts">
                                {results.parts.map(p => (
                                    <SearchResultItem 
                                        key={p.id} 
                                        icon={<Package size={16} className="text-sky-500" />} 
                                        label={p.name}
                                        sublabel={p.partNumber}
                                        onClick={() => handleSelect('part', p)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.suppliers.length > 0 && (
                            <SearchGroup label="Suppliers">
                                {results.suppliers.map(s => (
                                    <SearchResultItem 
                                        key={s.id} 
                                        icon={<Truck size={16} className="text-rose-500" />} 
                                        label={s.name}
                                        sublabel={s.phone}
                                        onClick={() => handleSelect('supplier', s)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.purchaseOrders.length > 0 && (
                            <SearchGroup label="Purchase Orders">
                                {results.purchaseOrders.map(po => (
                                    <SearchResultItem 
                                        key={po.id} 
                                        icon={<ShoppingCart size={16} className="text-orange-500" />} 
                                        label={po.orderNumber}
                                        sublabel={po.supplierName}
                                        onClick={() => handleSelect('purchaseOrder', po)}
                                    />
                                ))}
                            </SearchGroup>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">⏎</kbd>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Select</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Navigate</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500/80">Global Discovery</span>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const SearchGroup = ({ label, children }) => (
    <div className="mb-4 last:mb-0">
        <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-border/10 mb-1">
            {label}
        </h3>
        {children}
    </div>
);

const SearchResultItem = ({ icon, label, sublabel, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 group transition-all text-left"
    >
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{label}</p>
                {sublabel && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{sublabel}</p>}
            </div>
        </div>
        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </button>
);

export default Omnisearch;
