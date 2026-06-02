import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction, 
    className 
}) => {
    return (
        <Card className={cn("border-dashed border-2 bg-transparent shadow-none", className)}>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
                <div className="p-6 rounded-full bg-muted/30">
                    {Icon && <Icon size={48} className="text-muted-foreground opacity-20" />}
                </div>
                <div className="text-center space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tight text-foreground">{title}</h4>
                    <p className="text-sm text-muted-foreground max-w-[400px] leading-relaxed font-medium">
                        {description}
                    </p>
                </div>
                {actionLabel && (
                    <Button 
                        onClick={onAction} 
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 h-12 font-black uppercase tracking-widest rounded-xl"
                    >
                        <Plus size={18} className="mr-2" /> {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default EmptyState;
