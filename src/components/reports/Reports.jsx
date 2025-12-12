import React, { useState } from 'react';
import FinancialReports from './FinancialReports';
import InventoryReports from './InventoryReports';
import MechanicPerformance from './MechanicPerformance';
import { LineChart, PieChart, BarChart, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Reports = () => {
    const [activeTab, setActiveTab] = useState('financial');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'financial':
                return <FinancialReports />;
            case 'inventory':
                return <InventoryReports />;
            case 'mechanic':
                return <MechanicPerformance />;
            default:
                return <FinancialReports />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Analyze your workshop's performance.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="financial"><BarChart className="mr-2 h-4 w-4" /> Financial Reports</TabsTrigger>
                    <TabsTrigger value="inventory"><PieChart className="mr-2 h-4 w-4" /> Inventory Reports</TabsTrigger>
                    <TabsTrigger value="mechanic"><UserCog className="mr-2 h-4 w-4" /> Mechanic Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="financial">
                    <Card>
                        <CardContent className="pt-6">
                            <FinancialReports />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inventory">
                    <Card>
                        <CardContent className="pt-6">
                            <InventoryReports />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="mechanic">
                    <Card>
                        <CardContent className="pt-6">
                            <MechanicPerformance />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Reports;