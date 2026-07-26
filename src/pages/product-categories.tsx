import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { Category } from '@/lib/category';
import { getMenuPermissions } from '@/lib/navigation';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

export default function ProductCategories() {
	const router = useRouter();
	const [categories, setCategories] =
		useState<Category[]>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [
		deleteLoading,
		setDeleteLoading,
	] = useState<string | null>(null);
	const [canDelete, setCanDelete] =
		useState(false);

	useEffect(() => {
		const user = getStoredUser();
		if (user) {
			const perms = getMenuPermissions();
			setCanDelete((perms['/product-categories/action/delete'] ?? [5]).includes(user.role));
		}
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/categories',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to fetch categories',
				);
			}

			const data =
				await response.json();
			const categoriesData =
				data.data || [];

			setCategories(categoriesData);
			setError('');
		} catch (err) {
			console.error(err);
			setError(
				'Failed to fetch categories',
			);
			setCategories([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (
		id: string,
	) => {
		if (
			!confirm(
				'Yakin ingin menghapus kategori ini?',
			)
		)
			return;

		setDeleteLoading(id);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/categories/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to delete category',
				);
			}

			fetchCategories();
		} catch (err) {
			console.error(err);
			alert(
				'Gagal menghapus kategori',
			);
		} finally {
			setDeleteLoading(null);
		}
	};

	const filteredCategories = categories.filter((cat) => {
		const query = searchQuery.toLowerCase();
		return cat.name.toLowerCase().includes(query) || cat.key.toLowerCase().includes(query);
	});

	return (
		<MainLayout title="Product Categories">
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
				.chip.amber { background: #FEF3E0; color: #C77E12; }
				.chip.blue { background: #E6F4FC; color: #1573A8; }
				.chip.red { background: #FDECEA; color: #D93A2F; }
				.chip.grey { background: #EEF1F5; color: #697789; }
				.chip.violet { background: #F0E9FA; color: #7B4FB5; }
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
						Product Categories
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
					onClick={() => router.push('/product-categories/new')}
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
					Tambah Kategori
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
			<div style={{
				background: 'white',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}>
				{/* Search */}
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
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Cari kategori..."
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
							<span>Memuat kategori...</span>
						</div>
					</div>
				) : filteredCategories.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						{searchQuery ? 'Tidak ada kategori yang ditemukan' : 'Tidak ada kategori'}
					</div>
				) : (
					<table style={{
						width: '100%',
						borderCollapse: 'collapse'
					}}>
						<thead>
							<tr>
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
									Name
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
									Key
								</th>
								{canDelete && (
									<th style={{
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)'
									}}></th>
								)}
							</tr>
						</thead>
						<tbody>
							{filteredCategories.map((cat) => (
								<tr
									key={cat.id}
									style={{
										transition: 'background 0.15s ease'
									}}
									onMouseEnter={(e) => e.currentTarget.style.background = '#F8FBFF'}
									onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
								>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--text)',
										verticalAlign: 'middle',
										fontWeight: 600
									}}>
										{cat.name}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{cat.key}
									</td>
									{canDelete && (
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle',
											textAlign: 'right'
										}}>
											<div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
												<button
													onClick={() => handleDelete(cat.id)}
													disabled={deleteLoading === cat.id}
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
														cursor: deleteLoading === cat.id ? 'not-allowed' : 'pointer',
														transition: '0.18s',
														opacity: deleteLoading === cat.id ? 0.5 : 1
													}}
													onMouseEnter={(e) => {
														if (deleteLoading !== cat.id) {
															e.currentTarget.style.borderColor = 'var(--red)';
															e.currentTarget.style.color = 'var(--red)';
														}
													}}
													onMouseLeave={(e) => {
														if (deleteLoading !== cat.id) {
															e.currentTarget.style.borderColor = 'var(--border)';
															e.currentTarget.style.color = 'var(--muted)';
														}
													}}
												>
													<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
													</svg>
												</button>
											</div>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Summary */}
			{!loading && categories.length > 0 && (
				<div style={{
					marginTop: '16px',
					fontSize: '13px',
					color: 'var(--muted)',
					textAlign: 'right'
				}}>
					Total kategori: <span style={{ fontWeight: 700, color: 'var(--text)' }}>
						{categories.length}
					</span>
				</div>
			)}
		</MainLayout>
	);
}
