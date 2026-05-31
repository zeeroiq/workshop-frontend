import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ResponsiveActions handles action buttons by showing full icon+text buttons on desktop
 * and a single "Actions" button that triggers a bottom-sheet drawer on mobile.
 */
const ResponsiveActions = ({ actions, side = "vertical" }) => {
    const [open, setOpen] = useState(false);

    // Filter visible actions
    const visibleActions = actions.filter(action => action.show !== false);

    return (
        <>
            {/* Desktop View: Full Icon + Text Buttons */}
            <div className="hidden md:flex items-center justify-end gap-2">
                {visibleActions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant || "outline"}
                        size="sm"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                            "h-9 px-4 font-bold uppercase tracking-widest text-[10px] gap-2 rounded-xl transition-all active:scale-95",
                            action.className
                        )}
                        asChild={!!action.asChild}
                    >
                        {action.asChild ? action.children : (
                            <>
                                {action.icon}
                                <span>{action.label}</span>
                            </>
                        )}
                    </Button>
                ))}
            </div>

            {/* Mobile View: Trigger Button */}
            <div className="md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(true)}
                    className="h-10 w-10 rounded-full hover:bg-accent active:scale-90"
                >
                    {side === "vertical" ? <MoreVertical className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
                </Button>

                {/* Bottom Sheet Drawer for Actions */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-t-[2rem] rounded-b-none sm:rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                        <div className="flex flex-col w-full animate-in slide-in-from-bottom duration-300">
                            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-1 opacity-50" />
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-center opacity-50">
                                    Operational Actions
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-4 flex flex-col gap-2 pb-10">
                                {visibleActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant === "destructive" ? "destructive" : "ghost"}
                                        className={cn(
                                            "w-full h-14 justify-start gap-4 text-sm font-black uppercase tracking-widest rounded-2xl px-6",
                                            action.variant !== "destructive" && "hover:bg-primary/10 hover:text-primary"
                                        )}
                                        onClick={() => {
                                            action.onClick();
                                            setOpen(false);
                                        }}
                                        disabled={action.disabled}
                                    >
                                        <span className="opacity-70">{action.icon}</span>
                                        {action.label}
                                    </Button>
                                ))}
                                <Button 
                                    variant="outline" 
                                    className="w-full h-14 mt-2 font-black uppercase tracking-widest rounded-2xl border-border/50"
                                    onClick={() => setOpen(false)}
                                >
                                    Abort
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ResponsiveActions;
