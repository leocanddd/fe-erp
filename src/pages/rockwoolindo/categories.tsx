import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getMenuPermissions } from '@/lib/navigation';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

interface RockwoolindoCategory {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export default function RockwoolindoCategories() {
	const router = useRouter();
	const [categories, setCategories] =
		useState<RockwoolindoCategory[]>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [
		deleteLoading,
		setDeleteLoading,
	] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingCategory, setEditingCategory] = useState<RockwoolindoCategory | null>(null);
	const [formData, setFormData] = useState({
		name: '',
	});
	const [saveLoading, setSaveLoading] = useState(false);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/rockwoolindo-categories',
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
				`/api/rockwoolindo-categories/${id}`,
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

	const handleOpenModal = (category?: RockwoolindoCategory) => {
		if (category) {
			setEditingCategory(category);
			setFormData({
				name: category.name,
			});
		} else {
			setEditingCategory(null);
			setFormData({
				name: '',
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingCategory(null);
		setFormData({
			name: '',
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaveLoading(true);

		try {
			const token = localStorage.getItem('token');
			const url = editingCategory
				? `/api/rockwoolindo-categories/${editingCategory.id}`
				: '/api/rockwoolindo-categories';

			const response = await fetch(url, {
				method: editingCategory ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error('Failed to save category');
			}

			handleCloseModal();
			fetchCategories();
		} catch (err) {
			console.error(err);
			alert('Failed to save category');
		} finally {
			setSaveLoading(false);
		}
	};

	return (
		<MainLayout title="Rockwoolindo Categories">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Kategori Rockwoolindo
						</h2>
						<p className="text-gray-600">
							Kelola kategori produk Rockwoolindo
						</p>
					</div>

					<button
						onClick={() => handleOpenModal()}
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
											<td className="px-6 py-4 text-right space-x-2">
												<button
													onClick={() =>
														handleOpenModal(cat)
													}
													className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
												>
													Edit
												</button>
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

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">
							{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
						</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Kategori
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
									placeholder="Contoh: Atap"
									required
								/>
							</div>
							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={handleCloseModal}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
									disabled={saveLoading}
								>
									Batal
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
									disabled={saveLoading}
								>
									{saveLoading ? 'Menyimpan...' : 'Simpan'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</MainLayout>
	);
}
