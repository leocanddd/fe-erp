import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { Category } from '@/lib/category';
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
	const [
		deleteLoading,
		setDeleteLoading,
	] = useState<string | null>(null);
	const [
		isSuperAdmin,
		setIsSuperAdmin,
	] = useState(false);

	useEffect(() => {
		const user = getStoredUser();
		if (user) {
			setIsSuperAdmin(user.role === 5);
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
				'Are you sure you want to delete this category?',
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
				'Failed to delete category',
			);
		} finally {
			setDeleteLoading(null);
		}
	};

	return (
		<MainLayout title="Product Categories">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Kategori Produk
						</h2>
						<p className="text-gray-600">
							Kelola kategori produk
							website
						</p>
					</div>

					<button
						onClick={() =>
							router.push(
								'/product-categories/new',
							)
						}
						className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
					>
						+ Tambah Kategori
					</button>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
						{error}
					</div>
				)}

				{/* Table */}
				<div className="bg-white rounded-3xl shadow-xl overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat kategori...
								</span>
							</div>
						</div>
					) : categories.length ===
					  0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada kategori
							ditemukan
						</div>
					) : (
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
										Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
										Key
									</th>
									<th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{categories.map(
									(cat) => (
										<tr
											key={cat.id}
											className="hover:bg-gray-50 transition"
										>
											<td className="px-6 py-4 font-medium text-gray-900">
												{cat.name}
											</td>
											<td className="px-6 py-4 text-gray-600">
												{cat.key}
											</td>
											<td className="px-6 py-4 text-right space-x-2">
												{isSuperAdmin && (
													<button
														onClick={() =>
															handleDelete(
																cat.id,
															)
														}
														disabled={
															deleteLoading ===
															cat.id
														}
														className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
													>
														{deleteLoading ===
														cat.id
															? 'Deleting...'
															: 'Delete'}
													</button>
												)}
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					)}
				</div>

				{/* Summary */}
				{!loading &&
					categories.length > 0 && (
						<div className="mt-6 bg-white rounded-2xl p-4 shadow text-black">
							Total kategori:{' '}
							<span className="font-semibold">
								{categories.length}
							</span>
						</div>
					)}
			</div>
		</MainLayout>
	);
}
