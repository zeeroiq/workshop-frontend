import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import QrBarcodeScanner from '@/components/common/QrBarcodeScanner';
import { inventoryService } from '@/services/inventoryService';
import { catalogService } from '@/services/catalogService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {BsQrCode} from "react-icons/bs";

const PartScannerModal = ({ onPartAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rawContent, setRawContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleScan = async (data) => {
        if (data) {
            setRawContent(data);
            setLoading(true);
            setError(null);
            try {
                const response = await inventoryService.getPartViaQrBarcode(data);
                if (response.data) {
                    toast.success(`Part "${response.data.name}" loaded successfully`);
                    onPartAction({ type: 'edit', data: response.data });
                    setIsOpen(false);
                } else {
                    toast.info(`No part found with ID: ${data}. Checking catalog...`);
                    // Fallback to catalog service
                    await handleCatalogSearch(data);
                }
            } catch (err) {
                console.error("Error fetching part details from inventory:", err);
                if (err.response?.status === 404) {
                    // toast.info(`No part found in inventory with ID: ${data}. Checking catalog...`);
                    console.log(`No part found in inventory with ID: ${data}. Checking catalog...`);
                    // Fallback to catalog service
                    handleCatalogSearch(data);
                } else {
                    toast.error("An error occurred while fetching part from inventory.");
                    setLoading(false);
                }
            }
        }
    };

    const handleCatalogSearch = async (partNumber) => {
        try {
            const response = await catalogService.getSpcCatalogPartsViaQrBarcode(partNumber);
            if (response.data?.success && response.data?.data) {
                toast.success("Part found in catalog.\nProceed with adding it to inventory.");

                onPartAction({ type: 'add',
                    data: {
                        partNumber: response.data.data.partNo,
                        name: response.data.data.description,
                        description: `${response.data.data.plateTitle} - ${response.data.data.description}\n${response.data.data.model}`,
                    }
                });
                setIsOpen(false);
            } else {
                // This case might not be hit if 404 is thrown for not found
                toast.info(`No part found in catalog with ID: ${partNumber}. Opening Part Form for manual entry.`);
                onPartAction({ type: 'add', data: { partNumber: partNumber } });
                setIsOpen(false);
            }
        } catch (err) {
            console.error("Error fetching part details from catalog:", err);
            if (err.response?.status === 404) {
                toast.info(`No part found in catalog with ID: ${partNumber}. Opening Part Form for manual entry.`);
                onPartAction({ type: 'add', data: { partNumber: partNumber } });
            } else {
                toast.error("An error occurred while fetching part from catalog.");
            }
            setIsOpen(false);
        } finally {
            setLoading(false);
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
