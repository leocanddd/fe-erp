import MainLayout from '@/components/MainLayout';
import {
	createQuotation,
	deleteQuotation,
	getQuotations,
	Quotation,
	QuotationProduct,
	updateQuotation,
} from '@/lib/quotations';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Quotations() {
	const [quotations, setQuotations] =
		useState<Quotation[]>([]);
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
		quotationToDelete,
		setQuotationToDelete,
	] = useState<Quotation | null>(null);
	const [
		showAddModal,
		setShowAddModal,
	] = useState(false);
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);
	const [formData, setFormData] =
		useState({
			customerName: '',
			salesName: '',
			date: '',
			discount: '',
			isApproved: false,
		});
	const [products, setProducts] =
		useState<QuotationProduct[]>([
			{
				name: '',
				harga: 0,
				quantity: 0,
			},
		]);

	const fetchQuotations =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getQuotations(
						currentPage,
						10,
						search,
					);
				if (
					response.statusCode === 200
				) {
					setQuotations(response.data);
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
							'Failed to fetch quotations',
					);
				}
			} catch {
				setError(
					'Failed to fetch quotations',
				);
			} finally {
				setLoading(false);
			}
		}, [currentPage, search]);

	useEffect(() => {
		fetchQuotations();
	}, [fetchQuotations]);

	const handleSearch = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchQuotations();
	};

	const handleDelete = async (
		quotation: Quotation,
	) => {
		setQuotationToDelete(quotation);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!quotationToDelete) return;

		try {
			const response =
				await deleteQuotation(
					quotationToDelete.id!,
				);
			if (response.statusCode === 200) {
				fetchQuotations();
				setShowDeleteModal(false);
				setQuotationToDelete(null);
			} else {
				setError(
					response.error ||
						'Failed to delete quotation',
				);
			}
		} catch {
			setError(
				'Failed to delete quotation',
			);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			| HTMLInputElement
			| HTMLSelectElement
		>,
	) => {
		const { name, value, type } =
			e.target;
		if (type === 'checkbox') {
			const checked = (
				e.target as HTMLInputElement
			).checked;
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleProductChange = (
		index: number,
		field: keyof QuotationProduct,
		value: string | number,
	) => {
		const updatedProducts = [
			...products,
		];
		updatedProducts[index] = {
			...updatedProducts[index],
			[field]: value,
		};
		setProducts(updatedProducts);
	};

	const addProduct = () => {
		setProducts([
			...products,
			{
				name: '',
				harga: 0,
				quantity: 0,
			},
		]);
	};

	const removeProduct = (
		index: number,
	) => {
		if (products.length > 1) {
			setProducts(
				products.filter(
					(_, i) => i !== index,
				),
			);
		}
	};

	const resetForm = () => {
		const today = new Date()
			.toISOString()
			.split('T')[0];
		setFormData({
			customerName: '',
			salesName: '',
			date: today,
			discount: '',
			isApproved: false,
		});
		setProducts([
			{
				name: '',
				harga: 0,
				quantity: 0,
			},
		]);
	};

	const handleAddQuotation = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const quotationData = {
				customerName:
					formData.customerName.trim(),
				salesName:
					formData.salesName.trim(),
				date: formData.date,
				products: products.map((p) => ({
					name: p.name.trim(),
					harga: p.harga || 0,
					quantity: p.quantity || 0,
				})),
				discount: formData.discount
					? parseFloat(
							formData.discount,
						)
					: 0,
				isApproved: formData.isApproved,
			};

			const response =
				await createQuotation(
					quotationData,
				);
			if (response.statusCode === 201) {
				fetchQuotations();
				setShowAddModal(false);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal menambah quotation',
				);
			}
		} catch {
			setError(
				'Gagal menambah quotation',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleApprove = async (
		quotation: Quotation,
	) => {
		try {
			const response =
				await updateQuotation(
					quotation.id!,
					{ isApproved: true },
				);
			if (response.statusCode === 200) {
				fetchQuotations();
			} else {
				setError(
					response.error ||
						'Gagal approve quotation',
				);
			}
		} catch {
			setError(
				'Gagal approve quotation',
			);
		}
	};

	const calculateTotal = (
		quotation: Quotation,
	) => {
		const subtotal =
			quotation.products.reduce(
				(sum, product) =>
					sum +
					(product.harga || 0) *
						(product.quantity || 0),
				0,
			);
		const discount =
			quotation.discount || 0;
		const total =
			subtotal -
			(subtotal * discount) / 100;
		return { subtotal, total };
	};

	return (
		<MainLayout title="Quotation">
			<div className="max-w-7xl mx-auto">
				{/* Header with search and add button */}
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Quotation
						</h2>
						<p className="text-gray-600">
							Kelola quotation pelanggan
						</p>
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
								placeholder="Cari berdasarkan nama customer atau sales..."
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

				{/* Quotations table */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat quotation...
								</span>
							</div>
						</div>
					) : !quotations ||
					  quotations.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada quotation yang
							ditemukan
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Customer
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Sales
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Tanggal
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Produk
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Total
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{quotations.map(
											(quotation) => {
												const {
													total,
												} =
													calculateTotal(
														quotation,
													);
												return (
													<tr
														key={
															quotation.id
														}
														className="hover:bg-gray-50"
													>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{
																	quotation.customerName
																}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm text-gray-900">
																{
																	quotation.salesName
																}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{new Date(
																quotation.date,
															).toLocaleDateString(
																'id-ID',
															)}
														</td>
														<td className="px-6 py-4 text-sm text-gray-900">
															<div className="max-w-xs">
																{quotation.products
																	.map(
																		(
																			p,
																		) =>
																			p.name,
																	)
																	.join(
																		', ',
																	)}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															Rp{' '}
															{total.toLocaleString(
																'id-ID',
															)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
																	quotation.isApproved
																		? 'bg-green-100 text-green-800'
																		: 'bg-yellow-100 text-yellow-800'
																}`}
															>
																{quotation.isApproved
																	? 'Approved'
																	: 'Pending'}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
															<div className="flex items-center justify-end space-x-2">
																{!quotation.isApproved && (
																	<button
																		onClick={() =>
																			handleApprove(
																				quotation,
																			)
																		}
																		className="text-green-600 hover:text-green-900 p-1 rounded"
																		title="Approve quotation"
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
																				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
																			/>
																		</svg>
																	</button>
																)}
																<button
																	onClick={() =>
																		handleDelete(
																			quotation,
																		)
																	}
																	className="text-red-600 hover:text-red-900 p-1 rounded"
																	title="Hapus quotation"
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
												);
											},
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

			{/* Add Quotation Modal */}
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
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
							<form
								onSubmit={
									handleAddQuotation
								}
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													Tambah
													Quotation Baru
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

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
												<div>
													<label
														htmlFor="customerName"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Nama
														Customer *
													</label>
													<input
														type="text"
														id="customerName"
														name="customerName"
														required
														value={
															formData.customerName
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama customer"
													/>
												</div>

												<div>
													<label
														htmlFor="salesName"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Nama Sales *
													</label>
													<input
														type="text"
														id="salesName"
														name="salesName"
														required
														value={
															formData.salesName
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama sales"
													/>
												</div>

												<div>
													<label
														htmlFor="date"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Tanggal *
													</label>
													<input
														type="date"
														id="date"
														name="date"
														required
														value={
															formData.date
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
													/>
												</div>

												<div>
													<label
														htmlFor="discount"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Diskon (%)
													</label>
													<input
														type="number"
														id="discount"
														name="discount"
														min="0"
														max="100"
														step="0.01"
														value={
															formData.discount
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan diskon"
													/>
												</div>

												<div className="col-span-2">
													<label className="flex items-center">
														<input
															type="checkbox"
															name="isApproved"
															checked={
																formData.isApproved
															}
															onChange={
																handleInputChange
															}
															className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
														/>
														<span className="ml-2 text-sm font-medium text-gray-700">
															Approved
														</span>
													</label>
												</div>
											</div>

											<div className="border-t border-gray-200 pt-6">
												<div className="flex items-center justify-between mb-4">
													<h4 className="text-lg font-semibold text-gray-900">
														Produk
													</h4>
													<button
														type="button"
														onClick={
															addProduct
														}
														className="text-blue-600 hover:text-blue-700 text-sm font-medium"
													>
														+ Tambah
														Produk
													</button>
												</div>

												{products.map(
													(
														product,
														index,
													) => (
														<div
															key={
																index
															}
															className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"
														>
															<div className="md:col-span-2">
																<input
																	type="text"
																	required
																	value={
																		product.name
																	}
																	onChange={(
																		e,
																	) =>
																		handleProductChange(
																			index,
																			'name',
																			e
																				.target
																				.value,
																		)
																	}
																	className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	placeholder="Nama produk"
																/>
															</div>
															<div>
																<input
																	type="number"
																	min="0"
																	step="0.01"
																	value={
																		product.harga ||
																		''
																	}
																	onChange={(
																		e,
																	) =>
																		handleProductChange(
																			index,
																			'harga',
																			parseFloat(
																				e
																					.target
																					.value,
																			) ||
																				0,
																		)
																	}
																	className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	placeholder="Harga"
																/>
															</div>
															<div className="flex gap-2">
																<input
																	type="number"
																	min="0"
																	value={
																		product.quantity ||
																		''
																	}
																	onChange={(
																		e,
																	) =>
																		handleProductChange(
																			index,
																			'quantity',
																			parseInt(
																				e
																					.target
																					.value,
																			) ||
																				0,
																		)
																	}
																	className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	placeholder="Qty"
																/>
																{products.length >
																	1 && (
																	<button
																		type="button"
																		onClick={() =>
																			removeProduct(
																				index,
																			)
																		}
																		className="text-red-600 hover:text-red-700"
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
																)}
															</div>
														</div>
													),
												)}
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
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Menyimpan...
											</div>
										) : (
											'Simpan Quotation'
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
								setQuotationToDelete(
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
											Hapus Quotation
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda
												yakin ingin
												menghapus
												quotation untuk
												&quot;
												{
													quotationToDelete?.customerName
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
										setQuotationToDelete(
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
