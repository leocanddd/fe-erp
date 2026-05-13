import MainLayout from '@/components/MainLayout';
import { uploadFile } from '@/lib/upload';
import { useState } from 'react';

export default function UploadImage() {
	const [uploading, setUploading] = useState(false);
	const [uploadedUrl, setUploadedUrl] = useState<string>('');
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		setError('');
		setUploadedUrl('');
		setCopied(false);

		try {
			const response = await uploadFile(file);
			if (response.url) {
				setUploadedUrl(response.url);
			} else {
				setError(response.error || 'Gagal mengupload gambar');
			}
		} catch (err) {
			console.error('Error uploading image:', err);
			setError('Gagal mengupload gambar');
		} finally {
			setUploading(false);
		}

		// Reset input
		e.target.value = '';
	};

	const handleCopyUrl = () => {
		if (uploadedUrl) {
			navigator.clipboard.writeText(uploadedUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Upload Gambar</h1>
						<p className="mt-2 text-sm text-gray-600">
							Upload gambar dan dapatkan URL-nya
						</p>
					</div>

					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<div className="bg-white shadow-md rounded-lg p-8">
						<div className="flex flex-col items-center justify-center">
							{/* Upload Area */}
							<div className="w-full mb-6">
								<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<svg
											className="w-12 h-12 mb-4 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
										<p className="mb-2 text-sm text-gray-500">
											{uploading ? (
												<span className="font-semibold">
													Mengupload...
												</span>
											) : (
												<>
													<span className="font-semibold">
														Klik untuk upload
													</span>{' '}
													atau drag and drop
												</>
											)}
										</p>
										<p className="text-xs text-gray-500">
											PNG, JPG, GIF, WEBP (MAX. 10MB)
										</p>
									</div>
									<input
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										className="hidden"
										disabled={uploading}
									/>
								</label>
							</div>

							{/* Loading Spinner */}
							{uploading && (
								<div className="mb-6">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								</div>
							)}

							{/* Preview & URL */}
							{uploadedUrl && !uploading && (
								<div className="w-full space-y-4">
									{/* Image Preview */}
									<div className="flex justify-center">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={uploadedUrl}
											alt="Uploaded"
											className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
										/>
									</div>

									{/* URL Display and Copy */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											URL Gambar
										</label>
										<div className="flex gap-2">
											<input
												type="text"
												value={uploadedUrl}
												readOnly
												className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
											/>
											<button
												onClick={handleCopyUrl}
												className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
											>
												{copied ? (
													<span className="flex items-center gap-1">
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
																d="M5 13l4 4L19 7"
															/>
														</svg>
														Tersalin!
													</span>
												) : (
													<span className="flex items-center gap-1">
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
																d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
															/>
														</svg>
														Salin URL
													</span>
												)}
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
