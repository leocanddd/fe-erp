import MainLayout from '@/components/MainLayout';
import { useUpload } from '@/hooks/useUpload';
import { Category } from '@/lib/category';
import { uploadFile } from '@/lib/upload';
import {
	getWebProduct,
	updateWebProduct,
	WebProduct,
	WebProductSpecifications,
	WebProductVariant,
} from '@/lib/web-products';
import { useRouter } from 'next/router';
import {
	useEffect,
	useRef,
	useState,
} from 'react';

export default function WebProductDetail() {
	const router = useRouter();
	const { id } = router.query;

	const [product, setProduct] =
		useState<WebProduct | null>(null);
	const [loading, setLoading] =
		useState(true);
	const [saving, setSaving] =
		useState(false);
	const [error, setError] =
		useState('');
	const [success, setSuccess] =
		useState('');

	// Form state
	const [displayName, setDisplayName] =
		useState('');
	const [subtitle, setSubtitle] =
		useState('');
	const [description, setDescription] =
		useState('');
	const [category, setCategory] =
		useState('');
	const [brand, setBrand] =
		useState('');
	const [price, setPrice] =
		useState('');
	const [variants, setVariants] =
		useState<WebProductVariant[]>([]);
	const [
		variantUploading,
		setVariantUploading,
	] = useState<Record<number, boolean>>(
		{},
	);
	const [specifications, setSpecifications] =
		useState<WebProductSpecifications>({
			berat: '',
			tinggi: '',
			lebar: '',
			panjang: '',
		});

	const [categories, setCategories] =
		useState<Category[]>([]);

	const {
		upload,
		uploading,
		uploadedUrl,
		uploadError,
		reset: resetUpload,
	} = useUpload();
	const imageInputRef =
		useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!id) return;
		fetchProduct();
		fetchCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchCategories = async () => {
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
			if (response.ok) {
				const data =
					await response.json();
				setCategories(data.data || []);
			}
		} catch {
			// silently fail — category dropdown just stays empty
		}
	};

	const fetchProduct = async () => {
		setLoading(true);
		try {
			const res = await getWebProduct(
				id as string,
			);
			if (
				res.statusCode === 200 &&
				res.data
			) {
				const p = res.data;
				setProduct(p);
				setDisplayName(
					p.displayName || '',
				);
				setSubtitle(p.subtitle || '');
				setDescription(
					p.description || '',
				);
				setCategory(p.category || '');
				setBrand(p.brand || '');
				setPrice(
					p.price?.toString() || '',
				);
				setVariants(
					(p.variants || []).map(
						(v) => ({
							...v,
							image: v.image || '',
						}),
					),
				);
				setSpecifications({
					berat:
						p.specifications?.berat || '',
					tinggi:
						p.specifications?.tinggi || '',
					lebar:
						p.specifications?.lebar || '',
					panjang:
						p.specifications?.panjang || '',
				});
			} else {
				setError(
					res.error ||
						'Gagal memuat produk',
				);
			}
		} catch {
			setError('Gagal memuat produk');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		if (!product) return;
		setSaving(true);
		setError('');
		setSuccess('');

		try {
			const res =
				await updateWebProduct(
					product.id,
					{
						displayName:
							displayName.trim(),
						subtitle: subtitle.trim(),
						description:
							description.trim(),
						category: category.trim(),
						brand: brand.trim(),
						price: price
							? parseFloat(price)
							: undefined,
						image:
							uploadedUrl ||
							product.image ||
							undefined,
						variants,
						specifications: {
							berat:
								specifications.berat?.trim() ||
								undefined,
							tinggi:
								specifications.tinggi?.trim() ||
								undefined,
							lebar:
								specifications.lebar?.trim() ||
								undefined,
							panjang:
								specifications.panjang?.trim() ||
								undefined,
						},
					},
				);

			if (res.statusCode === 200) {
				setSuccess(
					'Produk berhasil diperbarui',
				);
				setTimeout(
					() => setSuccess(''),
					3000,
				);
				setProduct((prev) =>
					prev
						? {
								...prev,
								displayName,
								subtitle,
								description,
								category,
								brand,
								price: price
									? parseFloat(price)
									: prev.price,
								image:
									uploadedUrl ||
									prev.image,
								variants,
							}
						: prev,
				);
				resetUpload();
				if (imageInputRef.current)
					imageInputRef.current.value =
						'';
			} else {
				setError(
					res.error ||
						'Gagal menyimpan perubahan',
				);
			}
		} catch {
			setError(
				'Gagal menyimpan perubahan',
			);
		} finally {
			setSaving(false);
		}
	};

	// Variant helpers
	const addVariant = () =>
		setVariants((prev) => [
			...prev,
			{
				name: '',
				description: '',
				image: '',
				price: 0,
			},
		]);

	const updateVariant = (
		idx: number,
		field: keyof WebProductVariant,
		value: string | number,
	) =>
		setVariants((prev) =>
			prev.map((v, i) =>
				i === idx
					? { ...v, [field]: value }
					: v,
			),
		);

	const removeVariant = (idx: number) =>
		setVariants((prev) =>
			prev.filter((_, i) => i !== idx),
		);

	const uploadVariantImage = async (
		idx: number,
		file: File,
	) => {
		setVariantUploading((prev) => ({
			...prev,
			[idx]: true,
		}));
		try {
			const data =
				await uploadFile(file);
			if (data.url) {
				updateVariant(
					idx,
					'image',
					data.url,
				);
			}
		} catch {
			// silently fail
		} finally {
			setVariantUploading((prev) => ({
				...prev,
				[idx]: false,
			}));
		}
	};

	if (loading) {
		return (
			<MainLayout title="Produk Web">
				<div className="flex items-center justify-center py-12">
					<div className="inline-flex items-center space-x-3">
						<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<span className="text-gray-600">
							Memuat produk...
						</span>
					</div>
				</div>
			</MainLayout>
		);
	}

	if (!product) {
		return (
			<MainLayout title="Produk Web">
				<div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
					Produk tidak ditemukan.
				</div>
			</MainLayout>
		);
	}

	const previewImage =
		uploadedUrl || product.image;

	return (
		<MainLayout
			title={`Edit — ${product.displayName || product.name}`}
		>
			<div className="max-w-3xl mx-auto">
				{/* Back */}
				<button
					onClick={() =>
						router.push('/web-products')
					}
					className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
					Kembali ke Produk Web
				</button>

				{/* Read-only info banner */}
				<div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-4 text-sm">
					<div>
						<span className="text-gray-500">
							Nama Produk (ERP):{' '}
						</span>
						<span className="font-semibold text-gray-800">
							{product.name}
						</span>
					</div>
				</div>

				{error && (
					<div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
						<p className="text-sm text-red-600 font-medium">
							{error}
						</p>
					</div>
				)}

				<form
					onSubmit={handleSave}
					className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 space-y-6"
				>
					<h2 className="text-xl font-bold text-gray-900">
						Edit Produk Web
					</h2>

					{/* Display Name */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Display Name
						</label>
						<input
							type="text"
							value={displayName}
							onChange={(e) =>
								setDisplayName(
									e.target.value,
								)
							}
							placeholder="Nama yang tampil di website"
							className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
						/>
					</div>

					{/* Subtitle */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Subtitle
						</label>
						<input
							type="text"
							value={subtitle}
							onChange={(e) =>
								setSubtitle(
									e.target.value,
								)
							}
							placeholder="Tagline singkat produk"
							className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Deskripsi
						</label>
						<textarea
							rows={4}
							value={description}
							onChange={(e) =>
								setDescription(
									e.target.value,
								)
							}
							placeholder="Deskripsi lengkap produk"
							className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
						/>
					</div>

					{/* Category + Brand */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Kategori
							</label>
							<select
								value={category}
								onChange={(e) =>
									setCategory(
										e.target.value,
									)
								}
								className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
							>
								<option value="">
									-- Pilih Kategori --
								</option>
								{categories.map(
									(cat) => (
										<option
											key={cat.id}
											value={cat.key}
										>
											{cat.name}
										</option>
									),
								)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Brand
							</label>
							<input
								type="text"
								value={brand}
								onChange={(e) =>
									setBrand(
										e.target.value,
									)
								}
								placeholder="e.g. Wavin"
								className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
							/>
						</div>
					</div>

					{/* Price */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Harga (Rp)
						</label>
						<input
							type="number"
							min="0"
							step="0.01"
							value={price}
							onChange={(e) =>
								setPrice(e.target.value)
							}
							placeholder="Harga produk"
							className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
						/>
					</div>

					{/* Image upload */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Gambar Produk
						</label>
						<label
							htmlFor="wp-image-upload"
							className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ${
								uploading
									? 'border-blue-300 bg-blue-50'
									: 'border-gray-300 bg-gray-50 hover:bg-gray-100'
							}`}
						>
							{uploading ? (
								<div className="flex flex-col items-center">
									<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
									<span className="text-sm text-blue-600 font-medium">
										Mengupload...
									</span>
								</div>
							) : uploadedUrl ? (
								<div className="flex flex-col items-center gap-1 px-2 text-center">
									<svg
										className="w-5 h-5 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									<span className="text-xs text-green-600 font-medium">
										Upload berhasil
									</span>
									<span className="text-xs text-gray-400 truncate max-w-xs">
										{uploadedUrl
											.split('/')
											.pop()}
									</span>
								</div>
							) : (
								<div className="flex flex-col items-center gap-1">
									<svg
										className="w-6 h-6 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<span className="text-sm text-gray-500">
										{product.image
											? 'Klik untuk ganti gambar'
											: 'Klik untuk upload gambar'}
									</span>
									<span className="text-xs text-gray-400">
										PNG, JPG, WEBP
									</span>
								</div>
							)}
							<input
								id="wp-image-upload"
								ref={imageInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								disabled={uploading}
								onChange={async (e) => {
									const file =
										e.target.files?.[0];
									if (file)
										await upload(file);
								}}
							/>
						</label>
						{uploadError && (
							<p className="mt-1 text-xs text-red-500">
								{uploadError}
							</p>
						)}
						{previewImage && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={previewImage}
								alt="Preview"
								className="mt-3 w-full h-48 object-cover rounded-2xl border border-gray-200"
							/>
						)}
					</div>

					{/* Specifications */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-3">
							Spesifikasi
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									Berat
								</label>
								<input
									type="text"
									value={
										specifications.berat
									}
									onChange={(e) =>
										setSpecifications(
											(prev) => ({
												...prev,
												berat: e.target
													.value,
											}),
										)
									}
									placeholder="e.g. 500g"
									className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									Tinggi
								</label>
								<input
									type="text"
									value={
										specifications.tinggi
									}
									onChange={(e) =>
										setSpecifications(
											(prev) => ({
												...prev,
												tinggi: e.target
													.value,
											}),
										)
									}
									placeholder="e.g. 20cm"
									className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									Lebar
								</label>
								<input
									type="text"
									value={
										specifications.lebar
									}
									onChange={(e) =>
										setSpecifications(
											(prev) => ({
												...prev,
												lebar: e.target
													.value,
											}),
										)
									}
									placeholder="e.g. 10cm"
									className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									Panjang
								</label>
								<input
									type="text"
									value={
										specifications.panjang
									}
									onChange={(e) =>
										setSpecifications(
											(prev) => ({
												...prev,
												panjang: e.target
													.value,
											}),
										)
									}
									placeholder="e.g. 15cm"
									className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
								/>
							</div>
						</div>
					</div>

					{/* Variants */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-semibold text-gray-700">
								Varian
							</label>
							<button
								type="button"
								onClick={addVariant}
								className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Tambah Varian
							</button>
						</div>

						{variants.length === 0 && (
							<p className="text-sm text-gray-400 italic">
								Belum ada varian. Klik
								&quot;Tambah
								Varian&quot; untuk
								menambahkan.
							</p>
						)}

						<div className="space-y-4">
							{variants.map(
								(v, idx) => (
									<div
										key={idx}
										className="bg-gray-50 rounded-2xl p-4 space-y-3"
									>
										<div className="flex items-center justify-between">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
												Varian {idx + 1}
											</span>
											<button
												type="button"
												onClick={() =>
													removeVariant(
														idx,
													)
												}
												className="text-red-400 hover:text-red-600 p-1 transition-colors"
											>
												<svg
													className="w-4 h-4"
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

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<input
												type="text"
												value={v.name}
												onChange={(e) =>
													updateVariant(
														idx,
														'name',
														e.target
															.value,
													)
												}
												placeholder="Nama varian (e.g. 1/2 inch)"
												className="px-3 py-2 bg-white border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
											/>
											<input
												type="text"
												value={
													v.description
												}
												onChange={(e) =>
													updateVariant(
														idx,
														'description',
														e.target
															.value,
													)
												}
												placeholder="Deskripsi varian"
												className="px-3 py-2 bg-white border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
											/>
											<input
												type="number"
												min="0"
												step="0.01"
												value={v.price || ''}
												onChange={(e) =>
													updateVariant(
														idx,
														'price',
														parseFloat(e.target.value) || 0,
													)
												}
												placeholder="Harga varian (Rp)"
												className="px-3 py-2 bg-white border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
											/>
										</div>

										{/* Variant image */}
										<div>
											<label
												htmlFor={`variant-img-${idx}`}
												className={`flex items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
													variantUploading[
														idx
													]
														? 'border-blue-300 bg-blue-50'
														: 'border-gray-200 bg-white hover:bg-gray-50'
												}`}
											>
												{variantUploading[
													idx
												] ? (
													<div className="flex items-center gap-2">
														<div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
														<span className="text-xs text-blue-600 font-medium">
															Mengupload...
														</span>
													</div>
												) : v.image ? (
													<div className="flex items-center gap-2 px-2">
														<svg
															className="w-4 h-4 text-green-500 flex-shrink-0"
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
																d="M5 13l4 4L19 7"
															/>
														</svg>
														<span className="text-xs text-gray-500 truncate">
															{v.image
																.split(
																	'/',
																)
																.pop()}
														</span>
														<span className="text-xs text-blue-500 flex-shrink-0">
															Ganti
														</span>
													</div>
												) : (
													<div className="flex items-center gap-2">
														<svg
															className="w-4 h-4 text-gray-400"
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
																d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
															/>
														</svg>
														<span className="text-xs text-gray-500">
															Upload
															gambar
															varian
														</span>
													</div>
												)}
												<input
													id={`variant-img-${idx}`}
													type="file"
													accept="image/*"
													className="hidden"
													disabled={
														variantUploading[
															idx
														]
													}
													onChange={async (
														e,
													) => {
														const file =
															e.target
																.files?.[0];
														if (file)
															await uploadVariantImage(
																idx,
																file,
															);
													}}
												/>
											</label>
											{v.image && (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={v.image}
													alt={`Varian ${idx + 1}`}
													className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-200"
												/>
											)}
										</div>
									</div>
								),
							)}
						</div>
					</div>

					{/* Submit */}
					<div className="flex gap-4 pt-2">
						<button
							type="button"
							onClick={() =>
								router.push(
									'/web-products',
								)
							}
							className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 font-medium transition-colors"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={
								saving ||
								uploading ||
								Object.values(
									variantUploading,
								).some(Boolean)
							}
							className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
						>
							{saving ? (
								<span className="flex items-center justify-center gap-2">
									<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Menyimpan...
								</span>
							) : (
								'Simpan Perubahan'
							)}
						</button>
					</div>
				</form>
			</div>

			{/* Success toast */}
			{success && (
				<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
					<svg
						className="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					{success}
				</div>
			)}
		</MainLayout>
	);
}
