import React, { useState } from 'react';
import FinancialReports from './FinancialReports';
import InventoryReports from './InventoryReports';
import MechanicPerformance from './MechanicPerformance';
import { LineChart, PieChart, BarChart, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Reports = () => {
    const [activeTab, setActiveTab] = useState('financial');

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Intelligence & Analytics</h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">Deep dive into your workshop's operational and financial data.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-1">
                    <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0">
                        <TabsTrigger value="financial" className="flex-1 sm:flex-none">
                            <BarChart className="mr-2 h-4 w-4" /> Financial
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="flex-1 sm:flex-none">
                            <PieChart className="mr-2 h-4 w-4" /> Inventory
                        </TabsTrigger>
                        <TabsTrigger value="mechanic" className="flex-1 sm:flex-none">
                            <UserCog className="mr-2 h-4 w-4" /> Performance
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="financial" className="mt-6 animate-in fade-in duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <FinancialReports />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="inventory" className="mt-6 animate-in fade-in duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <InventoryReports />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="mechanic" className="mt-6 animate-in fade-in duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <MechanicPerformance />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Reports;
