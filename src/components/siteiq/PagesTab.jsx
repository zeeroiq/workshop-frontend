import React, { useState } from 'react';
import { 
    FileText, 
    Trash, 
    Search,
    RefreshCw,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import PaginationComponent from "@/components/common/PaginationComponent";
import LoadingSpinner from '../common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useChatbotPages } from '@/hooks/siteiq/useChatbotPages';

const PagesTab = ({ chatbotId }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const { content: pages, page, loading, deletePage, refetch } = useChatbotPages(chatbotId, {
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc',
        status: statusFilter === 'ALL' ? undefined : statusFilter
    });

    const handleDelete = async (pageId) => {
        if (!window.confirm("Are you sure you want to delete this page from the index? It will no longer be used for AI responses.")) return;
        try {
            await deletePage(pageId);
        } catch (e) {
            // Error handled in hook
        }
    };

    // Filter by search query on the client side since API doesn't support text search yet
    const filteredPages = pages?.filter(p => 
        p.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader className="border-b border-border/50 bg-muted/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" /> Indexed Pages
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                        Total: {page?.totalElements || 0} pages in the knowledge base
                    </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search URLs..."
                            className="pl-9 bg-background border-border/50 h-9 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}>
                        <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs bg-background border-border/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9 shrink-0" title="Refresh list">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading && pages?.length === 0 ? (
                    <div className="p-12 flex justify-center"><LoadingSpinner /></div>
                ) : pages?.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <Globe size={48} className="text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-black mb-1">No pages indexed</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mb-6">
                            {statusFilter !== 'ALL' 
                                ? `No pages found with status ${statusFilter}.` 
                                : "Click 'Retrain Bot' above to start scraping your website and building the knowledge base."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="border-border/50">
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest pl-6">URL</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPages.length > 0 ? filteredPages.map((p) => (
                                    <TableRow key={p.id} className="border-border/50 hover:bg-muted/10 transition-colors group">
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex flex-col">
                                                <a 
                                                    href={p.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-sm font-bold text-foreground hover:text-emerald-500 transition-colors truncate max-w-[400px]" 
                                                    title={p.url}
                                                >
                                                    {p.url}
                                                </a>
                                                {p.title && <span className="text-xs text-muted-foreground truncate max-w-[400px] mt-0.5">{p.title}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                p.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                p.status === 'FAILED' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10"
                                                onClick={() => handleDelete(p.id)}
                                                title="Delete from index"
                                            >
                                                <Trash size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-sm text-muted-foreground">
                                            No pages match your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
                
                {!loading && page?.totalPages > 1 && (
                    <div className="p-4 border-t border-border/50">
                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={page.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PagesTab;
