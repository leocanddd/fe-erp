import BarcodeScanner from '@/components/BarcodeScanner';
import MainLayout from '@/components/MainLayout';
import {
	createPalet,
	deletePalet,
	getPalets,
	Palet,
	updatePalet,
} from '@/lib/palets';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

export default function Stocks() {
	const router = useRouter();
	const printRef =
		useRef<HTMLDivElement>(null);
	const [palets, setPalets] = useState<
		Palet[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [searchPalet, setSearchPalet] =
		useState('');
	const [
		currentPaletPage,
		setCurrentPaletPage,
	] = useState(1);
	const [
		totalPaletPages,
		setTotalPaletPages,
	] = useState(0);
	const [
		totalPaletItems,
		setTotalPaletItems,
	] = useState(0);

	// Modal states
	const [
		showPaletModal,
		setShowPaletModal,
	] = useState(false);
	const [
		showDeletePaletModal,
		setShowDeletePaletModal,
	] = useState(false);
	const [
		showScannerModal,
		setShowScannerModal,
	] = useState(false);
	const [
		showBarcodeModal,
		setShowBarcodeModal,
	] = useState(false);
	const [
		editingPalet,
		setEditingPalet,
	] = useState<Palet | null>(null);
	const [
		paletToDelete,
		setPaletToDelete,
	] = useState<Palet | null>(null);
	const [
		paletForBarcode,
		setPaletForBarcode,
	] = useState<Palet | null>(null);
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);

	const [
		paletFormData,
		setPaletFormData,
	] = useState({
		name: '',
		location: '',
	});

	const fetchPalets =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getPalets(
						currentPaletPage,
						10,
						searchPalet
					);
				if (
					response.statusCode === 200
				) {
					setPalets(response.data);
					setTotalPaletPages(
						response.pagination
							.totalPages
					);
					setTotalPaletItems(
						response.pagination
							.totalItems
					);
					setError('');
				} else {
					setError(
						response.error ||
							'Gagal memuat palet'
					);
				}
			} catch {
				setError('Gagal memuat palet');
			} finally {
				setLoading(false);
			}
		}, [currentPaletPage, searchPalet]);

	useEffect(() => {
		fetchPalets();
	}, [fetchPalets]);

	const handleSearchPalet = (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setCurrentPaletPage(1);
		fetchPalets();
	};

	const handlePaletInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setPaletFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const resetPaletForm = () => {
		setPaletFormData({
			name: '',
			location: '',
		});
	};

	const handleAddPalet = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const response =
				await createPalet(
					paletFormData
				);
			if (response.statusCode === 201) {
				fetchPalets();
				setShowPaletModal(false);
				resetPaletForm();
			} else {
				setError(
					response.error ||
						'Gagal menambah palet'
				);
			}
		} catch {
			setError('Gagal menambah palet');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdatePalet = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		if (!editingPalet?.id) return;

		setIsSubmitting(true);
		setError('');

		try {
			const response =
				await updatePalet(
					editingPalet.id,
					paletFormData
				);
			if (response.statusCode === 200) {
				fetchPalets();
				setShowPaletModal(false);
				setEditingPalet(null);
				resetPaletForm();
			} else {
				setError(
					response.error ||
						'Gagal mengubah palet'
				);
			}
		} catch {
			setError('Gagal mengubah palet');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeletePalet =
		async () => {
			if (!paletToDelete?.id) return;

			try {
				const response =
					await deletePalet(
						paletToDelete.id
					);
				if (
					response.statusCode === 200
				) {
					fetchPalets();
					setShowDeletePaletModal(
						false
					);
					setPaletToDelete(null);
				} else {
					setError(
						response.error ||
							'Gagal menghapus palet'
					);
				}
			} catch {
				setError(
					'Gagal menghapus palet'
				);
			}
		};

	const handleBarcodeScan = (
		decodedText: string
	) => {
		// Navigate to palet detail page
		setShowScannerModal(false);

		// If it's a full URL, extract the ID from it
		if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
			// Extract ID from URL like http://localhost:3000/stocks/{id}
			const match = decodedText.match(/\/stocks\/([^/?#]+)/);
			if (match && match[1]) {
				router.push(`/stocks/${match[1]}`);
			} else {
				// Fallback: navigate to the URL directly
				window.location.href = decodedText;
			}
		} else {
			// Otherwise treat it as an ID
			router.push(`/stocks/${decodedText}`);
		}
	};

	const handlePrintBarcode = () => {
		const printContent =
			printRef.current;
		if (
			!printContent ||
			!paletForBarcode
		)
			return;

		const printWindow = window.open(
			'',
			'',
			'width=800,height=600'
		);
		if (!printWindow) return;

		printWindow.document.write(`
			<html>
				<head>
					<title>Print Barcode - ${paletForBarcode.name}</title>
					<style>
						@media print {
							@page { margin: 0; }
							body { margin: 1cm; }
						}
						body {
							font-family: Arial, sans-serif;
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							padding: 20px;
						}
						.barcode-container {
							text-align: center;
							border: 2px solid #000;
							padding: 20px;
							margin: 20px;
						}
						h1 {
							font-size: 24px;
							margin-bottom: 10px;
						}
						p {
							margin: 5px 0;
							font-size: 14px;
						}
					</style>
				</head>
				<body>
					${printContent.innerHTML}
					<script>
						window.onload = function() {
							window.print();
							window.close();
						}
					</script>
				</body>
			</html>
		`);
		printWindow.document.close();
	};

	return (
		<MainLayout title="Manajemen Stok">
			{/* Header */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				marginBottom: '24px'
			}}>
				<div style={{ flex: 1 }}>
					<h1 style={{
						margin: 0,
						fontWeight: 800,
						fontSize: '24px',
						color: 'var(--dark)'
					}}>
						Manajemen Stok
					</h1>
					<div style={{
						fontSize: '13px',
						color: 'var(--muted)',
						marginTop: '4px'
					}}>
						{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
					</div>
				</div>
				<button
					onClick={() => setShowScannerModal(true)}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '8px',
						height: '38px',
						padding: '0 18px',
						border: 'none',
						borderRadius: '9px',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontWeight: 700,
						fontSize: '13px',
						color: '#fff',
						background: 'linear-gradient(135deg, #27ae60 0%, #10b981 100%)',
						transition: '0.18s'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.filter = 'brightness(1.07)';
						e.currentTarget.style.transform = 'translateY(-1px)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.filter = 'none';
						e.currentTarget.style.transform = 'none';
					}}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
					</svg>
					Scan Barcode
				</button>
			</div>

			{error && (
				<div style={{
					background: '#FDECEA',
					border: '1px solid #FE2C23',
					borderRadius: '9px',
					padding: '12px 16px',
					marginBottom: '18px'
				}}>
					<div style={{
						fontSize: '13px',
						color: '#FE2C23',
						fontWeight: 600
					}}>
						{error}
					</div>
				</div>
			)}

			{/* Main Card */}
			<section style={{
				background: '#fff',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}>
				{/* Toolbar */}
				<div style={{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					flexWrap: 'wrap',
					marginBottom: '18px',
					justifyContent: 'space-between'
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						height: '38px',
						padding: '0 14px',
						background: '#fff',
						border: '1px solid var(--border)',
						borderRadius: '9px',
						minWidth: '300px',
						color: 'var(--muted)',
						flex: 1
					}}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="11" cy="11" r="7"/>
							<path d="m21 21-4.3-4.3"/>
						</svg>
						<input
							type="text"
							value={searchPalet}
							onChange={(e) => {
								setSearchPalet(e.target.value);
								setCurrentPaletPage(1);
							}}
							placeholder="Cari tempat penyimpanan..."
							style={{
								border: 'none',
								outline: 'none',
								fontFamily: "'Montserrat', sans-serif",
								fontSize: '13px',
								color: 'var(--text)',
								width: '100%',
								background: 'transparent'
							}}
						/>
					</div>
					<button
						onClick={() => {
							setEditingPalet(null);
							resetPaletForm();
							setShowPaletModal(true);
						}}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							height: '38px',
							padding: '0 18px',
							border: 'none',
							borderRadius: '9px',
							cursor: 'pointer',
							fontFamily: "'Montserrat', sans-serif",
							fontWeight: 700,
							fontSize: '13px',
							color: '#fff',
							background: 'var(--grad)',
							transition: '0.18s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.filter = 'brightness(1.07)';
							e.currentTarget.style.transform = 'translateY(-1px)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.filter = 'none';
							e.currentTarget.style.transform = 'none';
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
							<path d="M12 5v14M5 12h14"/>
						</svg>
						Tambah
					</button>
				</div>

				{/* Table */}
				{loading ? (
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						padding: '48px 20px',
						color: 'var(--muted)'
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<div style={{
								width: '32px',
								height: '32px',
								border: '4px solid rgba(28, 167, 236, 0.3)',
								borderTopColor: '#1ca7ec',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite'
							}}></div>
							<span>Memuat palet...</span>
						</div>
					</div>
				) : palets.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada tempat penyimpanan
					</div>
				) : (
					<table style={{
						width: '100%',
						borderCollapse: 'collapse',
						background: '#fff'
					}}>
						<thead>
							<tr style={{ background: '#fff' }}>
								<th style={{
									textAlign: 'left',
									fontWeight: 600,
									fontSize: '11px',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									color: 'var(--muted)',
									padding: '0 14px 12px',
									borderBottom: '1px solid var(--border)',
									whiteSpace: 'nowrap'
								}}>
									Nama
								</th>
								<th style={{
									textAlign: 'left',
									fontWeight: 600,
									fontSize: '11px',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									color: 'var(--muted)',
									padding: '0 14px 12px',
									borderBottom: '1px solid var(--border)',
									whiteSpace: 'nowrap'
								}}>
									Lokasi
								</th>
								<th style={{
									textAlign: 'left',
									fontWeight: 600,
									fontSize: '11px',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									color: 'var(--muted)',
									padding: '0 14px 12px',
									borderBottom: '1px solid var(--border)',
									whiteSpace: 'nowrap'
								}}>
									ID
								</th>
								<th style={{
									padding: '0 14px 12px',
									borderBottom: '1px solid var(--border)'
								}}></th>
							</tr>
						</thead>
						<tbody>
							{palets.map((palet) => (
								<tr
									key={palet.id}
									style={{ background: '#fff', transition: 'background 0.15s ease' }}
									onMouseEnter={(e) => e.currentTarget.style.background = '#F8FBFF'}
									onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
								>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										verticalAlign: 'middle'
									}}>
										<div style={{
											fontWeight: 700,
											fontSize: '13.5px',
											color: 'var(--dark)'
										}}>
											{palet.name}
										</div>
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--text)',
										verticalAlign: 'middle'
									}}>
										{palet.location}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '11px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{palet.id}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										verticalAlign: 'middle',
										textAlign: 'right'
									}}>
										<div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
											<button
												onClick={() => {
													setPaletForBarcode(palet);
													setShowBarcodeModal(true);
												}}
												style={{
													width: '30px',
													height: '30px',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid var(--border)',
													borderRadius: '7px',
													background: '#fff',
													color: 'var(--muted)',
													cursor: 'pointer',
													transition: '0.18s'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.borderColor = '#9333ea';
													e.currentTarget.style.color = '#9333ea';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = 'var(--border)';
													e.currentTarget.style.color = 'var(--muted)';
												}}
												title="Print barcode"
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
												</svg>
											</button>
											<button
												onClick={() => router.push(`/stocks/${palet.id}`)}
												style={{
													width: '30px',
													height: '30px',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid var(--border)',
													borderRadius: '7px',
													background: '#fff',
													color: 'var(--muted)',
													cursor: 'pointer',
													transition: '0.18s'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.borderColor = 'var(--blue)';
													e.currentTarget.style.color = 'var(--blue)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = 'var(--border)';
													e.currentTarget.style.color = 'var(--muted)';
												}}
												title="Lihat detail"
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
													<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
												</svg>
											</button>
											<button
												onClick={() => {
													setEditingPalet(palet);
													setPaletFormData({
														name: palet.name,
														location: palet.location,
													});
													setShowPaletModal(true);
												}}
												style={{
													width: '30px',
													height: '30px',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid var(--border)',
													borderRadius: '7px',
													background: '#fff',
													color: 'var(--muted)',
													cursor: 'pointer',
													transition: '0.18s'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.borderColor = 'var(--blue)';
													e.currentTarget.style.color = 'var(--blue)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = 'var(--border)';
													e.currentTarget.style.color = 'var(--muted)';
												}}
												title="Edit palet"
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M12 20h9"/>
													<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
												</svg>
											</button>
											<button
												onClick={() => {
													setPaletToDelete(palet);
													setShowDeletePaletModal(true);
												}}
												style={{
													width: '30px',
													height: '30px',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid var(--border)',
													borderRadius: '7px',
													background: '#fff',
													color: 'var(--muted)',
													cursor: 'pointer',
													transition: '0.18s'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.borderColor = 'var(--red)';
													e.currentTarget.style.color = 'var(--red)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = 'var(--border)';
													e.currentTarget.style.color = 'var(--muted)';
												}}
												title="Hapus palet"
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</section>

			{/* Palet Modal */}
			{showPaletModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowPaletModal(
									false
								);
								setEditingPalet(null);
								resetPaletForm();
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<form
								onSubmit={
									editingPalet
										? handleUpdatePalet
										: handleAddPalet
								}
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													{editingPalet
														? 'Edit Palet'
														: 'Tambah Palet Baru'}
												</h3>
												<button
													type="button"
													onClick={() => {
														setShowPaletModal(
															false
														);
														setEditingPalet(
															null
														);
														resetPaletForm();
													}}
													className="text-gray-400 hover:text-gray-600 transition-colors"
												>
													<svg
														className="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={
																2
															}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>

											<div className="space-y-4">
												<div>
													<label
														htmlFor="palet-name"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Nama *
													</label>
													<input
														type="text"
														id="palet-name"
														name="name"
														required
														value={
															paletFormData.name
														}
														onChange={
															handlePaletInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama tempat"
													/>
												</div>

												<div>
													<label
														htmlFor="palet-location"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Lokasi *
													</label>
													<input
														type="text"
														id="palet-location"
														name="location"
														required
														value={
															paletFormData.location
														}
														onChange={
															handlePaletInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan lokasi"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										type="submit"
										disabled={
											isSubmitting
										}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSubmitting
											? 'Menyimpan...'
											: editingPalet
											? 'Simpan Perubahan'
											: 'Simpan'}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowPaletModal(
												false
											);
											setEditingPalet(
												null
											);
											resetPaletForm();
										}}
										className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
									>
										Batal
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Delete Palet Modal */}
			{showDeletePaletModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowDeletePaletModal(
									false
								);
								setPaletToDelete(null);
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
										<svg
											className="h-6 w-6 text-red-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
										<h3 className="text-lg leading-6 font-medium text-gray-900">
											Hapus Palet
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda
												yakin ingin
												menghapus palet
												&quot;
												{
													paletToDelete?.name
												}
												&quot;? Semua
												stok dalam palet
												ini juga akan
												dihapus.
												Tindakan ini
												tidak dapat
												dibatalkan.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={
										handleDeletePalet
									}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Hapus
								</button>
								<button
									onClick={() => {
										setShowDeletePaletModal(
											false
										);
										setPaletToDelete(
											null
										);
									}}
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Batal
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Barcode Scanner Modal */}
			{showScannerModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() =>
								setShowScannerModal(
									false
								)
							}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-2xl font-bold text-gray-900">
										Scan Barcode Palet
									</h3>
									<button
										type="button"
										onClick={() =>
											setShowScannerModal(
												false
											)
										}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div className="w-full">
									<BarcodeScanner
										onScan={
											handleBarcodeScan
										}
										onError={(error) =>
											setError(error)
										}
									/>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
								<button
									type="button"
									onClick={() =>
										setShowScannerModal(
											false
										)
									}
									className="w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors duration-200"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Barcode Print Modal */}
			{showBarcodeModal &&
				paletForBarcode && (
					<div className="fixed inset-0 z-[60] overflow-y-auto">
						<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div
								className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
								onClick={() => {
									setShowBarcodeModal(
										false
									);
									setPaletForBarcode(
										null
									);
								}}
							></div>
							<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="flex items-center justify-between mb-6">
										<h3 className="text-2xl font-bold text-gray-900">
											Barcode Palet
										</h3>
										<button
											type="button"
											onClick={() => {
												setShowBarcodeModal(
													false
												);
												setPaletForBarcode(
													null
												);
											}}
											className="text-gray-400 hover:text-gray-600 transition-colors"
										>
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={
														2
													}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>

									<div
										ref={printRef}
										className="barcode-container text-center border-2 border-gray-300 p-8 rounded-xl"
									>
										<h1 className="text-3xl font-bold mb-4">
											{
												paletForBarcode.name
											}
										</h1>
										<p className="text-lg text-gray-600 mb-2">
											Lokasi:{' '}
											{
												paletForBarcode.location
											}
										</p>
										<p className="text-sm text-gray-400 mb-6">
											ID:{' '}
											{
												paletForBarcode.id
											}
										</p>
										<div className="flex justify-center">
											<QRCodeSVG
												value={
													paletForBarcode.id ||
													'UNKNOWN'
												}
												size={200}
												level="H"
												includeMargin={
													true
												}
											/>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										onClick={
											handlePrintBarcode
										}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-base font-semibold text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
									>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
											/>
										</svg>
										Cetak Barcode
									</button>
									<button
										type="button"
										onClick={() => {
											setShowBarcodeModal(
												false
											);
											setPaletForBarcode(
												null
											);
										}}
										className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
									>
										Tutup
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
		</MainLayout>
	);
}
