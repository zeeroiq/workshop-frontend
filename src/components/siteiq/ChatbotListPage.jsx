import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, Bot, ExternalLink, RefreshCw } from 'lucide-react';
import { useChatbots } from '@/hooks/siteiq/useChatbots';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatbotStatusBadge from './ChatbotStatusBadge';
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const ChatbotListPage = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const { content, page, loading, removeChatbot } = useChatbots({
        page: currentPage,
        size: 10,
        sort: `${sortConfig.key},${sortConfig.direction}`
    });

    const totalPages = page?.totalPages || 0;
    const chatbots = content || [];

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this chatbot? All scraped data will be lost.")) {
            return;
        }
        try {
            await removeChatbot(id);
            toast.success("Chatbot deleted successfully");
        } catch (error) {
            console.error("Delete error:", error);
            // Error is handled in the hook
        }
    };

    const columns = [
        {
            header: "Chatbot Info",
            sortable: true,
            sortKey: "name",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">{row.name}</span>
                    <a href={row.seedUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        {row.seedUrl} <ExternalLink size={10} />
                    </a>
                </div>
            )
        },
        {
            header: "Status",
            sortable: true,
            sortKey: "status",
            render: (row) => (
                <ChatbotStatusBadge status={row.status} />
            )
        },
        {
            header: "Pages",
            sortable: true,
            sortKey: "pagesScraped",
            render: (row) => (
                <span className="text-xs font-bold">{row.pagesScraped || 0} pages</span>
            )
        },
        {
            header: "Created",
            sortable: true,
            sortKey: "createdAt",
            render: (row) => (
                <span className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); navigate(`/siteiq/chatbots/${row.id}`); }}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                        <Trash size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const renderChatbotCard = (chatbot) => (
        <Card 
            className="overflow-hidden border-border/50 hover:bg-card/80 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/siteiq/chatbots/${chatbot.id}`)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                    <CardTitle className="text-mg font-black group-hover:text-emerald-500 transition-colors">
                        {chatbot.name}
                    </CardTitle>
                    <a href={chatbot.seedUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {chatbot.seedUrl} <ExternalLink size={10} />
                    </a>
                </div>
                <ChatbotStatusBadge status={chatbot.status} />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Indexed Pages</p>
                        <p className="font-bold">{chatbot.pagesScraped || 0}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Created At</p>
                        <p className="font-bold">{new Date(chatbot.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="lg" className="flex-1 h-12 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); navigate(`/siteiq/chatbots/${chatbot.id}`); }}>
                        <Edit size={18} /> MANAGE
                    </Button>
                    <Button variant="outline" size="lg" className="flex-none w-12 h-12 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(chatbot.id); }}>
                        <Trash size={18} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const actions = (
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Link to="/siteiq/chatbots/new" className="flex items-center gap-2">
                <Plus size={14} strokeWidth={3} /> Create Chatbot
            </Link>
        </Button>
    );

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full mx-auto pb-10 pr-6 md:pr-10">
            <ResponsiveDataContainer
                title="SiteIQ Chatbots"
                description="Manage AI assistants trained on your website data"
                actions={actions}
                columns={columns}
                data={chatbots}
                renderCard={renderChatbotCard}
                onRowClick={(row) => navigate(`/siteiq/chatbots/${row.id}`)}
                onSort={handleSort}
                sortConfig={sortConfig}
                loading={loading && chatbots.length === 0}
                emptyMessage="No chatbots created yet. Create an AI assistant to engage with your customers."
                emptyIcon={Bot}
                emptyActionLabel="Create First Chatbot"
                onEmptyAction={() => navigate("/siteiq/chatbots/new")}
            />
            
            {!loading && chatbots.length > 0 && totalPages > 1 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default ChatbotListPage;
