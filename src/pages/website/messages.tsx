import MainLayout from '@/components/MainLayout';
import { WebMessage, WebMessagesResponse } from '@/types/webMessage';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

export default function WebMessages() {
	const router = useRouter();
	const [messages, setMessages] = useState<
		WebMessage[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	useEffect(() => {
		fetchMessages();
	}, [currentPage]);

	const fetchMessages = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/web-messages?page=${currentPage}&limit=${limit}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to fetch messages',
				);
			}

			const data: WebMessagesResponse =
				await response.json();

			setMessages(data.data || []);
			setTotalPages(data.totalPages || 1);
			setTotal(data.total || 0);
			setError('');
		} catch (err) {
			console.error(
				'Error fetching messages:',
				err,
			);
			setError(
				'Gagal memuat data pesan. Silakan coba lagi.',
			);
		} finally {
			setLoading(false);
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

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">
							Pesan Website
						</h1>
						<p className="mt-2 text-sm text-gray-600">
							Kelola pesan yang masuk dari website
						</p>
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
						<>
							<div className="bg-white shadow-md rounded-lg overflow-hidden">
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Nama
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Email
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Telepon
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Perusahaan
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Pesan
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Tanggal
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{messages.length === 0 ? (
												<tr>
													<td
														colSpan={6}
														className="px-6 py-4 text-center text-gray-500"
													>
														Tidak ada data pesan
													</td>
												</tr>
											) : (
												messages.map((message) => (
													<tr key={message._id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															{message.name}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{message.email}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{message.phone}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{message.company}
														</td>
														<td className="px-6 py-4 text-sm text-gray-500">
															<div className="max-w-xs truncate" title={message.message}>
																{message.message}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{formatDate(message.createdAt)}
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-6 flex items-center justify-between">
									<div className="text-sm text-gray-700">
										Menampilkan <span className="font-medium">{(currentPage - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(currentPage * limit, total)}</span> dari <span className="font-medium">{total}</span> pesan
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
											disabled={currentPage === 1}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Sebelumnya
										</button>
										<span className="px-4 py-2 text-sm font-medium text-gray-700">
											Halaman {currentPage} dari {totalPages}
										</span>
										<button
											onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
											disabled={currentPage === totalPages}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Selanjutnya
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
