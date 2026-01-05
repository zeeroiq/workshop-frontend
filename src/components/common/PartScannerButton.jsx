import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { BsQrCode } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { inventoryService } from '@/services/inventoryService';
import QrBarcodeScanner from './QrBarcodeScanner';
import LoadingSpinner from './LoadingSpinner';

const PartScannerButton = ({ onPartScanned, onPartAlreadyExists }) => {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleScan = async (data) => {
        if (data) {
            setLoading(true);
            try {
                const response = await inventoryService.getPartViaQrBarcode(data);
                if (response.data) {
                    if (onPartAlreadyExists && onPartAlreadyExists(response.data)) {
                        toast.info(`Part "${response.data.name}" is already in the list.`);
                    } else {
                        onPartScanned(response.data);
                        toast.success(`Part "${response.data.name}" added.`);
                    }
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    toast.error("Item not available in inventory. Please add it to inventory first.");
                } else {
                    toast.error("Failed to scan part.");
                    console.error(err);
                }
            } finally {
                setLoading(false);
                setScannerOpen(false);
            }
        }
    };

    return (
        <>
            <Button type="button" size="sm" variant="outline" onClick={() => setScannerOpen(true)}>
                <BsQrCode className="mr-2" />Scan Part
            </Button>
            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Part from Inventory</DialogTitle>
                        <DialogDescription>
                            Scan a barcode to find a part in the inventory and add it.
                        </DialogDescription>
                    </DialogHeader>
                    {loading ? <LoadingSpinner /> : (
                        <QrBarcodeScanner onScan={handleScan} onError={(err) => toast.error(`Scanner error: ${err.message}`)}>
                            <Button className="w-full">Scan QR/Barcode</Button>
                        </QrBarcodeScanner>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PartScannerButton;
