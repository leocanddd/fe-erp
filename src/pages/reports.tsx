import MainLayout from '@/components/MainLayout';
import {
	getUsers,
	User,
} from '@/lib/users';
import {
	formatVisitDate,
	getVisitId,
	getVisits,
	Visit,
	VisitFilters,
} from '@/lib/visits';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Reports() {
	const [visits, setVisits] = useState<
		Visit[]
	>([]);
	const [users, setUsers] = useState<
		User[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalPages, setTotalPages] =
		useState(1);
	const [totalItems, setTotalItems] =
		useState(0);
	const [
		itemsPerPage,
		setItemsPerPage,
	] = useState(10);

	const [filters, setFilters] =
		useState<VisitFilters>({
			page: 1,
			limit: 10,
			username: '',
			startDate: '',
			endDate: '',
		});

	const fetchUsers =
		useCallback(async () => {
			try {
				const response =
					await getUsers();
				if (
					response.statusCode === 200 &&
					response.data
				) {
					// Filter to only show Sales Retail users (role = 1)
					const salesRetailUsers =
						response.data.filter(
							(user) => user.role === 1
						);
					setUsers(salesRetailUsers);
				}
			} catch {
				console.error(
					'Failed to fetch users for filter'
				);
			}
		}, []);

	const fetchVisits =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getVisits(filters);
				if (
					response.statusCode === 200 &&
					response.data
				) {
					setVisits(
						response.data.visits
					);
					setCurrentPage(
						response.data.pagination
							.currentPage
					);
					setTotalPages(
						response.data.pagination
							.totalPages
					);
					setTotalItems(
						response.data.pagination
							.totalItems
					);
					setItemsPerPage(
						response.data.pagination
							.itemsPerPage
					);
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch visits'
					);
					setVisits([]);
				}
			} catch {
				setError(
					'Failed to fetch visits'
				);
				setVisits([]);
			} finally {
				setLoading(false);
			}
		}, [filters]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		fetchVisits();
	}, [fetchVisits]);

	const handleFilterChange = (
		key: keyof VisitFilters,
		value: string | number
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1), // Reset to page 1 when changing filters except pagination
		}));
	};

	const handleSearch = (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setFilters((prev) => ({
			...prev,
			page: 1,
		}));
	};

	const clearFilters = () => {
		setFilters({
			page: 1,
			limit: 10,
			username: '',
			startDate: '',
			endDate: '',
		});
	};

	const handlePageChange = (
		page: number
	) => {
		if (
			page >= 1 &&
			page <= totalPages
		) {
			handleFilterChange('page', page);
		}
	};

	const handleLimitChange = (
		limit: number
	) => {
		handleFilterChange('limit', limit);
	};

	const renderPagination = () => {
		const pages = [];
		const maxVisiblePages = 5;

		let startPage = Math.max(
			1,
			currentPage -
				Math.floor(maxVisiblePages / 2)
		);
		const endPage = Math.min(
			totalPages,
			startPage + maxVisiblePages - 1
		);

		if (
			endPage - startPage + 1 <
			maxVisiblePages
		) {
			startPage = Math.max(
				1,
				endPage - maxVisiblePages + 1
			);
		}

		for (
			let i = startPage;
			i <= endPage;
			i++
		) {
			pages.push(
				<button
					key={i}
					onClick={() =>
						handlePageChange(i)
					}
					className={`px-3 py-1 mx-1 rounded transition-colors ${
						i === currentPage
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
				>
					{i}
				</button>
			);
		}

		return (
			<div className="flex items-center justify-between mt-6">
				<div className="text-sm text-gray-600">
					Menampilkan{' '}
					{Math.min(
						(currentPage - 1) *
							itemsPerPage +
							1,
						totalItems
					)}{' '}
					-{' '}
					{Math.min(
						currentPage * itemsPerPage,
						totalItems
					)}{' '}
					dari {totalItems} kunjungan
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={() =>
							handlePageChange(
								currentPage - 1
							)
						}
						disabled={currentPage === 1}
						className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Previous
					</button>
					{pages}
					<button
						onClick={() =>
							handlePageChange(
								currentPage + 1
							)
						}
						disabled={
							currentPage === totalPages
						}
						className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Next
					</button>
				</div>
			</div>
		);
	};

	return (
		<MainLayout title="Laporan Kunjungan">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Laporan Kunjungan
					</h2>
					<p className="text-gray-600">
						Data kunjungan sales dengan
						filter dan pagination
					</p>
				</div>

				{/* Filters */}
				<div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
					<form
						onSubmit={handleSearch}
						className="space-y-4"
					>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Username
								</label>
								<select
									id="username"
									value={
										filters.username ||
										''
									}
									onChange={(e) =>
										handleFilterChange(
											'username',
											e.target.value
										)
									}
									className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								>
									<option value="">
										Semua Sales
									</option>
									{users.map((user) => (
										<option
											key={
												user._id ||
												user.id
											}
											value={
												user.username
											}
										>
											{user.firstName}
										</option>
									))}
								</select>
							</div>
							<div>
								<label
									htmlFor="startDate"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Tanggal Mulai
								</label>
								<input
									type="date"
									id="startDate"
									value={
										filters.startDate ||
										''
									}
									onChange={(e) =>
										handleFilterChange(
											'startDate',
											e.target.value
										)
									}
									className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								/>
							</div>
							<div>
								<label
									htmlFor="endDate"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Tanggal Akhir
								</label>
								<input
									type="date"
									id="endDate"
									value={
										filters.endDate ||
										''
									}
									onChange={(e) =>
										handleFilterChange(
											'endDate',
											e.target.value
										)
									}
									className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								/>
							</div>
							<div className="flex items-end space-x-2">
								<button
									type="submit"
									className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
								>
									Filter
								</button>
								<button
									type="button"
									onClick={clearFilters}
									className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
								>
									Clear
								</button>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<div>
								<label
									htmlFor="limit"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Items per page
								</label>
								<select
									id="limit"
									value={
										filters.limit || 10
									}
									onChange={(e) =>
										handleLimitChange(
											Number(
												e.target.value
											)
										)
									}
									className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value={10}>
										10
									</option>
									<option value={25}>
										25
									</option>
									<option value={50}>
										50
									</option>
									<option value={100}>
										100
									</option>
								</select>
							</div>
						</div>
					</form>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* Visits table */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat data
									kunjungan...
								</span>
							</div>
						</div>
					) : visits.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada data kunjungan
							yang ditemukan
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Sales
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Toko
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Lokasi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Waktu Kunjungan
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Deskripsi
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{visits.map(
										(visit) => (
											<tr
												key={getVisitId(
													visit
												)}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														<div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
															<span className="text-white font-semibold text-sm">
																{visit.username
																	.charAt(
																		0
																	)
																	.toUpperCase()}
															</span>
														</div>
														<div className="ml-4">
															<div className="text-sm font-medium text-gray-900">
																{
																	visit.name
																}
															</div>
															<div className="text-sm text-gray-500">
																@
																{
																	visit.username
																}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900 font-medium">
														{
															visit.store
														}
													</div>
												</td>
												<td className="px-6 py-4">
													<div
														className="text-sm text-gray-900 max-w-xs truncate"
														title={
															visit.location
														}
													>
														{
															visit.location
														}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{formatVisitDate(
															visit
														)}
													</div>
												</td>
												<td className="px-6 py-4">
													<div
														className="text-sm text-gray-900 max-w-xs truncate"
														title={
															visit.description
														}
													>
														{
															visit.description
														}
													</div>
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Pagination */}
				{!loading &&
					visits.length > 0 &&
					renderPagination()}
			</div>
		</MainLayout>
	);
}
