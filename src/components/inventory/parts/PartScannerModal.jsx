import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import QrBarcodeScanner from '@/components/common/QrBarcodeScanner';
import { inventoryService } from '@/services/inventoryService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {BsQrCode} from "react-icons/bs";

const PartScannerModal = ({ onPartAction }) => { // Changed prop name
    const [isOpen, setIsOpen] = useState(false);
    const [rawContent, setRawContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleScan = async (data) => {
        console.log('data from scanner', data);
        if (data) {
            setRawContent(data);
            setLoading(true);
            setError(null);
            try {
                const response = await inventoryService.getPartViaQrBarcode(data);
                if (response.data) {
                    toast.success(`Part "${response.data.name}" loaded successfully! Opening Part Form.`);
                    onPartAction({ type: 'edit', data: response.data });
                    setIsOpen(false); // Close scanner modal
                } else {
                    // This case might be hit if the API returns 200 with empty data for not found
                    toast.info(`No part found with ID: ${data}. Opening Part Form to add new part.`);
                    onPartAction({ type: 'add', data: { partNumber: data } });
                    setIsOpen(false); // Close scanner modal
                }
            } catch (err) {
                console.error("Error fetching part details:", err);
                // Assuming 404 or other error means part not found
                toast.info(`No part found with ID: ${data}. Opening Part Form to add new part.`);
                onPartAction({ type: 'add', data: { partNumber: data } });
                setIsOpen(false); // Close scanner modal
            } finally {
                setLoading(false);
            }
        }
    };

    const resetState = () => {
        setRawContent('');
        setLoading(false);
        setError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetState();
        }}>
            <DialogTrigger asChild>
                <Button className="text-md font-medium" variant="default" size="lg"><BsQrCode /> Scan Part QR/Barcode</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scan Part for Inventory</DialogTitle>
                    <DialogDescription>
                        Scan a QR code or barcode to quickly add or load parts into inventory.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <QrBarcodeScanner onScan={handleScan} onError={(err) => toast.error(`Scanner error: ${err.message}`)}>
                        <Button className="w-full">Scan QR/Barcode</Button>
                    </QrBarcodeScanner>

                    {rawContent && (
                        <div className="grid gap-2">
                            <Label htmlFor="scannedId">Scanned ID</Label>
                            <Input id="scannedId" value={rawContent} readOnly />
                        </div>
                    )}

                    {loading && <LoadingSpinner />}

                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PartScannerModal;
