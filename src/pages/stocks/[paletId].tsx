import MainLayout from '@/components/MainLayout';
import {
	createStock,
	deleteStock,
	getPalet,
	getStocks,
	Palet,
	Stock,
	updateStock,
	addIncomingStock,
} from '@/lib/palets';
import { getProducts, Product } from '@/lib/products';
import { useRouter } from 'next/router';
import {
	useCallback,
	useEffect,
	useState,
	useRef,
} from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function PaletDetail() {
	const router = useRouter();
	const { paletId } = router.query;
	const printRef = useRef<HTMLDivElement>(null);
	const productSearchRef = useRef<HTMLDivElement>(null);

	const [palet, setPalet] = useState<Palet | null>(null);
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [loading, setLoading] = useState(true);
	const [stocksLoading, setStocksLoading] = useState(false);
	const [error, setError] = useState('');
	const [searchStock, setSearchStock] = useState('');
	const [currentStockPage, setCurrentStockPage] = useState(1);
	const [totalStockPages, setTotalStockPages] = useState(0);
	const [totalStockItems, setTotalStockItems] = useState(0);

	// Modal states
	const [showStockModal, setShowStockModal] = useState(false);
	const [showDeleteStockModal, setShowDeleteStockModal] = useState(false);
	const [showIncomingStockModal, setShowIncomingStockModal] = useState(false);
	const [showBarcodeModal, setShowBarcodeModal] = useState(false);
	const [editingStock, setEditingStock] = useState<Stock | null>(null);
	const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Product selection states
	const [products, setProducts] = useState<Product[]>([]);
	const [productSearch, setProductSearch] = useState('');
	const [showProductDropdown, setShowProductDropdown] = useState(false);
	const [loadingProducts, setLoadingProducts] = useState(false);

	const [stockFormData, setStockFormData] = useState({
		brand: '',
		name: '',
		code: '',
		stock: '',
		price: '',
		entryDate: '',
	});

	const [incomingStockData, setIncomingStockData] = useState({
		productCode: '',
		incomingStock: '',
	});

	// Product selection for incoming stock
	const [incomingProducts, setIncomingProducts] = useState<Product[]>([]);
	const [incomingProductSearch, setIncomingProductSearch] = useState('');
	const [showIncomingProductDropdown, setShowIncomingProductDropdown] = useState(false);
	const [loadingIncomingProducts, setLoadingIncomingProducts] = useState(false);
	const incomingProductSearchRef = useRef<HTMLDivElement>(null);

	const fetchPalet = useCallback(async () => {
		if (!paletId || typeof paletId !== 'string') return;

		setLoading(true);
		try {
			const response = await getPalet(paletId);
			if (response.statusCode === 200 && response.data) {
				setPalet(response.data);
				setError('');
			} else {
				setError(response.error || 'Gagal memuat palet');
			}
		} catch {
			setError('Gagal memuat palet');
		} finally {
			setLoading(false);
		}
	}, [paletId]);

	const fetchStocks = useCallback(async () => {
		if (!paletId || typeof paletId !== 'string') return;

		setStocksLoading(true);
		try {
			const response = await getStocks(paletId, currentStockPage, 10, searchStock);
			if (response.statusCode === 200) {
				setStocks(response.data);
				setTotalStockPages(response.pagination.totalPages);
				setTotalStockItems(response.pagination.totalItems);
				setError('');
			} else {
				setError(response.error || 'Gagal memuat stok');
			}
		} catch {
			setError('Gagal memuat stok');
		} finally {
			setStocksLoading(false);
		}
	}, [paletId, currentStockPage, searchStock]);

	useEffect(() => {
		fetchPalet();
	}, [fetchPalet]);

	useEffect(() => {
		fetchStocks();
	}, [fetchStocks]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
				setShowProductDropdown(false);
			}
			if (incomingProductSearchRef.current && !incomingProductSearchRef.current.contains(event.target as Node)) {
				setShowIncomingProductDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSearchStock = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentStockPage(1);
		fetchStocks();
	};

	const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setStockFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleIncomingStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setIncomingStockData((prev) => ({ ...prev, [name]: value }));
	};

	const resetStockForm = () => {
		const today = new Date().toISOString().split('T')[0];
		setStockFormData({
			brand: '',
			name: '',
			code: '',
			stock: '',
			price: '',
			entryDate: today,
		});
		setProductSearch('');
		setProducts([]);
		setShowProductDropdown(false);
	};

	const resetIncomingStockForm = () => {
		setIncomingStockData({ productCode: '', incomingStock: '' });
		setIncomingProductSearch('');
		setIncomingProducts([]);
		setShowIncomingProductDropdown(false);
	};

	const fetchProducts = useCallback(async (search: string) => {
		setLoadingProducts(true);
		try {
			const response = await getProducts(1, 20, search);
			if (response.statusCode === 200) {
				setProducts(response.data);
			}
		} catch {
			setProducts([]);
		} finally {
			setLoadingProducts(false);
		}
	}, []);

	const handleProductSelect = (product: Product) => {
		setStockFormData({
			brand: product.brand,
			name: product.name,
			code: product.code,
			stock: '',
			price: product.price.toString(),
			entryDate: stockFormData.entryDate,
		});
		setProductSearch(`${product.brand} - ${product.name} (${product.code})`);
		setShowProductDropdown(false);
	};

	const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setProductSearch(value);
		setShowProductDropdown(true);
		if (value.length >= 2) {
			fetchProducts(value);
		} else {
			setProducts([]);
		}
	};

	const fetchIncomingProducts = useCallback(async (search: string) => {
		setLoadingIncomingProducts(true);
		try {
			const response = await getProducts(1, 20, search);
			if (response.statusCode === 200) {
				setIncomingProducts(response.data);
			}
		} catch {
			setIncomingProducts([]);
		} finally {
			setLoadingIncomingProducts(false);
		}
	}, []);

	const handleIncomingProductSelect = (product: Product) => {
		setIncomingStockData({
			productCode: product.code,
			incomingStock: '',
		});
		setIncomingProductSearch(`${product.brand} - ${product.name} (${product.code})`);
		setShowIncomingProductDropdown(false);
	};

	const handleIncomingProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setIncomingProductSearch(value);
		setShowIncomingProductDropdown(true);
		if (value.length >= 2) {
			fetchIncomingProducts(value);
		} else {
			setIncomingProducts([]);
		}
	};

	const handleAddStock = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!paletId || typeof paletId !== 'string') return;

		setIsSubmitting(true);
		setError('');

		try {
			const stockData = {
				...stockFormData,
				stock: parseInt(stockFormData.stock),
				price: parseFloat(stockFormData.price),
			};

			const response = await createStock(paletId, stockData);
			if (response.statusCode === 201) {
				fetchStocks();
				setShowStockModal(false);
				resetStockForm();
			} else {
				setError(response.error || 'Gagal menambah stok');
			}
		} catch {
			setError('Gagal menambah stok');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateStock = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!paletId || typeof paletId !== 'string' || !editingStock?.id) return;

		setIsSubmitting(true);
		setError('');

		try {
			const stockData = {
				...stockFormData,
				stock: parseInt(stockFormData.stock),
				price: parseFloat(stockFormData.price),
			};

			const response = await updateStock(paletId, editingStock.id, stockData);
			if (response.statusCode === 200) {
				fetchStocks();
				setShowStockModal(false);
				setEditingStock(null);
				resetStockForm();
			} else {
				setError(response.error || 'Gagal mengubah stok');
			}
		} catch {
			setError('Gagal mengubah stok');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteStock = async () => {
		if (!paletId || typeof paletId !== 'string' || !stockToDelete?.id) return;

		try {
			const response = await deleteStock(paletId, stockToDelete.id);
			if (response.statusCode === 200) {
				fetchStocks();
				setShowDeleteStockModal(false);
				setStockToDelete(null);
			} else {
				setError(response.error || 'Gagal menghapus stok');
			}
		} catch {
			setError('Gagal menghapus stok');
		}
	};

	const handleAddIncomingStock = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!paletId || typeof paletId !== 'string') return;

		setIsSubmitting(true);
		setError('');

		try {
			const incomingData = {
				productCode: incomingStockData.productCode,
				incomingStock: parseInt(incomingStockData.incomingStock),
			};

			const response = await addIncomingStock(paletId, incomingData);
			if (response.statusCode === 200) {
				fetchStocks();
				setShowIncomingStockModal(false);
				resetIncomingStockForm();
			} else {
				setError(response.error || 'Gagal menambah stok masuk');
			}
		} catch {
			setError('Gagal menambah stok masuk');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePrintBarcode = () => {
		const printContent = printRef.current;
		if (!printContent) return;

		const printWindow = window.open('', '', 'width=800,height=600');
		if (!printWindow) return;

		printWindow.document.write(`
			<html>
				<head>
					<title>Print Barcode - ${palet?.name}</title>
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

	if (loading) {
		return (
			<MainLayout title="Detail Palet">
				<div className="max-w-7xl mx-auto">
					<div className="p-8 text-center">
						<div className="inline-flex items-center space-x-3">
							<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
							<span className="text-gray-600">Memuat palet...</span>
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	if (!palet) {
		return (
			<MainLayout title="Detail Palet">
				<div className="max-w-7xl mx-auto">
					<div className="p-8 text-center text-red-600">Palet tidak ditemukan</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title={`Detail Palet - ${palet.name}`}>
			<div className="max-w-7xl mx-auto">
				{/* Back Button */}
				<button
					onClick={() => router.push('/stocks')}
					className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
				>
					<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Kembali ke Daftar Palet
				</button>

				{/* Palet Info Card */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-6">
					<div className="p-6">
						<div className="flex justify-between items-start">
							<div>
								<h2 className="text-3xl font-bold text-gray-900 mb-2">{palet.name}</h2>
								<p className="text-lg text-gray-600">
									<span className="font-semibold">Lokasi:</span> {palet.location}
								</p>
								<p className="text-sm text-gray-400 mt-2">
									ID: {palet.id}
								</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setShowBarcodeModal(true)}
									className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
								>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
									</svg>
									Barcode
								</button>
							</div>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">{error}</div>
					</div>
				)}

				{/* Stocks Section */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-gray-900">Daftar Stok</h3>
							<div className="flex gap-2">
								<button
									onClick={() => {
										resetIncomingStockForm();
										setShowIncomingStockModal(true);
									}}
									className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
								>
									+ Stok Masuk
								</button>
								<button
									onClick={() => {
										setEditingStock(null);
										resetStockForm();
										setShowStockModal(true);
									}}
									className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
								>
									+ Tambah Stok
								</button>
							</div>
						</div>

						<form onSubmit={handleSearchStock} className="flex gap-2">
							<input
								type="text"
								value={searchStock}
								onChange={(e) => setSearchStock(e.target.value)}
								placeholder="Cari stok..."
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
						{stocksLoading ? (
							<div className="p-8 text-center">
								<div className="inline-flex items-center space-x-3">
									<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
									<span className="text-gray-600">Memuat stok...</span>
								</div>
							</div>
						) : stocks.length === 0 ? (
							<div className="p-8 text-center text-gray-500">Tidak ada stok</div>
						) : (
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Produk
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Kode
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Stok
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Harga
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tanggal Masuk
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{stocks.map((stock) => (
										<tr key={stock.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{stock.name}</div>
													<div className="text-sm text-gray-500">{stock.brand}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
													{stock.code}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{stock.stock}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												Rp {stock.price.toLocaleString('id-ID')}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{new Date(stock.entryDate).toLocaleDateString('id-ID')}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div className="flex items-center justify-end space-x-2">
													<button
														onClick={() => {
															setEditingStock(stock);
															setStockFormData({
																brand: stock.brand,
																name: stock.name,
																code: stock.code,
																stock: stock.stock.toString(),
																price: stock.price.toString(),
																entryDate: stock.entryDate.split('T')[0],
															});
															setShowStockModal(true);
														}}
														className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => {
															setStockToDelete(stock);
															setShowDeleteStockModal(true);
														}}
														className="text-red-600 hover:text-red-900 p-1 rounded"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					{totalStockPages > 1 && (
						<div className="p-4 border-t border-gray-200 flex justify-between items-center">
							<button
								onClick={() => setCurrentStockPage(Math.max(1, currentStockPage - 1))}
								disabled={currentStockPage === 1}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Sebelumnya
							</button>
							<span className="text-sm text-gray-700">
								Halaman {currentStockPage} dari {totalStockPages} ({totalStockItems} item)
							</span>
							<button
								onClick={() => setCurrentStockPage(Math.min(totalStockPages, currentStockPage + 1))}
								disabled={currentStockPage === totalStockPages}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Berikutnya
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Stock Modal */}
			{showStockModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowStockModal(false);
								setEditingStock(null);
								resetStockForm();
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<form onSubmit={editingStock ? handleUpdateStock : handleAddStock}>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													{editingStock ? 'Edit Stok' : 'Tambah Stok Baru'}
												</h3>
												<button
													type="button"
													onClick={() => {
														setShowStockModal(false);
														setEditingStock(null);
														resetStockForm();
													}}
													className="text-gray-400 hover:text-gray-600 transition-colors"
												>
													<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</div>

											{!editingStock && (
												<div className="mb-6">
													<label htmlFor="product-search" className="block text-sm font-semibold text-gray-700 mb-2">
														Cari Produk
													</label>
													<div className="relative" ref={productSearchRef}>
														<input
															type="text"
															id="product-search"
															value={productSearch}
															onChange={handleProductSearchChange}
															onFocus={() => productSearch.length >= 2 && setShowProductDropdown(true)}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Ketik minimal 2 karakter untuk mencari produk..."
														/>
														{showProductDropdown && (
															<div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
																{loadingProducts ? (
																	<div className="p-4 text-center text-gray-500">Mencari produk...</div>
																) : products.length === 0 ? (
																	<div className="p-4 text-center text-gray-500">
																		{productSearch.length < 2 ? 'Ketik minimal 2 karakter' : 'Tidak ada produk ditemukan'}
																	</div>
																) : (
																	products.map((product) => (
																		<button
																			key={product.id}
																			type="button"
																			onClick={() => handleProductSelect(product)}
																			className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
																		>
																			<div className="font-medium text-gray-900">{product.brand} - {product.name}</div>
																			<div className="text-sm text-gray-500">Kode: {product.code} | Harga: Rp {product.price.toLocaleString('id-ID')}</div>
																		</button>
																	))
																)}
															</div>
														)}
													</div>
													<p className="mt-2 text-xs text-gray-500">Pilih produk dari daftar atau isi manual di bawah</p>
												</div>
											)}

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div>
													<label htmlFor="stock-name" className="block text-sm font-semibold text-gray-700 mb-2">
														Nama Produk *
													</label>
													<input
														type="text"
														id="stock-name"
														name="name"
														required
														value={stockFormData.name}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama produk"
													/>
												</div>

												<div>
													<label htmlFor="stock-brand" className="block text-sm font-semibold text-gray-700 mb-2">
														Merek *
													</label>
													<input
														type="text"
														id="stock-brand"
														name="brand"
														required
														value={stockFormData.brand}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan merek"
													/>
												</div>

												<div>
													<label htmlFor="stock-code" className="block text-sm font-semibold text-gray-700 mb-2">
														Kode Produk *
													</label>
													<input
														type="text"
														id="stock-code"
														name="code"
														required
														value={stockFormData.code}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan kode produk"
													/>
												</div>

												<div>
													<label htmlFor="stock-stock" className="block text-sm font-semibold text-gray-700 mb-2">
														Stok *
													</label>
													<input
														type="number"
														id="stock-stock"
														name="stock"
														required
														min="0"
														value={stockFormData.stock}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan jumlah stok"
													/>
												</div>

												<div>
													<label htmlFor="stock-price" className="block text-sm font-semibold text-gray-700 mb-2">
														Harga (Rp) *
													</label>
													<input
														type="number"
														id="stock-price"
														name="price"
														required
														min="0"
														step="0.01"
														value={stockFormData.price}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan harga"
													/>
												</div>

												<div>
													<label htmlFor="stock-entryDate" className="block text-sm font-semibold text-gray-700 mb-2">
														Tanggal Masuk *
													</label>
													<input
														type="date"
														id="stock-entryDate"
														name="entryDate"
														required
														value={stockFormData.entryDate}
														onChange={handleStockInputChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSubmitting ? 'Menyimpan...' : editingStock ? 'Simpan Perubahan' : 'Simpan Stok'}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowStockModal(false);
											setEditingStock(null);
											resetStockForm();
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

			{/* Incoming Stock Modal */}
			{showIncomingStockModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowIncomingStockModal(false);
								resetIncomingStockForm();
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<form onSubmit={handleAddIncomingStock}>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">Tambah Stok Masuk</h3>
												<button
													type="button"
													onClick={() => {
														setShowIncomingStockModal(false);
														resetIncomingStockForm();
													}}
													className="text-gray-400 hover:text-gray-600 transition-colors"
												>
													<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</div>

											<div className="space-y-4">
												<div>
													<label htmlFor="incoming-product-search" className="block text-sm font-semibold text-gray-700 mb-2">
														Cari Produk
													</label>
													<div className="relative" ref={incomingProductSearchRef}>
														<input
															type="text"
															id="incoming-product-search"
															value={incomingProductSearch}
															onChange={handleIncomingProductSearchChange}
															onFocus={() => incomingProductSearch.length >= 2 && setShowIncomingProductDropdown(true)}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Ketik minimal 2 karakter untuk mencari produk..."
														/>
														{showIncomingProductDropdown && (
															<div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
																{loadingIncomingProducts ? (
																	<div className="p-4 text-center text-gray-500">Mencari produk...</div>
																) : incomingProducts.length === 0 ? (
																	<div className="p-4 text-center text-gray-500">
																		{incomingProductSearch.length < 2 ? 'Ketik minimal 2 karakter' : 'Tidak ada produk ditemukan'}
																	</div>
																) : (
																	incomingProducts.map((product) => (
																		<button
																			key={product.id}
																			type="button"
																			onClick={() => handleIncomingProductSelect(product)}
																			className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
																		>
																			<div className="font-medium text-gray-900">{product.brand} - {product.name}</div>
																			<div className="text-sm text-gray-500">Kode: {product.code} | Harga: Rp {product.price.toLocaleString('id-ID')}</div>
																		</button>
																	))
																)}
															</div>
														)}
													</div>
													<p className="mt-2 text-xs text-gray-500">Pilih produk dari daftar atau isi kode manual di bawah</p>
												</div>

												<div>
													<label htmlFor="incoming-productCode" className="block text-sm font-semibold text-gray-700 mb-2">
														Kode Produk *
													</label>
													<input
														type="text"
														id="incoming-productCode"
														name="productCode"
														required
														value={incomingStockData.productCode}
														onChange={handleIncomingStockChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan kode produk"
													/>
												</div>

												<div>
													<label htmlFor="incoming-stock" className="block text-sm font-semibold text-gray-700 mb-2">
														Jumlah Stok Masuk *
													</label>
													<input
														type="number"
														id="incoming-stock"
														name="incomingStock"
														required
														min="1"
														value={incomingStockData.incomingStock}
														onChange={handleIncomingStockChange}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan jumlah stok"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-base font-semibold text-white hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSubmitting ? 'Menyimpan...' : 'Tambah Stok'}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowIncomingStockModal(false);
											resetIncomingStockForm();
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

			{/* Delete Stock Modal */}
			{showDeleteStockModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowDeleteStockModal(false);
								setStockToDelete(null);
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
										<svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
										<h3 className="text-lg leading-6 font-medium text-gray-900">Hapus Stok</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda yakin ingin menghapus stok &quot;{stockToDelete?.name}&quot;?
												Tindakan ini tidak dapat dibatalkan.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={handleDeleteStock}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Hapus
								</button>
								<button
									onClick={() => {
										setShowDeleteStockModal(false);
										setStockToDelete(null);
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

			{/* Barcode Modal */}
			{showBarcodeModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => setShowBarcodeModal(false)}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-2xl font-bold text-gray-900">Barcode Palet</h3>
									<button
										type="button"
										onClick={() => setShowBarcodeModal(false)}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>

								<div ref={printRef} className="barcode-container text-center border-2 border-gray-300 p-8 rounded-xl">
									<h1 className="text-3xl font-bold mb-4">{palet.name}</h1>
									<p className="text-lg text-gray-600 mb-2">Lokasi: {palet.location}</p>
									<p className="text-sm text-gray-400 mb-6">ID: {palet.id}</p>
									<div className="flex justify-center">
										<QRCodeSVG
											value={typeof window !== 'undefined' ? `${window.location.origin}/stocks/${palet.id}` : (palet.id || 'UNKNOWN')}
											size={200}
											level="H"
											includeMargin={true}
										/>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
								<button
									onClick={handlePrintBarcode}
									className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-base font-semibold text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
								>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
									</svg>
									Cetak Barcode
								</button>
								<button
									type="button"
									onClick={() => setShowBarcodeModal(false)}
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
