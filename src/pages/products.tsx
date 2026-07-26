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
			pointMultiplier: 0,
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
			pointMultiplier: 0,
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
				pointMultiplier: parseFloat(
					formData.pointMultiplier.toString(),
				),
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
			pointMultiplier:
				product.pointMultiplier,
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
				pointMultiplier: parseFloat(
					formData.pointMultiplier.toString(),
				),
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
						Produk
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
					onClick={() => setShowAddModal(true)}
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
					Tambah Produk
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
				{/* Toolbar with search */}
				<div style={{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					flexWrap: 'wrap',
					marginBottom: '18px'
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
						color: 'var(--muted)'
					}}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="11" cy="11" r="7"/>
							<path d="m21 21-4.3-4.3"/>
						</svg>
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Cari produk berdasarkan nama, merek, atau kode..."
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
							<span>Memuat produk...</span>
						</div>
					</div>
				) : !products || products.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada produk yang ditemukan
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
									Produk
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
									Kode
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
									Stok
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
									Due Out
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
									Tanggal Masuk
								</th>
								<th style={{
									padding: '0 14px 12px',
									borderBottom: '1px solid var(--border)'
								}}></th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<tr
									key={product.id}
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
											{product.name}
										</div>
										<div style={{
											fontWeight: 400,
											fontSize: '12px',
											color: 'var(--muted)'
										}}>
											{product.brand}
										</div>
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										verticalAlign: 'middle'
									}}>
										<span style={{
											display: 'inline-block',
											fontWeight: 600,
											fontSize: '11px',
											padding: '3px 9px',
											borderRadius: '6px',
											background: '#e6f4fc',
											color: '#1573a8'
										}}>
											{product.code}
										</span>
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--text)',
										verticalAlign: 'middle',
										fontWeight: 600
									}}>
										{product.stock}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{product.holdingStock}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{new Date(product.entryDate).toLocaleDateString('id-ID')}
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
												onClick={() => handleEdit(product)}
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
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M12 20h9"/>
													<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
												</svg>
											</button>
											<button
												onClick={() => handleDelete(product)}
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

													<div>
														<label
															htmlFor="edit-entryDate"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Point
															Multiplier
														</label>
														<input
															type="number"
															id="edit-point"
															name="pointMultiplier"
															required
															min="0"
															step="0.01"
															value={
																formData.pointMultiplier
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan jumlah point multiplier"
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
