import React, { useState } from 'react';
import FinancialReports from './FinancialReports';
import InventoryReports from './InventoryReports';
import MechanicPerformance from './MechanicPerformance';
import { LineChart, PieChart, BarChart, UserCog, Activity, Database, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Reports = () => {
    const [activeTab, setActiveTab] = useState('financial');

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto pb-12">
            {/* Responsive Header Cluster */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Activity className="h-3 w-3 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Node Active</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight uppercase leading-none">Operational Intelligence</h1>
                    <p className="text-sm md:text-lg text-muted-foreground font-medium opacity-70">Deep-dive analysis of workshop throughput and financial performance.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-card/30 border-border/50 shadow-lg">
                    <TabsTrigger value="financial" className="flex-1 sm:flex-none">
                        <TrendingUp className="mr-2 h-4 w-4" /> Financial Data
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex-1 sm:flex-none">
                        <Database className="mr-2 h-4 w-4" /> Logistics Data
                    </TabsTrigger>
                    <TabsTrigger value="mechanic" className="flex-1 sm:flex-none">
                        <UserCog className="mr-2 h-4 w-4" /> Analyst Data
                    </TabsTrigger>
                </TabsList>
                
                <div className="mt-8">
                    <TabsContent value="financial" className="animate-in fade-in duration-500">
                        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-md rounded-[2rem]">
                            <CardContent className="p-0">
                                <FinancialReports />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="inventory" className="animate-in fade-in duration-500">
                        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-md rounded-[2rem]">
                            <CardContent className="p-0">
                                <InventoryReports />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="mechanic" className="animate-in fade-in duration-500">
                        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-md rounded-[2rem]">
                            <CardContent className="p-0">
                                <MechanicPerformance />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default Reports;
