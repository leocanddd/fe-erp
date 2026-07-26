import MainLayout from '@/components/MainLayout';
import {
	WebsiteCatalogue,
	getWebsiteCatalogues,
	createWebsiteCatalogue,
	updateWebsiteCatalogue,
	deleteWebsiteCatalogue,
} from '@/lib/website-catalogue';
import { uploadFile } from '@/lib/upload';
import { useEffect, useState } from 'react';

export default function OfficialStore() {
	const [catalogues, setCatalogues] = useState<WebsiteCatalogue[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState<WebsiteCatalogue | null>(null);
	const [formData, setFormData] = useState({
		title: '',
		images: [] as string[],
		descText: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({});

	useEffect(() => {
		fetchCatalogues();
	}, []);

	const fetchCatalogues = async () => {
		setLoading(true);
		try {
			const response = await getWebsiteCatalogues();
			if (response.status === 'success') {
				setCatalogues(response.data || []);
				setError('');
			} else {
				setError(response.error || 'Gagal memuat data');
			}
		} catch (err) {
			console.error('Error fetching catalogues:', err);
			setError('Gagal memuat data. Silakan coba lagi.');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (item?: WebsiteCatalogue) => {
		if (item) {
			setEditingItem(item);
			setFormData({
				title: item.title,
				images: item.images.length > 0 ? item.images : [],
				descText: item.descText,
			});
		} else {
			setEditingItem(null);
			setFormData({
				title: '',
				images: [],
				descText: '',
			});
		}
		setShowModal(true);
	};

	const getItemId = (item: WebsiteCatalogue): string => {
		return item._id || item.id || '';
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingItem(null);
		setFormData({
			title: '',
			images: [],
			descText: '',
		});
		setUploadingImages({});
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const fileArray = Array.from(files);
		const startIndex = formData.images.length;

		for (let i = 0; i < fileArray.length; i++) {
			const file = fileArray[i];
			const uploadIndex = startIndex + i;

			setUploadingImages((prev) => ({ ...prev, [uploadIndex]: true }));

			try {
				const response = await uploadFile(file);
				if (response.url) {
					setFormData((prev) => ({
						...prev,
						images: [...prev.images, response.url!],
					}));
				} else {
					setError(response.error || 'Gagal mengupload gambar');
				}
			} catch (err) {
				console.error('Error uploading image:', err);
				setError('Gagal mengupload gambar');
			} finally {
				setUploadingImages((prev) => {
					const newState = { ...prev };
					delete newState[uploadIndex];
					return newState;
				});
			}
		}

		// Reset input
		e.target.value = '';
	};

	const handleRemoveImage = (index: number) => {
		setFormData({
			...formData,
			images: formData.images.filter((_, i) => i !== index),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			if (!formData.title.trim()) {
				setError('Judul harus diisi');
				setSubmitting(false);
				return;
			}

			if (formData.images.length === 0) {
				setError('Minimal satu gambar harus diupload');
				setSubmitting(false);
				return;
			}

			if (!formData.descText.trim()) {
				setError('Deskripsi harus diisi');
				setSubmitting(false);
				return;
			}

			const payload = {
				title: formData.title.trim(),
				images: formData.images,
				descText: formData.descText.trim(),
			};

			let response;
			if (editingItem) {
				const itemId = getItemId(editingItem);
				response = await updateWebsiteCatalogue(itemId, payload);
			} else {
				response = await createWebsiteCatalogue(payload);
			}

			if (response.status === 'success') {
				await fetchCatalogues();
				handleCloseModal();
				setError('');
			} else {
				setError(response.error || 'Gagal menyimpan data');
			}
		} catch (err) {
			console.error('Error submitting catalogue:', err);
			setError('Gagal menyimpan data. Silakan coba lagi.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (item: WebsiteCatalogue) => {
		if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) {
			return;
		}

		try {
			const itemId = getItemId(item);
			const response = await deleteWebsiteCatalogue(itemId);
			if (response.status === 'success') {
				await fetchCatalogues();
				setError('');
			} else {
				setError(response.error || 'Gagal menghapus data');
			}
		} catch (err) {
			console.error('Error deleting catalogue:', err);
			setError('Gagal menghapus data. Silakan coba lagi.');
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return '-';
		try {
			return new Date(dateString).toLocaleDateString('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return '-';
		}
	};

	const isUploading = Object.keys(uploadingImages).length > 0;

	return (
		<MainLayout title="Official Store">
			<style jsx global>{`
				.pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
				.pcard { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: #fff; transition: .18s; }
				.pcard:hover { box-shadow: 0 8px 22px rgba(0,0,0,.08); transform: translateY(-2px); }
				.pcover { height: 140px; background: linear-gradient(135deg, #E8F1F9, #D6E6F2); display: flex; align-items: center; justify-content: center; color: #9FB4C8; position: relative; overflow: hidden; }
				.pcover img { width: 100%; height: 100%; object-fit: cover; }
				.pcard-body { padding: 15px 16px; }
				.pcard-title { font-weight: 700; font-size: 15px; color: var(--dark); line-height: 1.35; margin-bottom: 6px; }
				.pcard-sub { font-weight: 400; font-size: 12.5px; color: var(--muted); line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
				.pcard-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--muted); }
				.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
				.modal-box { background: white; border-radius: 12px; max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; }
				.modal-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--border); }
				.modal-title { margin: 0; font-weight: 700; font-size: 18px; color: var(--dark); }
				.modal-body { padding: 24px 28px; }
				.field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
				.field label { font-weight: 600; font-size: 12px; color: var(--dark); }
				.field .hint { font-weight: 400; font-size: 11px; color: var(--muted); margin-top: -3px; }
				.input, .textarea { font-family: 'Montserrat', sans-serif; font-size: 13px; color: var(--text); border: 1px solid var(--border); border-radius: 9px; padding: 10px 13px; background: #fff; outline: none; transition: border-color 0.18s; width: 100%; }
				.input:focus, .textarea:focus { border-color: var(--blue); }
				.textarea { resize: vertical; min-height: 96px; line-height: 1.6; }
				.img-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
				.img-preview-item { position: relative; aspect-ratio: 1; border-radius: 9px; overflow: hidden; }
				.img-preview-item img { width: 100%; height: 100%; object-fit: cover; }
				.img-remove-btn { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; background: var(--red); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1; opacity: 0; transition: 0.18s; }
				.img-preview-item:hover .img-remove-btn { opacity: 1; }
				.upload-btn-wrapper { display: flex; align-items: center; gap: 10px; }
				.upload-btn { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 18px; border: none; border-radius: 9px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; color: #fff; background: var(--grad); transition: 0.18s; }
				.upload-btn:hover { filter: brightness(1.07); }
				.upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
				.modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
				.btn { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 18px; border: none; border-radius: 9px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; color: #fff; background: var(--grad); transition: 0.18s; }
				.btn:hover { filter: brightness(1.07); transform: translateY(-1px); }
				.btn.ghost { background: #fff; border: 1px solid var(--border); color: var(--text); }
				.btn.ghost:hover { border-color: var(--blue); color: var(--blue); transform: none; filter: none; }
				.btn:disabled { opacity: 0.5; cursor: not-allowed; }
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
						Official Store
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
					onClick={() => handleOpenModal()}
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
					Tambah Item
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
				background: 'white',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}>
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
							<span>Memuat data...</span>
						</div>
					</div>
				) : catalogues.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada data
					</div>
				) : (
					<div className="pgrid">
						{catalogues.map((item) => (
							<div key={getItemId(item)} className="pcard">
								<div className="pcover">
									{item.images.length > 0 ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={item.images[0]} alt={item.title} />
									) : (
										<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
											<circle cx="8.5" cy="8.5" r="1.5"/>
											<polyline points="21 15 16 10 5 21"/>
										</svg>
									)}
								</div>
								<div className="pcard-body">
									<div className="pcard-title">{item.title}</div>
									<div className="pcard-sub">{item.descText}</div>
									<div className="pcard-foot">
										<span>{item.images.length} gambar</span>
										<div style={{ display: 'flex', gap: '8px' }}>
											<button
												onClick={() => handleOpenModal(item)}
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: '6px',
													height: '32px',
													padding: '0 13px',
													border: '1px solid var(--border)',
													borderRadius: '8px',
													cursor: 'pointer',
													fontFamily: "'Montserrat', sans-serif",
													fontWeight: 700,
													fontSize: '12px',
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
												Edit
											</button>
											<button
												onClick={() => handleDelete(item)}
												style={{
													width: '32px',
													height: '32px',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid var(--border)',
													borderRadius: '8px',
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
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Modal */}
			{showModal && (
				<div className="modal-overlay" onClick={handleCloseModal}>
						<div className="modal-box" onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h3 className="modal-title">
									{editingItem ? 'Edit Item' : 'Tambah Item Baru'}
								</h3>
							</div>
							<div className="modal-body">
								<form onSubmit={handleSubmit}>
									<div className="field">
										<label>Judul</label>
										<input
											type="text"
											className="input"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="Masukkan judul..."
											required
										/>
									</div>

									<div className="field">
										<label>Gambar</label>
										{formData.images.length > 0 && (
											<div className="img-preview-grid">
												{formData.images.map((img, index) => (
													<div key={index} className="img-preview-item">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img src={img} alt={`Upload ${index + 1}`} />
														<button
															type="button"
															className="img-remove-btn"
															onClick={() => handleRemoveImage(index)}
														>
															×
														</button>
													</div>
												))}
											</div>
										)}
										<div className="upload-btn-wrapper">
											<label className="upload-btn" style={{ cursor: isUploading || submitting ? 'not-allowed' : 'pointer', opacity: isUploading || submitting ? 0.5 : 1 }}>
												{isUploading ? 'Mengupload...' : '+ Upload Gambar'}
												<input
													type="file"
													accept="image/*"
													multiple
													onChange={handleImageUpload}
													style={{ display: 'none' }}
													disabled={isUploading || submitting}
												/>
											</label>
											{isUploading && (
												<div style={{
													width: '20px',
													height: '20px',
													border: '3px solid rgba(28, 167, 236, 0.3)',
													borderTopColor: '#1ca7ec',
													borderRadius: '50%',
													animation: 'spin 1s linear infinite'
												}}></div>
											)}
										</div>
										<div className="hint">Anda bisa mengupload beberapa gambar sekaligus</div>
									</div>

									<div className="field">
										<label>Deskripsi</label>
										<textarea
											className="textarea"
											value={formData.descText}
											onChange={(e) =>
												setFormData({ ...formData, descText: e.target.value })
											}
											placeholder="Masukkan deskripsi produk..."
											required
										/>
									</div>

									<div className="modal-actions">
										<button
											type="button"
											className="btn ghost"
											onClick={handleCloseModal}
											disabled={submitting || isUploading}
										>
											Batal
										</button>
										<button
											type="submit"
											className="btn"
											disabled={submitting || isUploading}
										>
											{submitting ? 'Menyimpan...' : 'Simpan'}
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
