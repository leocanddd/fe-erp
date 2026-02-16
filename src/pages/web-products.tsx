import MainLayout from '@/components/MainLayout';
import {
	deleteWebProduct,
	getWebProducts,
	WebProduct,
} from '@/lib/web-products';
import Link from 'next/link';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function WebProducts() {
	const [products, setProducts] =
		useState<WebProduct[]>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [search, setSearch] =
		useState('');
	const [category, setCategory] =
		useState('');
	const [brand, setBrand] =
		useState('');
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalPages, setTotalPages] =
		useState(0);
	const [totalItems, setTotalItems] =
		useState(0);

	const [deleteModal, setDeleteModal] =
		useState<{
			open: boolean;
			product: WebProduct | null;
		}>({ open: false, product: null });
	const [isDeleting, setIsDeleting] =
		useState(false);

	const fetchProducts =
		useCallback(async () => {
			setLoading(true);
			try {
				const res =
					await getWebProducts(
						currentPage,
						10,
						search,
						category,
						brand,
					);
				if (res.statusCode === 200) {
					setProducts(res.data ?? []);
					setTotalPages(
						res.pagination.totalPages,
					);
					setTotalItems(
						res.pagination.totalItems,
					);
					setError('');
				} else {
					setError(
						res.error ||
							'Gagal memuat data',
					);
				}
			} catch {
				setError('Gagal memuat data');
			} finally {
				setLoading(false);
			}
		}, [
			currentPage,
			search,
			category,
			brand,
		]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleSearch = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setCurrentPage(1);
	};

	const confirmDelete = async () => {
		if (!deleteModal.product) return;
		setIsDeleting(true);
		try {
			const res =
				await deleteWebProduct(
					deleteModal.product.id,
				);
			if (res.statusCode === 200) {
				setDeleteModal({
					open: false,
					product: null,
				});
				fetchProducts();
			} else {
				setError(
					res.error ||
						'Gagal menghapus produk',
				);
				setDeleteModal({
					open: false,
					product: null,
				});
			}
		} catch {
			setError(
				'Gagal menghapus produk',
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<MainLayout title="Produk Web">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-1">
						Produk Web
					</h2>
					<p className="text-gray-600">
						Kelola produk yang tampil di
						website
					</p>
				</div>

				{/* Filters */}
				<form
					onSubmit={handleSearch}
					className="mb-6 flex flex-col sm:flex-row gap-3"
				>
					<input
						type="text"
						value={search}
						onChange={(e) =>
							setSearch(e.target.value)
						}
						placeholder="Cari nama / displayName..."
						className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					/>
					<input
						type="text"
						value={category}
						onChange={(e) =>
							setCategory(
								e.target.value,
							)
						}
						placeholder="Kategori"
						className="w-full sm:w-40 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					/>
					<input
						type="text"
						value={brand}
						onChange={(e) =>
							setBrand(e.target.value)
						}
						placeholder="Brand"
						className="w-full sm:w-40 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					/>
					<button
						type="submit"
						className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
					>
						Cari
					</button>
				</form>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<p className="text-sm text-red-600 font-medium">
							{error}
						</p>
					</div>
				)}

				{/* Table */}
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
					) : products.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada produk web
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
												Brand
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Kategori
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Harga
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Varian
											</th>
											<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{products.map(
											(p) => (
												<tr
													key={p.id}
													className="hover:bg-gray-50"
												>
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															{p.image && (
																// eslint-disable-next-line @next/next/no-img-element
																<img
																	src={
																		p.image
																	}
																	alt={
																		p.displayName ||
																		p.name
																	}
																	className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
																/>
															)}
															<div>
																<div className="text-sm font-semibold text-gray-900">
																	{p.displayName ||
																		p.name}
																</div>
																{p.subtitle && (
																	<div className="text-xs text-gray-500">
																		{
																			p.subtitle
																		}
																	</div>
																)}
															</div>
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
														{p.brand}
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														{p.category && (
															<span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
																{
																	p.category
																}
															</span>
														)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
														{p.price
															? `Rp ${p.price.toLocaleString('id-ID')}`
															: '-'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{p.variants
															?.length
															? `${p.variants.length} varian`
															: '-'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-right">
														<div className="flex items-center justify-end gap-2">
															<Link
																href={`/web-products/${p.id}`}
																className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
																title="Edit"
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
															</Link>
															<button
																onClick={() =>
																	setDeleteModal(
																		{
																			open: true,
																			product:
																				p,
																		},
																	)
																}
																className="text-red-600 hover:text-red-900 p-1 rounded"
																title="Hapus"
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
								<p className="text-sm text-gray-700">
									Menampilkan{' '}
									<span className="font-medium">
										{(currentPage - 1) *
											10 +
											1}
									</span>{' '}
									–{' '}
									<span className="font-medium">
										{Math.min(
											currentPage * 10,
											totalItems,
										)}
									</span>{' '}
									dari{' '}
									<span className="font-medium">
										{totalItems}
									</span>{' '}
									hasil
								</p>
								<nav className="inline-flex rounded-md shadow-sm -space-x-px">
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
										className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
										className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Berikutnya
									</button>
								</nav>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Delete modal */}
			{deleteModal.open && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() =>
								setDeleteModal({
									open: false,
									product: null,
								})
							}
						/>
						<div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-6 pt-6 pb-4">
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
										<svg
											className="h-5 w-5 text-red-600"
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
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											Hapus Produk Web
										</h3>
										<p className="mt-1 text-sm text-gray-500">
											Apakah Anda yakin
											ingin menghapus
											&quot;
											{deleteModal
												.product
												?.displayName ||
												deleteModal
													.product
													?.name}
											&quot;? Tindakan
											ini tidak dapat
											dibatalkan.
										</p>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
								<button
									onClick={
										confirmDelete
									}
									disabled={isDeleting}
									className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
								>
									{isDeleting
										? 'Menghapus...'
										: 'Hapus'}
								</button>
								<button
									onClick={() =>
										setDeleteModal({
											open: false,
											product: null,
										})
									}
									className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
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
