import React, { useState } from 'react';
import FinancialReports from './FinancialReports';
import InventoryReports from './InventoryReports';
import MechanicPerformance from './MechanicPerformance';
import { TrendingUp, Package, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
    const [activeTab, setActiveTab] = useState('financial');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Intelligence Engine</span>
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-tight">Workshop Analytics</h1>
                <p className="text-muted-foreground font-medium">Data-driven insights into your operational performance and output.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-muted/30 border-border/50 p-1 mb-8 overflow-x-auto justify-start">
                    <TabsTrigger value="financial" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-6">
                        <TrendingUp size={16} className="mr-2" /> Financials
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-6">
                        <Package size={16} className="mr-2" /> Inventory
                    </TabsTrigger>
                    <TabsTrigger value="mechanic" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold px-6">
                        <Zap size={16} className="mr-2" /> Workforce
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="financial" className="mt-0 outline-none animate-in fade-in duration-500">
                    <FinancialReports />
                </TabsContent>
                <TabsContent value="inventory" className="mt-0 outline-none animate-in fade-in duration-500">
                    <InventoryReports />
                </TabsContent>
                <TabsContent value="mechanic" className="mt-0 outline-none animate-in fade-in duration-500">
                    <MechanicPerformance />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Reports;
