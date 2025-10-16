import MainLayout from '@/components/MainLayout';
import {
	getProjects,
	Project,
	ProjectFilters,
} from '@/lib/projects';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Projects() {
	const [projects, setProjects] =
		useState<Project[]>([]);
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
		useState<ProjectFilters>({
			page: 1,
			limit: 10,
			projectName: '',
		});

	const fetchProjects =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getProjects(filters);
				if (
					response.statusCode === 200 &&
					response.data
				) {
					setProjects(
						response.data.projects
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
							'Failed to fetch projects'
					);
					setProjects([]);
				}
			} catch {
				setError(
					'Failed to fetch projects'
				);
				setProjects([]);
			} finally {
				setLoading(false);
			}
		}, [filters]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleFilterChange = (
		key: keyof ProjectFilters,
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
					: 1,
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
			projectName: '',
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
					dari {totalItems} projects
				</div>
				<div className="flex items-center">
					<button
						onClick={() =>
							handlePageChange(
								currentPage - 1
							)
						}
						disabled={currentPage === 1}
						className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
						className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Next
					</button>
				</div>
			</div>
		);
	};

	return (
		<MainLayout title="Projects">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-[#000000] mb-2">
						Projects
					</h2>
					<p className="text-gray-600">
						Kelola dan pantau semua
						project
					</p>
				</div>

				{/* Filters */}
				<div className="bg-white p-6 rounded-xl shadow-md mb-6">
					<form onSubmit={handleSearch}>
						<div className="flex flex-col md:flex-row gap-4 items-end">
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Nama Project
								</label>
								<input
									type="text"
									value={
										filters.projectName
									}
									onChange={(e) =>
										handleFilterChange(
											'projectName',
											e.target.value
										)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									placeholder="Cari nama project..."
								/>
							</div>

							<div className="w-full md:w-48">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Items per page
								</label>
								<select
									value={filters.limit}
									onChange={(e) =>
										handleLimitChange(
											parseInt(
												e.target.value
											)
										)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								>
									<option value="10">
										10
									</option>
									<option value="25">
										25
									</option>
									<option value="50">
										50
									</option>
									<option value="100">
										100
									</option>
								</select>
							</div>

							<div className="flex gap-2">
								<button
									type="submit"
									className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
								>
									Search
								</button>
								<button
									type="button"
									onClick={clearFilters}
									className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
								>
									Clear
								</button>
							</div>
						</div>
					</form>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				)}

				{/* Projects Table */}
				<div className="bg-white rounded-xl shadow-md overflow-hidden">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : projects.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">
								No projects found
							</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Project Name
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Location
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												PIC
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Contact
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{projects.map(
											(project) => (
												<tr
													key={
														project.id
													}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm font-medium text-gray-900">
															{
																project.projectName
															}
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="text-sm text-gray-900">
															{
																project.location
															}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{
																project.pic
															}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{
															project.contact
														}
													</td>
												</tr>
											)
										)}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 &&
								renderPagination()}
						</>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
