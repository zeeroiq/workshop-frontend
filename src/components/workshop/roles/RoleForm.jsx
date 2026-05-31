import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { ShieldCheck, Save, X } from 'lucide-react';

const RoleForm = ({ onCancel, onSave }) => {
    const [roleName, setRoleName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await workshopMgmtService.createRole(roleName);
            onSave();
        } catch (err) {
            setError(err.response?.data || { message: 'Failed to synchronize role definition.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                <div className="flex items-center gap-3 text-primary mb-1">
                    <ShieldCheck className="h-5 w-5" />
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Define System Role</CardTitle>
                </div>
                <CardDescription className="font-medium">
                    Establish a new permission tier for staff classification.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-70">Descriptor / Role Label *</Label>
                        <Input
                            id="name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g. INVENTORY_MANAGER"
                            required
                            className="h-11 bg-background/50 font-black tracking-widest uppercase"
                        />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-tighter mt-1">Note: Use underscores for multi-word roles.</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 font-bold flex items-center gap-2">
                            <X className="h-4 w-4 shrink-0" />
                            {error.message || 'Operational failure during synchronization.'}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="h-11 font-bold uppercase tracking-widest text-xs order-2 sm:order-1">
                            <X className="mr-2 h-3 w-3" /> Abort
                        </Button>
                        <Button type="submit" disabled={loading || !roleName.trim()} className="h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 min-w-[140px] order-1 sm:order-2">
                            <Save className="mr-2 h-3 w-3" /> {loading ? 'Synchronizing...' : 'Commit Role'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default RoleForm;
