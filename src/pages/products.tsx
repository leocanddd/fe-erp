import MainLayout from '@/components/MainLayout';
import { useUpload } from '@/hooks/useUpload';
import { getStoredUser } from '@/lib/auth';
import {
	createProduct,
	createProductHistory,
	deleteProduct,
	getProducts,
	Product,
	updateProduct,
} from '@/lib/products';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

export default function Products() {
	const [products, setProducts] =
		useState<Product[]>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [search, setSearch] =
		useState('');
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalPages, setTotalPages] =
		useState(0);
	const [totalItems, setTotalItems] =
		useState(0);
	const [
		showDeleteModal,
		setShowDeleteModal,
	] = useState(false);
	const [
		productToDelete,
		setProductToDelete,
	] = useState<Product | null>(null);
	const [
		showAddModal,
		setShowAddModal,
	] = useState(false);
	const [
		showEditModal,
		setShowEditModal,
	] = useState(false);
	const [
		editingProduct,
		setEditingProduct,
	] = useState<Product | null>(null);
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);
	const [formData, setFormData] =
		useState({
			brand: '',
			name: '',
			code: '',
			stock: '',
			price: '',
			entryDate: '',
			displayWeb: false,
		});

	// Upload hook instances (one for Add, one for Edit)
	const {
		upload: uploadAdd,
		uploading: uploadingAdd,
		uploadedUrl: uploadedUrlAdd,
		uploadError: uploadErrorAdd,
		reset: resetUploadAdd,
	} = useUpload();

	const {
		upload: uploadEdit,
		uploading: uploadingEdit,
		uploadedUrl: uploadedUrlEdit,
		uploadError: uploadErrorEdit,
		reset: resetUploadEdit,
	} = useUpload();

	const addFileInputRef =
		useRef<HTMLInputElement>(null);
	const editFileInputRef =
		useRef<HTMLInputElement>(null);

	const fetchProducts =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getProducts(
						currentPage,
						10,
						search,
					);
				if (
					response.statusCode === 200
				) {
					setProducts(response.data);
					setTotalPages(
						response.pagination
							.totalPages,
					);
					setTotalItems(
						response.pagination
							.totalItems,
					);
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch products',
					);
				}
			} catch {
				setError(
					'Failed to fetch products',
				);
			} finally {
				setLoading(false);
			}
		}, [currentPage, search]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleSearch = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchProducts();
	};

	const handleDelete = async (
		product: Product,
	) => {
		setProductToDelete(product);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!productToDelete) return;

		try {
			const response =
				await deleteProduct(
					productToDelete.id!,
				);
			if (response.statusCode === 200) {
				fetchProducts();
				setShowDeleteModal(false);
				setProductToDelete(null);
			} else {
				setError(
					response.error ||
						'Failed to delete product',
				);
			}
		} catch {
			setError(
				'Failed to delete product',
			);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const {
			name,
			value,
			type,
			checked,
		} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === 'checkbox'
					? checked
					: value,
		}));
	};

	const resetForm = () => {
		const today = new Date()
			.toISOString()
			.split('T')[0];
		setFormData({
			brand: '',
			name: '',
			code: '',
			stock: '',
			price: '',
			entryDate: today,
			displayWeb: false,
		});
		resetUploadAdd();
		resetUploadEdit();
		if (addFileInputRef.current)
			addFileInputRef.current.value =
				'';
		if (editFileInputRef.current)
			editFileInputRef.current.value =
				'';
	};

	const handleAddProduct = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const productData = {
				brand: formData.brand.trim(),
				name: formData.name.trim(),
				code: formData.code.trim(),
				stock: parseInt(formData.stock),
				price: parseFloat(
					formData.price,
				),
				entryDate: formData.entryDate,
				displayWeb: formData.displayWeb,
				...(uploadedUrlAdd && {
					image: uploadedUrlAdd,
				}),
			};

			const response =
				await createProduct(
					productData,
				);
			if (response.statusCode === 201) {
				// Log product history
				const user = getStoredUser();
				await createProductHistory({
					name:
						user?.firstName || 'User',
					type: 'CREATE',
					message: `Produk ${productData.name} berhasil ditambahkan`,
				});

				fetchProducts();
				setShowAddModal(false);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal menambah produk',
				);
			}
		} catch {
			setError('Gagal menambah produk');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (
		product: Product,
	) => {
		setEditingProduct(product);
		setFormData({
			brand: product.brand,
			name: product.name,
			code: product.code,
			stock: product.stock.toString(),
			price: product.price.toString(),
			displayWeb:
				product.displayWeb ?? false,
			entryDate:
				product.entryDate.split('T')[0], // Convert to YYYY-MM-DD format for date input
		});
		setShowEditModal(true);
	};

	const handleUpdateProduct = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		if (!editingProduct) return;

		setIsSubmitting(true);
		setError('');

		try {
			const productData = {
				brand: formData.brand.trim(),
				name: formData.name.trim(),
				code: formData.code.trim(),
				stock: parseInt(formData.stock),
				price: parseFloat(
					formData.price,
				),
				entryDate: formData.entryDate,
				displayWeb: formData.displayWeb,
				// Use newly uploaded URL, or keep the existing one
				image:
					uploadedUrlEdit ||
					editingProduct.image ||
					undefined,
			};

			const response =
				await updateProduct(
					editingProduct.id!,
					productData,
				);
			if (response.statusCode === 200) {
				// Log product history
				const user = getStoredUser();
				const stockDiff =
					productData.stock -
					editingProduct.stock;

				let historyMessage = '';
				if (stockDiff > 0) {
					historyMessage = `${user?.firstName || 'User'} menambahkan ${stockDiff} stock ${productData.name}`;
				} else if (stockDiff < 0) {
					historyMessage = `${user?.firstName || 'User'} mengurangi ${Math.abs(stockDiff)} stock ${productData.name}`;
				} else {
					historyMessage = `${user?.firstName || 'User'} memperbarui produk ${productData.name}`;
				}

				await createProductHistory({
					name:
						user?.firstName || 'User',
					type: 'UPDATE',
					message: historyMessage,
				});

				fetchProducts();
				setShowEditModal(false);
				setEditingProduct(null);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal mengubah produk',
				);
			}
		} catch {
			setError('Gagal mengubah produk');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<MainLayout title="Produk">
			<div className="max-w-7xl mx-auto">
				{/* Header with search and add button */}
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Produk
						</h2>
						<p className="text-gray-600">
							Kelola inventaris produk
							Anda
						</p>
					</div>
					<div className="mt-4 sm:mt-0">
						<button
							onClick={() =>
								setShowAddModal(true)
							}
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
						>
							Tambah Produk
						</button>
					</div>
				</div>

				{/* Search */}
				<div className="mb-6">
					<form
						onSubmit={handleSearch}
						className="flex gap-4"
					>
						<div className="flex-1">
							<input
								type="text"
								value={search}
								onChange={(e) =>
									setSearch(
										e.target.value,
									)
								}
								placeholder="Cari produk berdasarkan nama, merek, atau kode..."
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>
						<button
							type="submit"
							className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
						>
							Cari
						</button>
					</form>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* Products table */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat produk...
								</span>
							</div>
						</div>
					) : !products ||
					  products.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada produk yang
							ditemukan
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
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
												Due Out
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
										{products.map(
											(product) => (
												<tr
													key={
														product.id
													}
													className="hover:bg-gray-50"
												>
													<td className="px-6 py-4 whitespace-nowrap">
														<div>
															<div className="text-sm font-medium text-gray-900">
																{
																	product.name
																}
															</div>
															<div className="text-sm text-gray-500">
																{
																	product.brand
																}
															</div>
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
															{
																product.code
															}
														</span>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{
															product.stock
														}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{
															product.holdingStock
														}
													</td>

													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{new Date(
															product.entryDate,
														).toLocaleDateString(
															'id-ID',
														)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
														<div className="flex items-center justify-end space-x-2">
															<button
																onClick={() =>
																	handleEdit(
																		product,
																	)
																}
																className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
																title="Edit produk"
															>
																<svg
																	className="w-4 h-4"
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
																onClick={() =>
																	handleDelete(
																		product,
																	)
																}
																className="text-red-600 hover:text-red-900 p-1 rounded"
																title="Hapus produk"
															>
																<svg
																	className="w-4 h-4"
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
											),
										)}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
								<div className="flex-1 flex justify-between sm:hidden">
									<button
										onClick={() =>
											setCurrentPage(
												Math.max(
													1,
													currentPage -
														1,
												),
											)
										}
										disabled={
											currentPage === 1
										}
										className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Sebelumnya
									</button>
									<button
										onClick={() =>
											setCurrentPage(
												Math.min(
													totalPages,
													currentPage +
														1,
												),
											)
										}
										disabled={
											currentPage ===
											totalPages
										}
										className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Berikutnya
									</button>
								</div>
								<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
									<div>
										<p className="text-sm text-gray-700">
											Menampilkan{' '}
											<span className="font-medium">
												{(currentPage -
													1) *
													10 +
													1}
											</span>{' '}
											sampai{' '}
											<span className="font-medium">
												{Math.min(
													currentPage *
														10,
													totalItems,
												)}
											</span>{' '}
											dari{' '}
											<span className="font-medium">
												{totalItems}
											</span>{' '}
											hasil
										</p>
									</div>
									<div>
										<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
											<button
												onClick={() =>
													setCurrentPage(
														Math.max(
															1,
															currentPage -
																1,
														),
													)
												}
												disabled={
													currentPage ===
													1
												}
												className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Sebelumnya
											</button>
											<button
												onClick={() =>
													setCurrentPage(
														Math.min(
															totalPages,
															currentPage +
																1,
														),
													)
												}
												disabled={
													currentPage ===
													totalPages
												}
												className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Berikutnya
											</button>
										</nav>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Add Product Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowAddModal(false);
								resetForm();
								setError('');
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<form
								onSubmit={
									handleAddProduct
								}
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													Tambah Produk
													Baru
												</h3>
												<button
													type="button"
													onClick={() => {
														setShowAddModal(
															false,
														);
														resetForm();
														setError(
															'',
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

											{error && (
												<div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
													<div className="text-sm text-red-600 font-medium">
														{error}
													</div>
												</div>
											)}

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div>
													<label
														htmlFor="name"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Nama Produk
														*
													</label>
													<input
														type="text"
														id="name"
														name="name"
														required
														value={
															formData.name
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama produk"
													/>
												</div>

												<div>
													<label
														htmlFor="brand"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Merek *
													</label>
													<input
														type="text"
														id="brand"
														name="brand"
														required
														value={
															formData.brand
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan merek produk"
													/>
												</div>

												<div>
													<label
														htmlFor="code"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Kode Produk
														*
													</label>
													<input
														type="text"
														id="code"
														name="code"
														required
														value={
															formData.code
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan kode produk"
													/>
												</div>

												<div>
													<label
														htmlFor="stock"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Stok *
													</label>
													<input
														type="number"
														id="stock"
														name="stock"
														required
														min="0"
														value={
															formData.stock
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan jumlah stok"
													/>
												</div>

												<div>
													<label
														htmlFor="price"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Harga (Rp) *
													</label>
													<input
														type="number"
														id="price"
														name="price"
														required
														min="0"
														step="0.01"
														value={
															formData.price
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan harga dalam rupiah"
													/>
												</div>

												<div>
													<label
														htmlFor="entryDate"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Tanggal
														Masuk *
													</label>
													<input
														type="date"
														id="entryDate"
														name="entryDate"
														required
														value={
															formData.entryDate
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
													/>
												</div>

												{/* Image Upload */}
												<div className="md:col-span-2">
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														Gambar
														Produk
													</label>
													<div className="flex flex-col gap-3">
														<div className="flex-1">
															<label
																htmlFor="add-image-upload"
																className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ${
																	uploadingAdd
																		? 'border-blue-300 bg-blue-50'
																		: 'border-gray-300 bg-gray-50 hover:bg-gray-100'
																}`}
															>
																{uploadingAdd ? (
																	<div className="flex flex-col items-center">
																		<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
																		<span className="text-sm text-blue-600 font-medium">
																			Mengupload...
																		</span>
																	</div>
																) : uploadedUrlAdd ? (
																	<div className="flex flex-col items-center gap-1 px-2 text-center">
																		<svg
																			className="w-5 h-5 text-green-500"
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
																				d="M5 13l4 4L19 7"
																			/>
																		</svg>
																		<span className="text-xs text-green-600 font-medium">
																			Upload
																			berhasil
																		</span>
																		<span className="text-xs text-gray-400 truncate max-w-xs">
																			{uploadedUrlAdd
																				.split(
																					'/',
																				)
																				.pop()}
																		</span>
																	</div>
																) : (
																	<div className="flex flex-col items-center gap-1">
																		<svg
																			className="w-6 h-6 text-gray-400"
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
																				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
																			/>
																		</svg>
																		<span className="text-sm text-gray-500">
																			Klik
																			untuk
																			upload
																			gambar
																		</span>
																		<span className="text-xs text-gray-400">
																			PNG,
																			JPG,
																			WEBP
																		</span>
																	</div>
																)}
																<input
																	id="add-image-upload"
																	ref={
																		addFileInputRef
																	}
																	type="file"
																	accept="image/*"
																	className="hidden"
																	disabled={
																		uploadingAdd
																	}
																	onChange={async (
																		e,
																	) => {
																		const file =
																			e
																				.target
																				.files?.[0];
																		if (
																			file
																		)
																			await uploadAdd(
																				file,
																			);
																	}}
																/>
															</label>
															{uploadErrorAdd && (
																<p className="mt-1 text-xs text-red-500">
																	{
																		uploadErrorAdd
																	}
																</p>
															)}
														</div>
														{uploadedUrlAdd && (
															// eslint-disable-next-line @next/next/no-img-element
															<img
																src={
																	uploadedUrlAdd
																}
																alt="Preview"
																className="w-full h-48 object-cover rounded-2xl border border-gray-200"
															/>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										type="submit"
										disabled={
											isSubmitting ||
											uploadingAdd
										}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Menyimpan...
											</div>
										) : (
											'Simpan Produk'
										)}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowAddModal(
												false,
											);
											resetForm();
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

			{/* Edit Product Modal */}
			{showEditModal &&
				editingProduct && (
					<div className="fixed inset-0 z-[60] overflow-y-auto">
						<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div
								className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
								onClick={() => {
									setShowEditModal(
										false,
									);
									setEditingProduct(
										null,
									);
									resetForm();
									setError('');
								}}
							></div>
							<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
								<form
									onSubmit={
										handleUpdateProduct
									}
								>
									<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
										<div className="sm:flex sm:items-start">
											<div className="w-full">
												<div className="flex items-center justify-between mb-6">
													<h3 className="text-2xl font-bold text-gray-900">
														Edit Produk
													</h3>
													<button
														type="button"
														onClick={() => {
															setShowEditModal(
																false,
															);
															setEditingProduct(
																null,
															);
															resetForm();
															setError(
																'',
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

												{error && (
													<div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
														<div className="text-sm text-red-600 font-medium">
															{error}
														</div>
													</div>
												)}

												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<div>
														<label
															htmlFor="edit-name"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Nama
															Produk *
														</label>
														<input
															type="text"
															id="edit-name"
															name="name"
															required
															value={
																formData.name
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan nama produk"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-brand"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Merek *
														</label>
														<input
															type="text"
															id="edit-brand"
															name="brand"
															required
															value={
																formData.brand
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan merek produk"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-code"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Kode
															Produk *
														</label>
														<input
															type="text"
															id="edit-code"
															name="code"
															required
															value={
																formData.code
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan kode produk"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-stock"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Stok *
														</label>
														<input
															type="number"
															id="edit-stock"
															name="stock"
															required
															min="0"
															value={
																formData.stock
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan jumlah stok"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-price"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Harga (Rp)
															*
														</label>
														<input
															type="number"
															id="edit-price"
															name="price"
															required
															min="0"
															step="0.01"
															value={
																formData.price
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan harga dalam rupiah"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-entryDate"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Tanggal
															Masuk *
														</label>
														<input
															type="date"
															id="edit-entryDate"
															name="entryDate"
															required
															value={
																formData.entryDate
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														/>
													</div>

													<div className="flex items-center space-x-3 mt-4">
														<input
															type="checkbox"
															id="displayWeb"
															name="displayWeb"
															checked={
																formData.displayWeb
															}
															onChange={
																handleInputChange
															}
															className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
														/>
														<label
															htmlFor="displayWeb"
															className="text-sm font-semibold text-gray-700"
														>
															Tampilkan
															di web
														</label>
													</div>

													{/* Image Upload */}
													<div className="md:col-span-2">
														<label className="block text-sm font-semibold text-gray-700 mb-2">
															Gambar
															Produk
														</label>
														<div className="flex flex-col gap-3">
															<div className="flex-1">
																<label
																	htmlFor="edit-image-upload"
																	className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ${
																		uploadingEdit
																			? 'border-blue-300 bg-blue-50'
																			: 'border-gray-300 bg-gray-50 hover:bg-gray-100'
																	}`}
																>
																	{uploadingEdit ? (
																		<div className="flex flex-col items-center">
																			<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
																			<span className="text-sm text-blue-600 font-medium">
																				Mengupload...
																			</span>
																		</div>
																	) : uploadedUrlEdit ? (
																		<div className="flex flex-col items-center gap-1 px-2 text-center">
																			<svg
																				className="w-5 h-5 text-green-500"
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
																					d="M5 13l4 4L19 7"
																				/>
																			</svg>
																			<span className="text-xs text-green-600 font-medium">
																				Upload
																				berhasil
																			</span>
																			<span className="text-xs text-gray-400 truncate max-w-xs">
																				{uploadedUrlEdit
																					.split(
																						'/',
																					)
																					.pop()}
																			</span>
																		</div>
																	) : (
																		<div className="flex flex-col items-center gap-1">
																			<svg
																				className="w-6 h-6 text-gray-400"
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
																					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
																				/>
																			</svg>
																			<span className="text-sm text-gray-500">
																				{editingProduct?.image
																					? 'Klik untuk ganti gambar'
																					: 'Klik untuk upload gambar'}
																			</span>
																			<span className="text-xs text-gray-400">
																				PNG,
																				JPG,
																				WEBP
																			</span>
																		</div>
																	)}
																	<input
																		id="edit-image-upload"
																		ref={
																			editFileInputRef
																		}
																		type="file"
																		accept="image/*"
																		className="hidden"
																		disabled={
																			uploadingEdit
																		}
																		onChange={async (
																			e,
																		) => {
																			const file =
																				e
																					.target
																					.files?.[0];
																			if (
																				file
																			)
																				await uploadEdit(
																					file,
																				);
																		}}
																	/>
																</label>
																{uploadErrorEdit && (
																	<p className="mt-1 text-xs text-red-500">
																		{
																			uploadErrorEdit
																		}
																	</p>
																)}
															</div>
															{/* Show newly uploaded or existing image */}
															{(uploadedUrlEdit ||
																editingProduct?.image) && (
																// eslint-disable-next-line @next/next/no-img-element
																<img
																	src={
																		uploadedUrlEdit ||
																		editingProduct!
																			.image
																	}
																	alt="Preview"
																	className="w-full h-48 object-cover rounded-2xl border border-gray-200"
																/>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
										<button
											type="submit"
											disabled={
												isSubmitting ||
												uploadingEdit
											}
											className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
										>
											{isSubmitting ? (
												<div className="flex items-center">
													<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
													Menyimpan...
												</div>
											) : (
												'Simpan Perubahan'
											)}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowEditModal(
													false,
												);
												setEditingProduct(
													null,
												);
												resetForm();
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

			{/* Delete confirmation modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowDeleteModal(
									false,
								);
								setProductToDelete(
									null,
								);
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
											Hapus Produk
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda
												yakin ingin
												menghapus &quot;
												{
													productToDelete?.name
												}
												&quot;? Tindakan
												ini tidak dapat
												dibatalkan.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={
										confirmDelete
									}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Hapus
								</button>
								<button
									onClick={() => {
										setShowDeleteModal(
											false,
										);
										setProductToDelete(
											null,
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
		</MainLayout>
	);
}
