import React, { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

const ScannerComponent = lazy(() => import('@yudiel/react-qr-scanner').then(module => ({ default: module.Scanner })));

const QrBarcodeScanner = ({ onScan, onError, children }) => {
    const [scanning, setScanning] = useState(false);

    const handleScan = (results) => { // 'results' is an array
        console.log("QrBarcodeScanner: handleScan called with results:", results);
        if (results && results.length > 0) {
            setScanning(false);
            onScan(results[0].rawValue); // Access the rawValue of the first detected barcode
        }
    };

    const handleError = (err) => {
        console.error("QrBarcodeScanner: handleError called with error:", err);
        onError(err);
    };

    return (
        <Dialog open={scanning} onOpenChange={setScanning}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scan QR/Barcode</DialogTitle>
                    <DialogDescription>
                        Position QR or Barcode within the scanning area.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-64 bg-gray-200 flex items-center justify-center overflow-hidden rounded-md">
                    {scanning ? (
                        <Suspense fallback={<p className="text-gray-500">Loading Scanner...</p>}>
                            <ScannerComponent
                                onScan={handleScan}
                                onError={handleError}
                                // You can customize the scanner behavior here
                                // For example, to scan only QR codes:
                                // formats={['qr_code']}
                                // To use a specific camera:
                                // device={{ deviceId: 'some-device-id' }}
                            />
                        </Suspense>
                    ) : (
                        <p className="text-gray-500">Click "Start Scan" to activate camera</p>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    {!scanning && (
                        <Button onClick={() => setScanning(true)}>Start Scan</Button>
                    )}
                    {scanning && (
                        <Button variant="outline" onClick={() => setScanning(false)}>Stop Scan</Button>
                    )}
                    <Button variant="outline" onClick={() => setScanning(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QrBarcodeScanner;
