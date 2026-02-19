import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getMenuPermissions } from '@/lib/navigation';
import { getRoleName } from '@/lib/users';
import { getProducts, Product } from '@/lib/products';
import Link from 'next/link';
import {
	useEffect,
	useState,
} from 'react';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

export default function AdminDashboard() {
	const [user, setUser] =
		useState<User | null>(null);
	const [canQuickAccess, setCanQuickAccess] = useState(false);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [incomingStock, setIncomingStock] = useState('');

	console.log('p');
	useEffect(() => {
		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
			const perms = getMenuPermissions();
			setCanQuickAccess((perms['/dashboard/quick-access'] ?? [5, 8]).includes(userData.role));
		}
	}, []);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const response = await getProducts(1, 100, searchTerm);
			if (response.statusCode === 200) {
				setProducts(response.data || []);
			}
		} catch {
			console.error('Failed to fetch products');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (showSearchModal) {
			fetchProducts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showSearchModal, searchTerm]);

	const handleOpenSearchModal = () => {
		setShowSearchModal(true);
		setSearchTerm('');
		setError('');
	};

	const handleSelectProduct = (product: Product) => {
		setSelectedProduct(product);
		setIncomingStock('');
		setShowSearchModal(false);
		setShowEditModal(true);
	};

	const handleAddIncomingStock = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProduct) return;

		setIsSubmitting(true);
		setError('');

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/incoming-stock`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productCode: selectedProduct.code,
					incomingStock: Number(incomingStock),
				}),
			});

			const data = await response.json();

			if (data.statusCode === 200 || response.ok) {
				setShowEditModal(false);
				setSelectedProduct(null);
				setIncomingStock('');
			} else {
				setError(data.error || data.message || 'Gagal menambah stok');
			}
		} catch {
			setError('Gagal menambah stok');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<MainLayout title="Beranda">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Selamat datang kembali,{' '}
					{user?.firstName || 'User'}
				</h2>
				<p className="text-gray-600">
					Kelola sistem ERP PT. Duta
					Kencana Indah dari beranda
					ini.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2">
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Informasi Akun
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div className="space-y-1">
								<dt className="text-sm font-medium text-gray-500">
									Nama Pengguna
								</dt>
								<dd className="text-base font-semibold text-gray-900">
									{user?.username}
								</dd>
							</div>
							<div className="space-y-1">
								<dt className="text-sm font-medium text-gray-500">
									Nama Depan
								</dt>
								<dd className="text-base font-semibold text-gray-900">
									{user?.firstName}
								</dd>
							</div>
							<div className="space-y-1">
								<dt className="text-sm font-medium text-gray-500">
									Nama Belakang
								</dt>
								<dd className="text-base font-semibold text-gray-900">
									{user?.lastName}
								</dd>
							</div>
							<div className="space-y-1">
								<dt className="text-sm font-medium text-gray-500">
									Tingkat Peran
								</dt>
								<dd className="text-base font-semibold text-gray-900">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
										{user?.role ? getRoleName(user.role) : 'Unknown'}
									</span>
								</dd>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
						<h3 className="text-lg font-semibold mb-2">
							Status Sistem
						</h3>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
							<span className="text-sm font-medium">
								Semua sistem beroperasi
								normal
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Access Shortcuts */}
			{canQuickAccess && (
				<div className="mb-8">
					<h3 className="text-xl font-bold text-gray-900 mb-4">
						Akses Cepat
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Link href="/products">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer group">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
										<svg
											className="w-6 h-6 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
											/>
										</svg>
									</div>
									<div>
										<h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											Produk
										</h4>
										<p className="text-sm text-gray-600">
											Kelola inventaris produk
										</p>
									</div>
								</div>
							</div>
						</Link>

						<Link href="/orders">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer group">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
										<svg
											className="w-6 h-6 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 5a2 2 0 012 2v1a2 2 0 01-2 2H9V5z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 17h8l-3 3m0 0l3-3m-3 3v-9a4 4 0 00-4-4H9"
											/>
										</svg>
									</div>
									<div>
										<h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
											Pesanan
										</h4>
										<p className="text-sm text-gray-600">
											Kelola pesanan pelanggan
										</p>
									</div>
								</div>
							</div>
						</Link>

						<div
							onClick={handleOpenSearchModal}
							className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer group"
						>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
										/>
									</svg>
								</div>
								<div>
									<h4 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
										Barang Masuk
									</h4>
									<p className="text-sm text-gray-600">
										Update stok produk masuk
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Search Product Modal */}
			{showSearchModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => setShowSearchModal(false)}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="w-full">
										<div className="flex items-center justify-between mb-6">
											<h3 className="text-2xl font-bold text-gray-900">
												Cari Produk
											</h3>
											<button
												type="button"
												onClick={() => setShowSearchModal(false)}
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

										{/* Search Input */}
										<div className="mb-6">
											<input
												type="text"
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												placeholder="Cari produk berdasarkan nama, brand, atau kode..."
												className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
											/>
										</div>

										{/* Products List */}
										<div className="max-h-96 overflow-y-auto">
											{loading ? (
												<div className="p-8 text-center">
													<div className="inline-flex items-center space-x-3">
														<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
														<span className="text-gray-600">Memuat produk...</span>
													</div>
												</div>
											) : products.length === 0 ? (
												<div className="p-8 text-center text-gray-500">
													Tidak ada produk yang ditemukan
												</div>
											) : (
												<div className="space-y-2">
													{products.map((product) => (
														<div
															key={product.id}
															onClick={() => handleSelectProduct(product)}
															className="p-4 bg-gray-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors duration-200 border border-gray-200"
														>
															<div className="flex items-center justify-between">
																<div>
																	<div className="font-semibold text-gray-900">{product.name}</div>
																	<div className="text-sm text-gray-500">{product.brand} - {product.code}</div>
																</div>
																<div className="text-right">
																	<div className="text-sm font-medium text-gray-900">Stok: {product.stock}</div>
																	<div className="text-sm text-blue-600">Rp {product.price.toLocaleString('id-ID')}</div>
																</div>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Product Modal */}
			{showEditModal && selectedProduct && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowEditModal(false);
								setSelectedProduct(null);
								setError('');
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<form onSubmit={handleAddIncomingStock}>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													Tambah Stok Masuk
												</h3>
												<button
													type="button"
													onClick={() => {
														setShowEditModal(false);
														setSelectedProduct(null);
														setError('');
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
															strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>

											{error && (
												<div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
													<div className="text-sm text-red-600 font-medium">
														{error}
													</div>
												</div>
											)}

											{/* Product Info */}
											<div className="mb-6 p-4 bg-gray-50 rounded-2xl">
												<h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Produk</h4>
												<div className="space-y-2">
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Nama:</span>
														<span className="text-sm font-medium text-gray-900">{selectedProduct.name}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Brand:</span>
														<span className="text-sm font-medium text-gray-900">{selectedProduct.brand}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Kode:</span>
														<span className="text-sm font-medium text-gray-900">{selectedProduct.code}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Stok Saat Ini:</span>
														<span className="text-sm font-bold text-blue-600">{selectedProduct.stock}</span>
													</div>
												</div>
											</div>

											{/* Incoming Stock Input */}
											<div>
												<label htmlFor="incomingStock" className="block text-sm font-semibold text-gray-700 mb-2">
													Jumlah Stok Masuk *
												</label>
												<input
													type="number"
													id="incomingStock"
													name="incomingStock"
													required
													min="1"
													value={incomingStock}
													onChange={(e) => setIncomingStock(e.target.value)}
													className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
													placeholder="Masukkan jumlah stok yang masuk"
												/>
												<p className="mt-2 text-sm text-gray-500">
													Stok setelah ditambahkan: <span className="font-semibold text-gray-900">{selectedProduct.stock + (Number(incomingStock) || 0)}</span>
												</p>
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
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Menyimpan...
											</div>
										) : (
											'Tambah Stok'
										)}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowEditModal(false);
											setSelectedProduct(null);
											setError('');
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
		</MainLayout>
	);
}
