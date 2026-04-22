import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getMenuPermissions } from '@/lib/navigation';
import { useUpload } from '@/hooks/useUpload';
import { useRouter } from 'next/router';
import {
	useEffect,
	useRef,
	useState,
} from 'react';

interface RockwoolindoCategory {
	id: string;
	name: string;
	type: string;
	url: string;
}

interface RockwoolindoProduct {
	id: string;
	product_thick: string;
	product_name: string;
	product_code: string;
	product_density: number;
	product_size: string;
	product_quantity: string;
	product_image: string;
	category_id: string;
	createdAt: string;
	updatedAt: string;
}

export default function RockwoolindoProducts() {
	const router = useRouter();
	const [products, setProducts] =
		useState<RockwoolindoProduct[]>([]);
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
	const [editingProduct, setEditingProduct] = useState<RockwoolindoProduct | null>(null);
	const [formData, setFormData] = useState({
		product_thick: '',
		product_name: '',
		product_code: '',
		product_density: 0,
		product_size: '',
		product_quantity: '',
		product_image: '',
		category_id: '',
	});
	const [saveLoading, setSaveLoading] = useState(false);

	const {
		upload: uploadImage,
		uploading: uploadingImage,
		uploadedUrl: uploadedImage,
		uploadError: uploadImageError,
		reset: resetUpload,
	} = useUpload();

	const imageInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchProducts();
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				'/api/rockwoolindo-categories',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}

			const data = await response.json();
			setCategories(data.data || []);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/rockwoolindo-products',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to fetch products',
				);
			}

			const data =
				await response.json();
			const productsData =
				(data.data || []).map((product: { id?: string; _id?: string; [key: string]: unknown }) => ({
					...product,
					id: product.id || product._id,
				}));

			setProducts(productsData);
			setError('');
		} catch (err) {
			console.error(err);
			setError(
				'Failed to fetch products',
			);
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (
		id: string,
	) => {
		if (
			!confirm(
				'Are you sure you want to delete this product?',
			)
		)
			return;

		setDeleteLoading(id);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/rockwoolindo-products/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to delete product',
				);
			}

			fetchProducts();
		} catch (err) {
			console.error(err);
			alert(
				'Failed to delete product',
			);
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleOpenModal = (product?: RockwoolindoProduct) => {
		if (product) {
			setEditingProduct(product);
			setFormData({
				product_thick: product.product_thick,
				product_name: product.product_name,
				product_code: product.product_code,
				product_density: product.product_density,
				product_size: product.product_size,
				product_quantity: product.product_quantity,
				product_image: product.product_image,
				category_id: product.category_id,
			});
		} else {
			setEditingProduct(null);
			setFormData({
				product_thick: '',
				product_name: '',
				product_code: '',
				product_density: 0,
				product_size: '',
				product_quantity: '',
				product_image: '',
				category_id: '',
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingProduct(null);
		setFormData({
			product_thick: '',
			product_name: '',
			product_code: '',
			product_density: 0,
			product_size: '',
			product_quantity: '',
			product_image: '',
			category_id: '',
		});
		resetUpload();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaveLoading(true);

		try {
			const token = localStorage.getItem('token');
			const url = editingProduct
				? `/api/rockwoolindo-products/${editingProduct.id}`
				: '/api/rockwoolindo-products';

			const response = await fetch(url, {
				method: editingProduct ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formData,
					product_image: uploadedImage || formData.product_image,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to save product');
			}

			handleCloseModal();
			fetchProducts();
		} catch (err) {
			console.error(err);
			alert('Failed to save product');
		} finally {
			setSaveLoading(false);
		}
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find(c => c.id === categoryId);
		return category ? category.name : categoryId;
	};

	return (
		<MainLayout title="Rockwoolindo Products">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Produk Rockwoolindo
						</h2>
						<p className="text-gray-600">
							Kelola produk Rockwoolindo
						</p>
					</div>

					<button
						onClick={() => handleOpenModal()}
						className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
					>
						+ Tambah Produk
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
									Memuat produk...
								</span>
							</div>
						</div>
					) : products.length ===
					  0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada produk
							ditemukan
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Image
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Code
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Thickness
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Density
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Size
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Quantity
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
											Category
										</th>
										<th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{products.map(
										(product) => (
											<tr
												key={product.id}
												className="hover:bg-gray-50 transition"
											>
												<td className="px-6 py-4">
													{product.product_image && (
														<img
															src={product.product_image}
															alt={product.product_name}
															className="w-16 h-16 object-cover rounded-lg"
														/>
													)}
												</td>
												<td className="px-6 py-4 font-medium text-gray-900">
													{product.product_name}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{product.product_code}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{product.product_thick}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{product.product_density}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{product.product_size}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{product.product_quantity}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{getCategoryName(product.category_id)}
												</td>
												<td className="px-6 py-4 text-right space-x-2">
													<button
														onClick={() =>
															handleOpenModal(product)
														}
														className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
													>
														Edit
													</button>
													<button
														onClick={() =>
															handleDelete(
																product.id,
															)
														}
														disabled={
															deleteLoading ===
															product.id
														}
														className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
													>
														{deleteLoading ===
														product.id
															? 'Deleting...'
															: 'Delete'}
													</button>
												</td>
											</tr>
										),
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Summary */}
				{!loading &&
					products.length > 0 && (
						<div className="mt-6 bg-white rounded-2xl p-4 shadow text-black">
							Total produk:{' '}
							<span className="font-semibold">
								{products.length}
							</span>
						</div>
					)}
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
					<div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-8">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">
							{editingProduct ? 'Edit Produk' : 'Tambah Produk'}
						</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nama Produk
									</label>
									<input
										type="text"
										value={formData.product_name}
										onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Kode Produk
									</label>
									<input
										type="text"
										value={formData.product_code}
										onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Ketebalan
									</label>
									<input
										type="text"
										value={formData.product_thick}
										onChange={(e) => setFormData({ ...formData, product_thick: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Densitas
									</label>
									<input
										type="number"
										step="0.01"
										value={formData.product_density}
										onChange={(e) => setFormData({ ...formData, product_density: parseFloat(e.target.value) })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Ukuran
									</label>
									<input
										type="text"
										value={formData.product_size}
										onChange={(e) => setFormData({ ...formData, product_size: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Kuantitas
									</label>
									<input
										type="text"
										value={formData.product_quantity}
										onChange={(e) => setFormData({ ...formData, product_quantity: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Gambar Produk
								</label>
								<label
									htmlFor="product-image-upload"
									className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
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
									) : formData.product_image ? (
										<div className="flex flex-col items-center gap-1 px-2 text-center">
											<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<span className="text-xs text-gray-600">Gambar tersimpan</span>
											<span className="text-xs text-gray-400 truncate max-w-xs">{formData.product_image.split('/').pop()}</span>
										</div>
									) : (
										<div className="flex flex-col items-center gap-1">
											<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<span className="text-sm text-gray-500">Klik untuk upload gambar</span>
											<span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
										</div>
									)}
									<input
										id="product-image-upload"
										ref={imageInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										disabled={uploadingImage}
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (file) {
												const url = await uploadImage(file);
												if (url) setFormData((prev) => ({ ...prev, product_image: url }));
											}
										}}
									/>
								</label>
								{uploadImageError && <p className="mt-1 text-xs text-red-500">{uploadImageError}</p>}
								{(uploadedImage || formData.product_image) && (
									<img
										src={uploadedImage || formData.product_image}
										alt="Preview"
										className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-200"
									/>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Kategori
								</label>
								<select
									value={formData.category_id}
									onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
									required
								>
									<option value="">Pilih Kategori</option>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</select>
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
