import MainLayout from '@/components/MainLayout';
import {
	createStore,
	deleteStore,
	getStores,
	Store,
	updateStore,
} from '@/lib/stores';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Stores() {
	const [stores, setStores] = useState<
		Store[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [search, setSearch] =
		useState('');
	const [
		debouncedSearch,
		setDebouncedSearch,
	] = useState('');
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
		storeToDelete,
		setStoreToDelete,
	] = useState<Store | null>(null);
	const [
		showAddModal,
		setShowAddModal,
	] = useState(false);
	const [
		showEditModal,
		setShowEditModal,
	] = useState(false);
	const [
		editingStore,
		setEditingStore,
	] = useState<Store | null>(null);
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);
	const [formData, setFormData] =
		useState({
			name: '',
			location: '',
			pic: '',
			contact: '',
			limit: '',
			description: '',
			totalVisit: '',
			username: '',
			pin: '',
		});

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setCurrentPage(1);
		}, 500);

		return () => clearTimeout(timer);
	}, [search]);

	const fetchStores =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getStores(
						currentPage,
						10,
						debouncedSearch,
					);
				if (
					response.statusCode === 200
				) {
					setStores(response.data);
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
							'Failed to fetch stores',
					);
				}
			} catch {
				setError(
					'Failed to fetch stores',
				);
			} finally {
				setLoading(false);
			}
		}, [currentPage, debouncedSearch]);

	useEffect(() => {
		fetchStores();
	}, [fetchStores]);

	const handleSearch = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
	};

	const handleDelete = async (
		store: Store,
	) => {
		setStoreToDelete(store);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!storeToDelete) return;

		try {
			const response =
				await deleteStore(
					storeToDelete.id!,
				);
			if (response.statusCode === 200) {
				fetchStores();
				setShowDeleteModal(false);
				setStoreToDelete(null);
			} else {
				setError(
					response.error ||
						'Failed to delete store',
				);
			}
		} catch {
			setError(
				'Failed to delete store',
			);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			| HTMLInputElement
			| HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const resetForm = () => {
		setFormData({
			name: '',
			location: '',
			pic: '',
			contact: '',
			limit: '',
			description: '',
			totalVisit: '',
			username: '',
			pin: '',
		});
	};

	const handleAddStore = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const storeData = {
				name: formData.name.trim(),
				location:
					formData.location.trim(),
				pic: formData.pic.trim(),
				contact:
					formData.contact.trim(),
				limit: parseInt(formData.limit),
				description:
					formData.description.trim(),
				totalVisit:
					parseInt(
						formData.totalVisit,
					) || 0,
				username:
					formData.username.trim(),
				pin: formData.pin.trim(),
			};

			const response =
				await createStore(storeData);
			if (response.statusCode === 201) {
				fetchStores();
				setShowAddModal(false);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal menambah toko',
				);
			}
		} catch {
			setError('Gagal menambah toko');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (store: Store) => {
		setEditingStore(store);
		setFormData({
			name: store.name,
			location: store.location,
			pic: store.pic,
			contact: store.contact,
			limit: store.limit.toString(),
			description: store.description,
			totalVisit:
				store.totalVisit.toString(),
			username: store.username,
			pin: store.pin,
		});
		setShowEditModal(true);
	};

	const handleUpdateStore = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		if (!editingStore) return;

		setIsSubmitting(true);
		setError('');

		try {
			const storeData = {
				name: formData.name.trim(),
				location:
					formData.location.trim(),
				pic: formData.pic.trim(),
				contact:
					formData.contact.trim(),
				limit: parseInt(formData.limit),
				description:
					formData.description.trim(),
				totalVisit:
					parseInt(
						formData.totalVisit,
					) || 0,
				username:
					formData.username.trim(),
				pin: formData.pin.trim(),
			};

			const response =
				await updateStore(
					editingStore.id!,
					storeData,
				);
			if (response.statusCode === 200) {
				fetchStores();
				setShowEditModal(false);
				setEditingStore(null);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal mengubah toko',
				);
			}
		} catch {
			setError('Gagal mengubah toko');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<MainLayout title="Toko">
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
						Toko
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
					Tambah Toko
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
							placeholder="Cari toko berdasarkan nama atau lokasi..."
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
							<span>Memuat toko...</span>
						</div>
					</div>
				) : !stores || stores.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada toko yang ditemukan
					</div>
				) : (
					<>
						<div style={{ overflowX: 'auto' }}>
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
											Toko
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
											PIC
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
											Kontak
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
											Username
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
											PIN
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
											POIN
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
											Limit
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
											Kunjungan
										</th>
										<th style={{
											padding: '0 14px 12px',
											borderBottom: '1px solid var(--border)'
										}}></th>
									</tr>
								</thead>
								<tbody>
									{stores.map((store) => (
										<tr
											key={store.id}
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
													{store.name}
												</div>
												<div style={{
													fontWeight: 400,
													fontSize: '12px',
													color: 'var(--muted)',
													maxWidth: '200px',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}}>
													{store.description}
												</div>
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.location}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.pic}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.contact}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.username}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.pin}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												fontWeight: 600
											}}>
												{store.points}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.limit}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{store.totalVisit}
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
														onClick={() => handleEdit(store)}
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
														onClick={() => handleDelete(store)}
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
						</div>
					</>
				)}
			</section>

			{/* Add Store Modal */}
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
									handleAddStore
								}
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													Tambah Toko
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
														Nama Toko *
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
														placeholder="Masukkan nama toko"
													/>
												</div>

												<div>
													<label
														htmlFor="location"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Lokasi *
													</label>
													<input
														type="text"
														id="location"
														name="location"
														required
														value={
															formData.location
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan lokasi toko"
													/>
												</div>

												<div>
													<label
														htmlFor="pic"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														PIC
														(Penanggung
														Jawab) *
													</label>
													<input
														type="text"
														id="pic"
														name="pic"
														required
														value={
															formData.pic
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama PIC"
													/>
												</div>

												<div>
													<label
														htmlFor="contact"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Kontak *
													</label>
													<input
														type="text"
														id="contact"
														name="contact"
														required
														value={
															formData.contact
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nomor telepon/email"
													/>
												</div>

												<div>
													<label
														htmlFor="limit"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Limit *
													</label>
													<input
														type="number"
														id="limit"
														name="limit"
														required
														min="0"
														value={
															formData.limit
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan limit"
													/>
												</div>

												<div>
													<label
														htmlFor="totalVisit"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Total
														Kunjungan
													</label>
													<input
														type="number"
														id="totalVisit"
														name="totalVisit"
														min="0"
														value={
															formData.totalVisit
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan total kunjungan"
													/>
												</div>

												<div>
													<label
														htmlFor="username"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Username *
													</label>
													<input
														type="text"
														id="username"
														name="username"
														required
														value={
															formData.username
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan username"
													/>
												</div>

												<div>
													<label
														htmlFor="pin"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														PIN *
													</label>
													<input
														type="text"
														id="pin"
														name="pin"
														required
														value={
															formData.pin
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan PIN"
													/>
												</div>

												<div className="md:col-span-2">
													<label
														htmlFor="description"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Deskripsi *
													</label>
													<textarea
														id="description"
														name="description"
														required
														rows={3}
														value={
															formData.description
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan deskripsi toko"
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
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Menyimpan...
											</div>
										) : (
											'Simpan Toko'
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

			{/* Edit Store Modal */}
			{showEditModal &&
				editingStore && (
					<div className="fixed inset-0 z-[60] overflow-y-auto">
						<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div
								className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
								onClick={() => {
									setShowEditModal(
										false,
									);
									setEditingStore(null);
									resetForm();
									setError('');
								}}
							></div>
							<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
								<form
									onSubmit={
										handleUpdateStore
									}
								>
									<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
										<div className="sm:flex sm:items-start">
											<div className="w-full">
												<div className="flex items-center justify-between mb-6">
													<h3 className="text-2xl font-bold text-gray-900">
														Edit Toko
													</h3>
													<button
														type="button"
														onClick={() => {
															setShowEditModal(
																false,
															);
															setEditingStore(
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
															Nama Toko
															*
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
															placeholder="Masukkan nama toko"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-location"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Lokasi *
														</label>
														<input
															type="text"
															id="edit-location"
															name="location"
															required
															value={
																formData.location
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan lokasi toko"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-pic"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															PIC
															(Penanggung
															Jawab) *
														</label>
														<input
															type="text"
															id="edit-pic"
															name="pic"
															required
															value={
																formData.pic
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan nama PIC"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-contact"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Kontak *
														</label>
														<input
															type="text"
															id="edit-contact"
															name="contact"
															required
															value={
																formData.contact
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan nomor telepon/email"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-limit"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Limit *
														</label>
														<input
															type="number"
															id="edit-limit"
															name="limit"
															required
															min="0"
															value={
																formData.limit
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan limit"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-totalVisit"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Total
															Kunjungan
														</label>
														<input
															type="number"
															id="edit-totalVisit"
															name="totalVisit"
															min="0"
															value={
																formData.totalVisit
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan total kunjungan"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-username"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Username *
														</label>
														<input
															type="text"
															id="edit-username"
															name="username"
															required
															value={
																formData.username
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan username"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-pin"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															PIN *
														</label>
														<input
															type="text"
															id="edit-pin"
															name="pin"
															required
															value={
																formData.pin
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan PIN"
														/>
													</div>

													<div className="md:col-span-2">
														<label
															htmlFor="edit-description"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Deskripsi
															*
														</label>
														<textarea
															id="edit-description"
															name="description"
															required
															rows={3}
															value={
																formData.description
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan deskripsi toko"
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
												setEditingStore(
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
								setStoreToDelete(null);
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
											Hapus Toko
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda
												yakin ingin
												menghapus toko
												&quot;
												{
													storeToDelete?.name
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
										setStoreToDelete(
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
