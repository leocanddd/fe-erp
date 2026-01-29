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

		// If it's a full URL, navigate to it directly
		if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
			window.location.href = decodedText;
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
			<div className="max-w-7xl mx-auto">
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Manajemen Stok
						</h2>
						<p className="text-gray-600">
							Kelola palet dan
							inventaris stok
						</p>
					</div>
					<button
						onClick={() =>
							setShowScannerModal(true)
						}
						className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
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
								d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
							/>
						</svg>
						Scan Barcode
					</button>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* Palets Section */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Daftar tempat
								penyimpanan
							</h3>
							<button
								onClick={() => {
									setEditingPalet(null);
									resetPaletForm();
									setShowPaletModal(
										true
									);
								}}
								className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								+ Tambah
							</button>
						</div>

						<form
							onSubmit={
								handleSearchPalet
							}
							className="flex gap-2"
						>
							<input
								type="text"
								value={searchPalet}
								onChange={(e) =>
									setSearchPalet(
										e.target.value
									)
								}
								placeholder="Cari"
								className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
							<button
								type="submit"
								className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
							>
								Cari
							</button>
						</form>
					</div>

					<div className="overflow-x-auto">
						{loading ? (
							<div className="p-8 text-center">
								<div className="inline-flex items-center space-x-3">
									<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
									<span className="text-gray-600">
										Memuat palet...
									</span>
								</div>
							</div>
						) : palets.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								Tidak ada penyimpanan
							</div>
						) : (
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Nama
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Lokasi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											ID
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{palets.map(
										(palet) => (
											<tr
												key={palet.id}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">
														{palet.name}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-500">
														{
															palet.location
														}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-xs text-gray-400">
														{palet.id}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<div className="flex items-center justify-end space-x-2">
														<button
															onClick={() => {
																setPaletForBarcode(
																	palet
																);
																setShowBarcodeModal(
																	true
																);
															}}
															className="text-purple-600 hover:text-purple-900 p-1 rounded"
															title="Print barcode"
														>
															<svg
																className="w-5 h-5"
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
																	d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
																/>
															</svg>
														</button>
														<button
															onClick={() =>
																router.push(
																	`/stocks/${palet.id}`
																)
															}
															className="text-blue-600 hover:text-blue-900 p-1 rounded"
															title="Lihat detail"
														>
															<svg
																className="w-5 h-5"
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
																	d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
																/>
															</svg>
														</button>
														<button
															onClick={() => {
																setEditingPalet(
																	palet
																);
																setPaletFormData(
																	{
																		name: palet.name,
																		location:
																			palet.location,
																	}
																);
																setShowPaletModal(
																	true
																);
															}}
															className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
															title="Edit palet"
														>
															<svg
																className="w-5 h-5"
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
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</button>
														<button
															onClick={() => {
																setPaletToDelete(
																	palet
																);
																setShowDeletePaletModal(
																	true
																);
															}}
															className="text-red-600 hover:text-red-900 p-1 rounded"
															title="Hapus palet"
														>
															<svg
																className="w-5 h-5"
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
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/>
															</svg>
														</button>
													</div>
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						)}
					</div>

					{totalPaletPages > 1 && (
						<div className="p-4 border-t border-gray-200 flex justify-between items-center">
							<button
								onClick={() =>
									setCurrentPaletPage(
										Math.max(
											1,
											currentPaletPage -
												1
										)
									)
								}
								disabled={
									currentPaletPage === 1
								}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Sebelumnya
							</button>
							<span className="text-sm text-gray-700">
								Halaman{' '}
								{currentPaletPage} dari{' '}
								{totalPaletPages} (
								{totalPaletItems} palet)
							</span>
							<button
								onClick={() =>
									setCurrentPaletPage(
										Math.min(
											totalPaletPages,
											currentPaletPage +
												1
										)
									)
								}
								disabled={
									currentPaletPage ===
									totalPaletPages
								}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Berikutnya
							</button>
						</div>
					)}
				</div>
			</div>

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
