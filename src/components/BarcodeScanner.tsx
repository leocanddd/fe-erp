import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
	onScan: (decodedText: string) => void;
	onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const isScanning = useRef(false);

	useEffect(() => {
		const startScanner = async () => {
			if (isScanning.current) return;

			try {
				const scanner = new Html5Qrcode('barcode-scanner');
				scannerRef.current = scanner;

				const config = {
					fps: 10,
					qrbox: { width: 250, height: 250 },
					aspectRatio: 1.0,
				};

				await scanner.start(
					{ facingMode: 'environment' },
					config,
					(decodedText) => {
						onScan(decodedText);
					},
					(errorMessage) => {
						// Ignore errors from scanner, they are frequent
						console.log(errorMessage);
					}
				);

				isScanning.current = true;
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : 'Gagal memulai scanner';
				if (onError) {
					onError(errorMsg);
				}
				console.error('Error starting scanner:', err);
			}
		};

		startScanner();

		return () => {
			if (scannerRef.current && isScanning.current) {
				scannerRef.current
					.stop()
					.then(() => {
						scannerRef.current?.clear();
						isScanning.current = false;
					})
					.catch((err) => {
						console.error('Error stopping scanner:', err);
					});
			}
		};
	}, [onScan, onError]);

	return (
		<div className="w-full">
			<div id="barcode-scanner" className="w-full rounded-xl overflow-hidden"></div>
			<p className="text-sm text-gray-500 text-center mt-4">
				Arahkan kamera ke barcode palet
			</p>
		</div>
	);
}
