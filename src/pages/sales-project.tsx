import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
	getProjectsSummary,
	ProjectSummary,
	SummaryFilters,
} from '@/lib/projects';

export default function SalesProjectOverview() {
	const [summary, setSummary] = useState<ProjectSummary>({
		totalProjects: 0,
		totalVisits: 0,
		newProjects: 0,
		projectsByStatus: [],
		projectsBySales: [],
		visitsBySales: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [filters, setFilters] = useState<SummaryFilters>({});

	useEffect(() => {
		// Set default date range to last 30 days
		const end = new Date();
		const start = new Date();
		start.setDate(start.getDate() - 30);

		setFilters({
			start_date: start.toISOString().split('T')[0],
			end_date: end.toISOString().split('T')[0],
		});
	}, []);

	const fetchSummary = useCallback(async () => {
		if (!filters.start_date || !filters.end_date) return;

		setLoading(true);
		try {
			const response = await getProjectsSummary(filters);
			if (response.statusCode === 200 && response.data) {
				setSummary(response.data);
				setError('');
			} else {
				setError(
					response.error || 'Failed to fetch project summary'
				);
			}
		} catch {
			setError('Failed to fetch project summary');
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const handleFilterChange = (
		key: keyof SummaryFilters,
		value: string
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const clearFilters = () => {
		const end = new Date();
		const start = new Date();
		start.setDate(start.getDate() - 30);

		setFilters({
			start_date: start.toISOString().split('T')[0],
			end_date: end.toISOString().split('T')[0],
			username: '',
		});
	};

	// Calculate max values for bar charts
	const maxProjectsBySales = Math.max(
		...(summary.projectsBySales || []).map((s) => s.count),
		1
	);
	const maxVisitsBySales = Math.max(
		...(summary.visitsBySales || []).map((s) => s.count),
		1
	);

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Sales Project Overview
								</h1>
								<p className="mt-2 text-sm text-gray-600">
									Ringkasan dan statistik penjualan project
								</p>
							</div>
						</div>
					</div>

					{/* Filters */}
					<div className="bg-white p-6 rounded-xl shadow-md mb-6">
						<div className="flex flex-col md:flex-row gap-4 items-end">
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Start Date
								</label>
								<input
									type="date"
									value={filters.start_date || ''}
									onChange={(e) =>
										handleFilterChange(
											'start_date',
											e.target.value
										)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									End Date
								</label>
								<input
									type="date"
									value={filters.end_date || ''}
									onChange={(e) =>
										handleFilterChange(
											'end_date',
											e.target.value
										)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Sales Person
								</label>
								<input
									type="text"
									value={filters.username || ''}
									onChange={(e) =>
										handleFilterChange(
											'username',
											e.target.value
										)
									}
									placeholder="Filter by username..."
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div className="flex gap-2">
								<button
									type="button"
									onClick={clearFilters}
									className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
								>
									Clear
								</button>
							</div>
						</div>
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
							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								{/* Total Projects */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												Total Projects
											</p>
											<p className="text-3xl font-bold text-gray-900 mt-2">
												{summary.totalProjects}
											</p>
										</div>
										<div className="bg-blue-100 rounded-full p-3">
											<svg
												className="w-8 h-8 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
												/>
											</svg>
										</div>
									</div>
								</div>

								{/* Total Visits */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												Total Visits
											</p>
											<p className="text-3xl font-bold text-gray-900 mt-2">
												{summary.totalVisits}
											</p>
										</div>
										<div className="bg-green-100 rounded-full p-3">
											<svg
												className="w-8 h-8 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
										</div>
									</div>
								</div>

								{/* New Projects */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												New Projects
											</p>
											<p className="text-3xl font-bold text-gray-900 mt-2">
												{summary.newProjects}
											</p>
										</div>
										<div className="bg-purple-100 rounded-full p-3">
											<svg
												className="w-8 h-8 text-purple-600"
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
										</div>
									</div>
								</div>
							</div>

							{/* Charts Row */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
								{/* Projects by Status */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h2 className="text-xl font-semibold text-gray-900 mb-6">
										Projects by Status
									</h2>
									{(summary.projectsByStatus || []).length === 0 ? (
										<p className="text-gray-500 text-center py-8">
											No data available
										</p>
									) : (
										<div className="space-y-4">
											{(summary.projectsByStatus || []).map(
												(status, index) => {
													const total =
														summary.totalProjects;
													const percentage =
														total > 0
															? (status.count /
																	total) *
															  100
															: 0;
													return (
														<div
															key={index}
															className="space-y-2"
														>
															<div className="flex justify-between text-sm">
																<span className="font-medium text-gray-700 capitalize">
																	{status._id ||
																		'Unknown'}
																</span>
																<span className="text-gray-600">
																	{
																		status.count
																	}{' '}
																	(
																	{percentage.toFixed(
																		1
																	)}
																	%)
																</span>
															</div>
															<div className="w-full bg-gray-200 rounded-full h-3">
																<div
																	className="bg-blue-600 h-3 rounded-full transition-all"
																	style={{
																		width: `${percentage}%`,
																	}}
																></div>
															</div>
														</div>
													);
												}
											)}
										</div>
									)}
								</div>

								{/* Projects by Sales */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h2 className="text-xl font-semibold text-gray-900 mb-6">
										Projects by Sales Person
									</h2>
									{(summary.projectsBySales || []).length === 0 ? (
										<p className="text-gray-500 text-center py-8">
											No data available
										</p>
									) : (
										<div className="space-y-3">
											{(summary.projectsBySales || []).map(
												(sales, index) => (
													<div
														key={index}
														className="flex items-center gap-3"
													>
														<div className="w-32 text-sm text-gray-700 font-medium truncate">
															{sales._id ||
																'Unknown'}
														</div>
														<div className="flex-1 relative">
															<div
																className="bg-green-500 rounded h-8 flex items-center justify-end pr-3"
																style={{
																	width: `${(sales.count / maxProjectsBySales) * 100}%`,
																	minWidth:
																		sales.count >
																		0
																			? '50px'
																			: '4px',
																}}
															>
																<span className="text-white font-semibold text-sm">
																	{
																		sales.count
																	}
																</span>
															</div>
														</div>
													</div>
												)
											)}
										</div>
									)}
								</div>
							</div>

							{/* Visits by Sales */}
							<div className="bg-white rounded-lg shadow-md p-6 mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Visits by Sales Person
								</h2>
								{(summary.visitsBySales || []).length === 0 ? (
									<p className="text-gray-500 text-center py-8">
										No data available
									</p>
								) : (
									<div className="space-y-3">
										{(summary.visitsBySales || []).map(
											(sales, index) => (
												<div
													key={index}
													className="flex items-center gap-3"
												>
													<div className="w-32 text-sm text-gray-700 font-medium truncate">
														{sales._id || 'Unknown'}
													</div>
													<div className="flex-1 relative">
														<div
															className="bg-orange-500 rounded h-8 flex items-center justify-end pr-3"
															style={{
																width: `${(sales.count / maxVisitsBySales) * 100}%`,
																minWidth:
																	sales.count > 0
																		? '50px'
																		: '4px',
															}}
														>
															<span className="text-white font-semibold text-sm">
																{sales.count}
															</span>
														</div>
													</div>
												</div>
											)
										)}
									</div>
								)}
							</div>

							{/* Quick Actions */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<Link
									href="/reports-project"
									className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
								>
									<div className="flex items-center space-x-3">
										<div className="bg-blue-100 rounded-lg p-2">
											<svg
												className="w-6 h-6 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Laporan Project
											</h3>
											<p className="text-sm text-gray-600">
												Lihat semua laporan
											</p>
										</div>
									</div>
								</Link>

								<Link
									href="/projects"
									className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
								>
									<div className="flex items-center space-x-3">
										<div className="bg-green-100 rounded-lg p-2">
											<svg
												className="w-6 h-6 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
												/>
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Projects
											</h3>
											<p className="text-sm text-gray-600">
												Kelola data project
											</p>
										</div>
									</div>
								</Link>

								<Link
									href="/quotations"
									className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
								>
									<div className="flex items-center space-x-3">
										<div className="bg-purple-100 rounded-lg p-2">
											<svg
												className="w-6 h-6 text-purple-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Quotation
											</h3>
											<p className="text-sm text-gray-600">
												Kelola quotation
											</p>
										</div>
									</div>
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
