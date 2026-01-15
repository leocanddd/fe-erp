import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
	onScan: (decodedText: string) => void;
	onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const isScanning = useRef(false);
	const lastScannedCode = useRef<string>('');
	const lastScanTime = useRef<number>(0);
	const onScanRef = useRef(onScan);
	const onErrorRef = useRef(onError);

	// Keep refs updated
	useEffect(() => {
		onScanRef.current = onScan;
		onErrorRef.current = onError;
	}, [onScan, onError]);

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
						const now = Date.now();
						// Only process if it's a different code OR 2 seconds have passed since last scan
						if (
							decodedText !== lastScannedCode.current ||
							now - lastScanTime.current > 2000
						) {
							lastScannedCode.current = decodedText;
							lastScanTime.current = now;
							onScanRef.current(decodedText);
						}
					},
					(errorMessage) => {
						// Ignore errors from scanner, they are frequent
						console.log(errorMessage);
					}
				);

				isScanning.current = true;
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : 'Gagal memulai scanner';
				if (onErrorRef.current) {
					onErrorRef.current(errorMsg);
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
						lastScannedCode.current = '';
						lastScanTime.current = 0;
					})
					.catch((err) => {
						console.error('Error stopping scanner:', err);
					});
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="w-full">
			<div id="barcode-scanner" className="w-full rounded-xl overflow-hidden"></div>
			<p className="text-sm text-gray-500 text-center mt-4">
				Arahkan kamera ke barcode palet
			</p>
		</div>
	);
}
