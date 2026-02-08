import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import {
	formatProjectVisitDateOnly,
	formatProjectVisitTimeOnly,
	getProjectVisitId,
	getProjectVisits,
	ProjectVisit,
	ProjectVisitFilters,
} from '@/lib/projectvisits';
import {
	getUsers,
	User,
} from '@/lib/users';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';
import * as XLSX from 'xlsx';

export default function ReportsProject() {
	const [
		projectVisits,
		setProjectVisits,
	] = useState<ProjectVisit[]>([]);
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
		useState<ProjectVisitFilters>({
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
					// Filter to only show Sales Project users (role = 2)
					const salesProjectUsers =
						response.data.filter(
							(user) => user.role === 2
						);
					setUsers(salesProjectUsers);
				}
			} catch {
				console.error(
					'Failed to fetch users for filter'
				);
			}
		}, []);

	const fetchProjectVisits =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getProjectVisits(
						filters
					);
				if (
					response.statusCode === 200 &&
					response.data
				) {
					setProjectVisits(
						response.data.projectVisits
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
							'Failed to fetch project visits'
					);
					setProjectVisits([]);
				}
			} catch {
				setError(
					'Failed to fetch project visits'
				);
				setProjectVisits([]);
			} finally {
				setLoading(false);
			}
		}, [filters]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		fetchProjectVisits();
	}, [fetchProjectVisits]);

	const handleFilterChange = (
		key: keyof ProjectVisitFilters,
		value: string | number
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			page:
				key !== 'page'
					? 1
					: typeof value === 'number'
					? value
					: 1, // Reset to page 1 when changing filters except pagination
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

	const handleExportToExcel = () => {
		// Prepare data for export
		const exportData = projectVisits.map((visit, index) => ({
			'No': index + 1,
			'Sales': visit.name.split(' ')[0],
			'Project': visit.projectName,
			'Lokasi': visit.location,
			'Tanggal': formatProjectVisitDateOnly(visit),
			'Jam': formatProjectVisitTimeOnly(visit),
			'Product': visit.product || '-',
			'Volume': visit.volume || '-',
			'Schedule Supply': visit.scheduleSupply
				? new Date(visit.scheduleSupply).toLocaleDateString('id-ID', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				})
				: '-',
			'Uraian': visit.uraian || '-',
			'Deskripsi': visit.description,
		}));

		// Create workbook and worksheet
		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Project Visits');

		// Auto-size columns
		const colWidths = [
			{ wch: 5 },  // No
			{ wch: 15 }, // Sales
			{ wch: 20 }, // Project
			{ wch: 30 }, // Lokasi
			{ wch: 12 }, // Tanggal
			{ wch: 10 }, // Jam
			{ wch: 20 }, // Product
			{ wch: 15 }, // Volume
			{ wch: 15 }, // Schedule Supply
			{ wch: 30 }, // Uraian
			{ wch: 40 }, // Deskripsi
		];
		ws['!cols'] = colWidths;

		// Generate filename with current date
		const date = new Date().toISOString().split('T')[0];
		const filename = `Laporan_Project_${date}.xlsx`;

		// Download file
		XLSX.writeFile(wb, filename);
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
					project
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
		<MainLayout title="Laporan Project">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Laporan Project
						</h2>
						<p className="text-gray-600">
							Data kunjungan project
							dengan filter dan pagination
						</p>
					</div>
					<button
						onClick={handleExportToExcel}
						disabled={projectVisits.length === 0}
						className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span>Export to Excel</span>
					</button>
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

				{/* Project Visits table */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat data kunjungan
									project...
								</span>
							</div>
						</div>
					) : projectVisits.length ===
					  0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada data kunjungan
							project yang ditemukan
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
											Project
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Lokasi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tanggal
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Jam
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Product
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Volume
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Schedule Supply
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Uraian
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Deskripsi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{projectVisits.map(
										(visit) => (
											<tr
												key={getProjectVisitId(
													visit
												)}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														<div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
															<span className="text-white font-semibold text-xs">
																{visit.name
																	.split(
																		' '
																	)[0]
																	.charAt(
																		0
																	)
																	.toUpperCase()}
															</span>
														</div>
														<div className="ml-3">
															<div className="text-sm font-medium text-gray-900">
																{
																	visit.name.split(
																		' '
																	)[0]
																}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900 font-medium">
														{
															visit.projectName
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
														{formatProjectVisitDateOnly(
															visit
														)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{formatProjectVisitTimeOnly(
															visit
														)}
													</div>
												</td>
												<td className="px-6 py-4">
													<div
														className="text-sm text-gray-900 max-w-xs truncate"
														title={
															visit.product
														}
													>
														{
															visit.product || '-'
														}
													</div>
												</td>
												<td className="px-6 py-4">
													<div
														className="text-sm text-gray-900 max-w-xs truncate"
														title={
															visit.volume
														}
													>
														{
															visit.volume || '-'
														}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{
															visit.scheduleSupply ? new Date(visit.scheduleSupply).toLocaleDateString('id-ID', {
																year: 'numeric',
																month: 'short',
																day: 'numeric',
															}) : '-'
														}
													</div>
												</td>
												<td className="px-6 py-4">
													<div
														className="text-sm text-gray-900 max-w-xs truncate"
														title={
															visit.uraian
														}
													>
														{
															visit.uraian || '-'
														}
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
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<Link
														href={`/reports-project/${getProjectVisitId(
															visit
														)}`}
														className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
														title="View details"
													>
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
															/>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
															/>
														</svg>
													</Link>
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
					projectVisits.length > 0 &&
					renderPagination()}
			</div>
		</MainLayout>
	);
}
