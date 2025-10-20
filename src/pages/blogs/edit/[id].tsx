import MainLayout from '@/components/MainLayout';
import { Blog, UpdateBlogInput } from '@/types/blog';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
								URL Gambar
							</label>
							<input
								type="url"
								required
								value={formData.image}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										image: e.target.value,
									}))
								}
								placeholder="https://example.com/image.jpg"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								URL Banner Image
							</label>
							<input
								type="url"
								required
								value={formData.bannerImg}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										bannerImg: e.target.value,
									}))
								}
								placeholder="https://example.com/banner.jpg"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
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
								Konten (HTML)
							</label>
							<textarea
								required
								rows={10}
								value={formData.content}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										content: e.target.value,
									}))
								}
								placeholder="<h2>Judul Konten</h2><p>Isi konten...</p>"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
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
								disabled={loading}
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
