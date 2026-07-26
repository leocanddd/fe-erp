import MainLayout from '@/components/MainLayout';
import {
	deleteWebProduct,
	getWebProducts,
	WebProduct,
} from '@/lib/web-products';
import { useRouter } from 'next/router';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function WebProducts() {
	const router = useRouter();
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
		<MainLayout title="Web Products">
			<style jsx global>{`
				.chip {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					font-weight: 700;
					font-size: 11px;
					padding: 4px 11px;
					border-radius: 100px;
					white-space: nowrap;
				}
				.chip .cdot {
					width: 6px;
					height: 6px;
					border-radius: 50%;
					background: currentColor;
				}
				.chip.green { background: #E7F7EE; color: #1F8A4D; }
				.chip.grey { background: #EEF1F5; color: #697789; }
				.tag-brand {
					display: inline-block;
					font-weight: 600;
					font-size: 11px;
					padding: 3px 9px;
					border-radius: 6px;
					background: #e6f4fc;
					color: #1573a8;
				}
				.pill-note {
					display: inline-block;
					font-size: 12px;
					color: var(--muted);
					background: var(--bg);
					border-radius: 100px;
					padding: 5px 12px;
				}
			`}</style>

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
						Web Products
					</h1>
					<div style={{
						fontSize: '13px',
						color: 'var(--muted)',
						marginTop: '4px'
					}}>
						{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
					</div>
				</div>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					gap: '10px'
				}}>
					<button
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							height: '38px',
							padding: '0 18px',
							border: '1px solid var(--border)',
							borderRadius: '9px',
							cursor: 'pointer',
							fontFamily: "'Montserrat', sans-serif",
							fontWeight: 700,
							fontSize: '13px',
							color: 'var(--text)',
							background: '#fff',
							transition: '0.18s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = 'var(--blue)';
							e.currentTarget.style.color = 'var(--blue)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = 'var(--border)';
							e.currentTarget.style.color = 'var(--text)';
						}}
					>
						Pilih dari Stok Barang
					</button>
					<button
						onClick={() => router.push('/web-products/new')}
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
						Produk Web
					</button>
				</div>
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
						minWidth: '240px',
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
							placeholder="Cari produk web..."
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
					<div style={{ marginLeft: 'auto' }}></div>
					<span className="pill-note">Sumber: Inventory › Stok Barang</span>
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
				) : products.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada produk web ditemukan
					</div>
				) : (
					<>
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
										Produk Website
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
										Brand
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
										Kategori
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
										Varian
									</th>
									<th style={{
										textAlign: 'right',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Harga
									</th>
									<th style={{
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)'
									}}></th>
								</tr>
							</thead>
							<tbody>
								{products.map((p) => (
									<tr
										key={p.id}
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
												display: 'flex',
												alignItems: 'center',
												gap: '12px'
											}}>
												<span style={{
													flex: '0 0 44px',
													width: '44px',
													height: '44px',
													borderRadius: '9px',
													background: '#eef3f8',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													color: '#a9b7c6'
												}}>
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<rect x="3" y="3" width="18" height="18" rx="2"/>
														<circle cx="9" cy="9" r="1.6"/>
														<path d="m21 15-5-5L5 21"/>
													</svg>
												</span>
												<div>
													<div style={{
														fontWeight: 700,
														fontSize: '13.5px',
														color: 'var(--dark)'
													}}>
														{p.displayName || p.name}
													</div>
													{p.subtitle && (
														<div style={{
															fontWeight: 400,
															fontSize: '12px',
															color: 'var(--muted)'
														}}>
															{p.subtitle}
														</div>
													)}
												</div>
											</div>
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle'
										}}>
											{p.brand || '-'}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											verticalAlign: 'middle'
										}}>
											{p.category && (
												<span className="tag-brand">{p.category}</span>
											)}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--muted)',
											verticalAlign: 'middle'
										}}>
											{p.variants?.length ? `${p.variants.length} varian` : '-'}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle',
											textAlign: 'right',
											fontWeight: 600
										}}>
											{p.price ? `Rp ${p.price.toLocaleString('id-ID')}` : '-'}
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
													onClick={() => router.push(`/web-products/${p.id}`)}
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
													onClick={() => setDeleteModal({ open: true, product: p })}
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
					</>
				)}
			</section>

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
