import MainLayout from '@/components/MainLayout';
import { useCallback, useEffect, useState } from 'react';

interface ProductHistory {
	id: string;
	name: string;
	type: string;
	message: string;
	createdAt: string;
}

interface ProductHistoryResponse {
	status: string;
	statusCode: number;
	data: ProductHistory[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
	error?: string;
}

const getApiUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const getAuthHeaders = () => {
	const token = localStorage.getItem('accessToken');
	return {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

const getProductHistory = async (
	page: number = 1,
	limit: number = 10
): Promise<ProductHistoryResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		const response = await fetch(
			`${getApiUrl()}/api/product-history?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data: ProductHistoryResponse = await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			data: [],
			pagination: {
				currentPage: 1,
				totalPages: 0,
				totalItems: 0,
				itemsPerPage: limit,
			},
			error: 'Network error occurred',
		};
	}
};

export default function History() {
	const [history, setHistory] = useState<ProductHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);

	const fetchHistory = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getProductHistory(currentPage, 20);
			if (response.statusCode === 200) {
				setHistory(response.data);
				setTotalPages(response.pagination.totalPages);
				setTotalItems(response.pagination.totalItems);
				setError('');
			} else {
				setError(response.error || 'Failed to fetch history');
			}
		} catch {
			setError('Failed to fetch history');
		} finally {
			setLoading(false);
		}
	}, [currentPage]);

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'CREATE':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
						Create
					</span>
				);
			case 'UPDATE':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
						Update
					</span>
				);
			case 'ADD_TO_PALLET':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
						Add to Pallet
					</span>
				);
			case 'INCOMING':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
						Incoming
					</span>
				);
			case 'OUTGOING':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
						Outgoing
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
						{type}
					</span>
				);
		}
	};

	return (
		<MainLayout title="Product History">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Product History
					</h2>
					<p className="text-gray-600">
						View all product activity history
					</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* History Table */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Loading history...
								</span>
							</div>
						</div>
					) : !history || history.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							No history found
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												User
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Type
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Message
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Date
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{history.map((item) => (
											<tr
												key={item.id}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">
														{item.name}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{getTypeLabel(item.type)}
												</td>
												<td className="px-6 py-4">
													<div className="text-sm text-gray-900">
														{item.message}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{new Date(
															item.createdAt
														).toLocaleString('id-ID', {
															year: 'numeric',
															month: 'short',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit',
														})}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
								<div className="flex-1 flex justify-between sm:hidden">
									<button
										onClick={() =>
											setCurrentPage(
												Math.max(1, currentPage - 1)
											)
										}
										disabled={currentPage === 1}
										className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</button>
									<button
										onClick={() =>
											setCurrentPage(
												Math.min(
													totalPages,
													currentPage + 1
												)
											)
										}
										disabled={currentPage === totalPages}
										className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
								<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
									<div>
										<p className="text-sm text-gray-700">
											Showing{' '}
											<span className="font-medium">
												{(currentPage - 1) * 20 + 1}
											</span>{' '}
											to{' '}
											<span className="font-medium">
												{Math.min(
													currentPage * 20,
													totalItems
												)}
											</span>{' '}
											of{' '}
											<span className="font-medium">
												{totalItems}
											</span>{' '}
											results
										</p>
									</div>
									<div>
										<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
											<button
												onClick={() =>
													setCurrentPage(
														Math.max(
															1,
															currentPage - 1
														)
													)
												}
												disabled={currentPage === 1}
												className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Previous
											</button>
											<button
												onClick={() =>
													setCurrentPage(
														Math.min(
															totalPages,
															currentPage + 1
														)
													)
												}
												disabled={
													currentPage === totalPages
												}
												className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Next
											</button>
										</nav>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
