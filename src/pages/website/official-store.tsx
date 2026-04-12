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
				images: item.images.length > 0 ? item.images : [],
				descText: item.descText,
			});
		} else {
			setEditingItem(null);
			setFormData({
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
		<MainLayout>
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8 flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Official Store
							</h1>
							<p className="mt-2 text-sm text-gray-600">
								Kelola katalog official store website
							</p>
						</div>
						<button
							onClick={() => handleOpenModal()}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							+ Tambah Item
						</button>
					</div>

					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					{loading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : (
						<div className="bg-white shadow-md rounded-lg overflow-hidden">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Gambar
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Deskripsi
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Dibuat
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Diperbarui
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{catalogues.length === 0 ? (
											<tr>
												<td
													colSpan={5}
													className="px-6 py-4 text-center text-gray-500"
												>
													Tidak ada data
												</td>
											</tr>
										) : (
											catalogues.map((item) => (
												<tr key={getItemId(item)} className="hover:bg-gray-50">
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="flex gap-2 flex-wrap">
															{item.images.slice(0, 3).map((img, idx) => (
																// eslint-disable-next-line @next/next/no-img-element
																<img
																	key={idx}
																	src={img}
																	alt={`Image ${idx + 1}`}
																	className="w-16 h-16 object-cover rounded"
																/>
															))}
															{item.images.length > 3 && (
																<div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
																	+{item.images.length - 3}
																</div>
															)}
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-gray-900">
														<div className="max-w-md truncate" title={item.descText}>
															{item.descText}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatDate(item.createdAt)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatDate(item.updatedAt)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
														<button
															onClick={() => handleOpenModal(item)}
															className="text-blue-600 hover:text-blue-900 mr-4"
														>
															Edit
														</button>
														<button
															onClick={() => handleDelete(item)}
															className="text-red-600 hover:text-red-900"
														>
															Hapus
														</button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h2 className="text-2xl font-bold mb-4">
								{editingItem ? 'Edit Item' : 'Tambah Item Baru'}
							</h2>
							<form onSubmit={handleSubmit}>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Gambar
									</label>

									{/* Uploaded Images Preview */}
									{formData.images.length > 0 && (
										<div className="grid grid-cols-3 gap-4 mb-4">
											{formData.images.map((img, index) => (
												<div key={index} className="relative group">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={img}
														alt={`Upload ${index + 1}`}
														className="w-full h-32 object-cover rounded-lg"
													/>
													<button
														type="button"
														onClick={() => handleRemoveImage(index)}
														className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
													>
														×
													</button>
												</div>
											))}
										</div>
									)}

									{/* Upload Button */}
									<div className="flex items-center gap-2">
										<label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer inline-block">
											{isUploading ? 'Mengupload...' : '+ Upload Gambar'}
											<input
												type="file"
												accept="image/*"
												multiple
												onChange={handleImageUpload}
												className="hidden"
												disabled={isUploading || submitting}
											/>
										</label>
										{isUploading && (
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
										)}
									</div>
									<p className="text-xs text-gray-500 mt-2">
										Anda bisa mengupload beberapa gambar sekaligus
									</p>
								</div>

								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Deskripsi
									</label>
									<textarea
										value={formData.descText}
										onChange={(e) =>
											setFormData({ ...formData, descText: e.target.value })
										}
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Masukkan deskripsi produk..."
										required
									/>
								</div>

								<div className="flex justify-end gap-2">
									<button
										type="button"
										onClick={handleCloseModal}
										className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
										disabled={submitting || isUploading}
									>
										Batal
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
