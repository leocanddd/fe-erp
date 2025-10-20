import { useEffect, useState, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import {
	getCollectorVisits,
	CollectorVisit,
	CollectorVisitsParams,
} from '@/lib/collector-visits';

export default function Kolektor() {
	const [visits, setVisits] = useState<CollectorVisit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Pagination & Filter states
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Filter states
	const [usernameFilter, setUsernameFilter] = useState('');
	const [startDateFilter, setStartDateFilter] = useState('');
	const [endDateFilter, setEndDateFilter] = useState('');

	const fetchCollectorVisits = useCallback(async () => {
		setLoading(true);
		try {
			const params: CollectorVisitsParams = {
				page: currentPage,
				limit: itemsPerPage,
			};

			if (usernameFilter) {
				params.username = usernameFilter;
			}
			if (startDateFilter) {
				params.startDate = startDateFilter;
			}
			if (endDateFilter) {
				params.endDate = endDateFilter;
			}

			const response = await getCollectorVisits(params);

			if (response.statusCode === 200 && response.data) {
				setVisits(response.data);
				if (response.pagination) {
					setTotalPages(response.pagination.totalPages);
					setTotalItems(response.pagination.totalItems);
					setItemsPerPage(response.pagination.itemsPerPage);
				}
				setError('');
			} else {
				setError(response.error || 'Failed to fetch collector visits');
			}
		} catch {
			setError('Failed to fetch collector visits');
		} finally {
			setLoading(false);
		}
	}, [currentPage, itemsPerPage, usernameFilter, startDateFilter, endDateFilter]);

	useEffect(() => {
		fetchCollectorVisits();
	}, [fetchCollectorVisits]);

	const handleFilterSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchCollectorVisits();
	};

	const handleClearFilters = () => {
		setUsernameFilter('');
		setStartDateFilter('');
		setEndDateFilter('');
		setCurrentPage(1);
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<MainLayout>
			<div className="p-6 bg-gray-50 min-h-screen">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">Kolektor</h1>
					<p className="text-gray-600 mt-2">
						Daftar kunjungan kolektor
					</p>
				</div>

				{/* Filter Section */}
				<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Filter
					</h2>
					<form onSubmit={handleFilterSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Username
								</label>
								<input
									type="text"
									id="username"
									value={usernameFilter}
									onChange={(e) =>
										setUsernameFilter(e.target.value)
									}
									placeholder="Cari username..."
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label
									htmlFor="startDate"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Tanggal Mulai
								</label>
								<input
									type="date"
									id="startDate"
									value={startDateFilter}
									onChange={(e) =>
										setStartDateFilter(e.target.value)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label
									htmlFor="endDate"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Tanggal Akhir
								</label>
								<input
									type="date"
									id="endDate"
									value={endDateFilter}
									onChange={(e) =>
										setEndDateFilter(e.target.value)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								type="submit"
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Terapkan Filter
							</button>
							<button
								type="button"
								onClick={handleClearFilters}
								className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
							>
								Hapus Filter
							</button>
						</div>
					</form>
				</div>

				{/* Table Section */}
				<div className="bg-white rounded-xl shadow-sm overflow-hidden">
					{error && (
						<div className="p-4 bg-red-50 border-l-4 border-red-500">
							<p className="text-red-700">{error}</p>
						</div>
					)}

					{loading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												No
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Username
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Nama
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Toko
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Waktu Mulai
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Waktu Selesai
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Deskripsi
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Lokasi
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{visits.length === 0 ? (
											<tr>
												<td
													colSpan={8}
													className="px-6 py-8 text-center text-gray-500"
												>
													Tidak ada data kunjungan kolektor
												</td>
											</tr>
										) : (
											visits.map((visit, index) => (
												<tr
													key={visit.id}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-6 py-4 text-sm text-gray-900">
														{(currentPage - 1) *
															itemsPerPage +
															index +
															1}
													</td>
													<td className="px-6 py-4 text-sm font-medium text-gray-900">
														{visit.username}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900">
														{visit.name}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900">
														{visit.store}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900">
														{formatDateTime(visit.startTime)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900">
														{formatDateTime(visit.endTime)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-600">
														{visit.description || '-'}
													</td>
													<td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={visit.location}>
														{visit.location}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-600">
											Menampilkan{' '}
											{(currentPage - 1) * itemsPerPage +
												1}{' '}
											-{' '}
											{Math.min(
												currentPage * itemsPerPage,
												totalItems
											)}{' '}
											dari {totalItems} data
										</div>
										<div className="flex gap-2">
											<button
												onClick={() =>
													setCurrentPage(
														Math.max(1, currentPage - 1)
													)
												}
												disabled={currentPage === 1}
												className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											>
												Sebelumnya
											</button>
											<div className="flex gap-1">
												{Array.from(
													{ length: totalPages },
													(_, i) => i + 1
												)
													.filter(
														(page) =>
															page === 1 ||
															page === totalPages ||
															Math.abs(
																page - currentPage
															) <= 1
													)
													.map((page, index, array) => (
														<>
															{index > 0 &&
																array[index - 1] !==
																	page - 1 && (
																	<span
																		key={`ellipsis-${page}`}
																		className="px-3 py-2 text-sm text-gray-700"
																	>
																		...
																	</span>
																)}
															<button
																key={page}
																onClick={() =>
																	setCurrentPage(page)
																}
																className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
																	currentPage === page
																		? 'bg-blue-600 text-white'
																		: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
																}`}
															>
																{page}
															</button>
														</>
													))}
											</div>
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
												className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											>
												Selanjutnya
											</button>
										</div>
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
