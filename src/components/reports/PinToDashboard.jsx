import React, { useState } from 'react';
import { Pin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboardService';
import { toast } from 'react-toastify';

const PinToDashboard = ({ title, reportType, chartType, config }) => {
    const [loading, setLoading] = useState(false);

    const handlePin = async () => {
        setLoading(true);
        try {
            await dashboardService.pinWidget({
                title,
                reportType,
                chartType,
                configJson: JSON.stringify(config)
            });
            toast.success(`${title} pinned to dashboard!`);
        } catch (error) {
            toast.error('Failed to pin widget.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePin} 
            disabled={loading}
            className="h-8 border-border/50 bg-background text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
        >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Pin size={12} />}
            Pin to Dashboard
        </Button>
    );
};

export default PinToDashboard;
