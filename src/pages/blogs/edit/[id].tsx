import MainLayout from '@/components/MainLayout';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import { useUpload } from '@/hooks/useUpload';
import { Blog, UpdateBlogInput } from '@/types/blog';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function EditBlog() {
	const router = useRouter();
	const { id } = router.query;
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [error, setError] = useState('');
	const [formData, setFormData] = useState<UpdateBlogInput>({
		_id: '',
		category: '',
		image: '',
		bannerImg: '',
		title: '',
		description: '',
		content: '',
		author: '',
		publishDate: '',
		tags: [],
	});
	const [tagInput, setTagInput] = useState('');

	const {
		upload: uploadImage,
		uploading: uploadingImage,
		uploadedUrl: uploadedImage,
		uploadError: uploadImageError,
	} = useUpload();

	const {
		upload: uploadBanner,
		uploading: uploadingBanner,
		uploadedUrl: uploadedBanner,
		uploadError: uploadBannerError,
	} = useUpload();

	const imageInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (id) {
			fetchBlog();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchBlog = async () => {
		setFetchLoading(true);
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/blogs/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch blog');
			}

			const result = await response.json();
			const blog: Blog = result.data;
			setFormData({
				_id: blog._id,
				category: blog.category,
				image: blog.image,
				bannerImg: blog.bannerImg,
				title: blog.title,
				description: blog.description,
				content: blog.content,
				author: blog.author,
				publishDate: new Date(blog.publishDate).toISOString().split('T')[0],
				tags: blog.tags,
			});
		} catch (err) {
			console.error('Error fetching blog:', err);
			setError('Failed to fetch blog');
		} finally {
			setFetchLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formData,
					image: uploadedImage || formData.image,
					bannerImg: uploadedBanner || formData.bannerImg,
					publishDate: new Date(formData.publishDate!).toISOString(),
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update blog');
			}

			router.push('/blogs');
		} catch (err: unknown) {
			console.error('Error updating blog:', err);
			setError(err instanceof Error ? err.message : 'Failed to update blog');
		} finally {
			setLoading(false);
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...(prev.tags || []), tagInput.trim()],
			}));
			setTagInput('');
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
		}));
	};

	if (fetchLoading) {
		return (
			<MainLayout title="Edit Blog">
				<div className="flex items-center justify-center py-12">
					<div className="inline-flex items-center space-x-3">
						<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<span className="text-gray-600">Memuat blog...</span>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Edit Blog">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<button
						onClick={() => router.push('/blogs')}
						className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Kembali ke Blogs
					</button>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Edit Blog
					</h2>
					<p className="text-gray-600">Edit artikel blog</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Kategori
							</label>
							<input
								type="text"
								required
								value={formData.category}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										category: e.target.value,
									}))
								}
								placeholder="Contoh: pipa"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Judul
							</label>
							<input
								type="text"
								required
								value={formData.title}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								placeholder="Judul blog"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Gambar
							</label>
							<label
								htmlFor="edit-image-upload"
								className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
									uploadingImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
								}`}
							>
								{uploadingImage ? (
									<div className="flex flex-col items-center">
										<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
										<span className="text-sm text-blue-600 font-medium">Mengupload...</span>
									</div>
								) : uploadedImage ? (
									<div className="flex flex-col items-center gap-1 px-2 text-center">
										<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-xs text-green-600 font-medium">Upload berhasil</span>
										<span className="text-xs text-gray-400 truncate max-w-xs">{uploadedImage.split('/').pop()}</span>
									</div>
								) : (
									<div className="flex flex-col items-center gap-1">
										<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<span className="text-sm text-gray-500">
											{formData.image ? 'Klik untuk ganti gambar' : 'Klik untuk upload gambar'}
										</span>
										<span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
									</div>
								)}
								<input
									id="edit-image-upload"
									ref={imageInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									disabled={uploadingImage}
									onChange={async (e) => {
										const file = e.target.files?.[0];
										if (file) {
											const url = await uploadImage(file);
											if (url) setFormData((prev) => ({ ...prev, image: url }));
										}
									}}
								/>
							</label>
							{uploadImageError && <p className="mt-1 text-xs text-red-500">{uploadImageError}</p>}
							{(uploadedImage || formData.image) && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={uploadedImage || formData.image}
									alt="Preview"
									className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-200"
								/>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Banner Image
							</label>
							<label
								htmlFor="edit-banner-upload"
								className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
									uploadingBanner ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
								}`}
							>
								{uploadingBanner ? (
									<div className="flex flex-col items-center">
										<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
										<span className="text-sm text-blue-600 font-medium">Mengupload...</span>
									</div>
								) : uploadedBanner ? (
									<div className="flex flex-col items-center gap-1 px-2 text-center">
										<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-xs text-green-600 font-medium">Upload berhasil</span>
										<span className="text-xs text-gray-400 truncate max-w-xs">{uploadedBanner.split('/').pop()}</span>
									</div>
								) : (
									<div className="flex flex-col items-center gap-1">
										<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<span className="text-sm text-gray-500">
											{formData.bannerImg ? 'Klik untuk ganti banner' : 'Klik untuk upload banner'}
										</span>
										<span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
									</div>
								)}
								<input
									id="edit-banner-upload"
									ref={bannerInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									disabled={uploadingBanner}
									onChange={async (e) => {
										const file = e.target.files?.[0];
										if (file) {
											const url = await uploadBanner(file);
											if (url) setFormData((prev) => ({ ...prev, bannerImg: url }));
										}
									}}
								/>
							</label>
							{uploadBannerError && <p className="mt-1 text-xs text-red-500">{uploadBannerError}</p>}
							{(uploadedBanner || formData.bannerImg) && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={uploadedBanner || formData.bannerImg}
									alt="Banner Preview"
									className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-200"
								/>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Deskripsi
							</label>
							<textarea
								required
								rows={3}
								value={formData.description}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Deskripsi singkat blog"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Konten
							</label>
							<TinyMCEEditor
								value={formData.content}
								onChange={(content) =>
									setFormData((prev) => ({
										...prev,
										content: content,
									}))
								}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Penulis
							</label>
							<input
								type="text"
								required
								value={formData.author}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										author: e.target.value,
									}))
								}
								placeholder="Nama penulis"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Tanggal Publikasi
							</label>
							<input
								type="date"
								required
								value={formData.publishDate}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										publishDate: e.target.value,
									}))
								}
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Tags
							</label>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddTag();
										}
									}}
									placeholder="Tambah tag"
									className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								/>
								<button
									type="button"
									onClick={handleAddTag}
									className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
								>
									Tambah
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{formData.tags?.map((tag, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="ml-2 text-blue-500 hover:text-blue-700"
										>
											×
										</button>
									</span>
								))}
							</div>
						</div>

						<div className="flex gap-4 pt-4">
							<button
								type="button"
								onClick={() => router.push('/blogs')}
								className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={loading || uploadingImage || uploadingBanner}
								className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
							>
								{loading ? 'Menyimpan...' : 'Update Blog'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</MainLayout>
	);
}
