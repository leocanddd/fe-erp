import MainLayout from '@/components/MainLayout';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function NewProductCategory() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		key: '',
	});

	const handleSubmit = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/categories',
				{
					method: 'POST',
					headers: {
						'Content-Type':
							'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(formData),
				},
			);

			if (!response.ok) {
				const errorData =
					await response.json();
				throw new Error(
					errorData.message ||
						'Failed to create category',
				);
			}

			router.push('/product-categories');
		} catch (err: unknown) {
			console.error(
				'Error creating category:',
				err,
			);
			setError(
				err instanceof Error
					? err.message
					: 'Failed to create category',
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<MainLayout title="Tambah Kategori Baru">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8">
					<button
						onClick={() =>
							router.push(
								'/product-categories',
							)
						}
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
						Kembali ke Kategori
					</button>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Tambah Kategori Baru
					</h2>
					<p className="text-gray-600">
						Buat kategori produk baru
					</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
					>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Nama Kategori
							</label>
							<input
								type="text"
								required
								value={formData.name}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="Contoh: Elektronik"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Key
							</label>
							<input
								type="text"
								required
								value={formData.key}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										key: e.target.value,
									}))
								}
								placeholder="Contoh: elektronik"
								className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
							/>
						</div>

						<div className="flex gap-4 pt-4">
							<button
								type="button"
								onClick={() =>
									router.push(
										'/product-categories',
									)
								}
								className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
							>
								{loading
									? 'Menyimpan...'
									: 'Simpan Kategori'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</MainLayout>
	);
}
