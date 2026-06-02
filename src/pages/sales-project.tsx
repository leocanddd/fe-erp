import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getProjects, Project } from '@/lib/projects';

interface ProjectStats {
	totalProjects: number;
	activeProjects: number;
	totalQuotations: number;
}

interface ProjectTrend {
	date: string;
	count: number;
}

export default function SalesProjectOverview() {
	const [stats, setStats] = useState<ProjectStats>({
		totalProjects: 0,
		activeProjects: 0,
		totalQuotations: 0,
	});
	const [projectTrends, setProjectTrends] = useState<ProjectTrend[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	useEffect(() => {
		// Set default date range to last 30 days
		const end = new Date();
		const start = new Date();
		start.setDate(start.getDate() - 30);

		setEndDate(end.toISOString().split('T')[0]);
		setStartDate(start.toISOString().split('T')[0]);
	}, []);

	const fetchProjectData = useCallback(async () => {
		setLoading(true);
		try {
			// Fetch all projects
			const projectsResponse = await getProjects({ page: 1, limit: 1000 });
			const totalProjects = projectsResponse.data?.pagination.totalItems || 0;
			const allProjects = projectsResponse.data?.projects || [];

			// Filter projects within date range
			const filteredProjects = allProjects.filter((project) => {
				if (!project.createdAt) return false;
				const createdDate = new Date(project.createdAt).toISOString().split('T')[0];
				return createdDate >= startDate && createdDate <= endDate;
			});

			const activeProjects = filteredProjects.length;

			// Process project trends
			const trends = processProjectTrends(filteredProjects);

			setStats({
				totalProjects,
				activeProjects,
				totalQuotations: 0, // To be implemented with quotations API
			});

			setProjectTrends(trends);
			setError('');
		} catch (err) {
			console.error('Error fetching project data:', err);
			setError('Gagal memuat data project. Silakan coba lagi.');
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate]);

	useEffect(() => {
		if (startDate && endDate) {
			fetchProjectData();
		}
	}, [startDate, endDate, fetchProjectData]);

	const processProjectTrends = (projects: Project[]): ProjectTrend[] => {
		const trendMap = new Map<string, number>();

		projects.forEach((project) => {
			const date = new Date(project.createdAt).toISOString().split('T')[0];
			trendMap.set(date, (trendMap.get(date) || 0) + 1);
		});

		const trends: ProjectTrend[] = [];
		const endDateObj = new Date(endDate);

		for (let i = 6; i >= 0; i--) {
			const date = new Date(endDateObj);
			date.setDate(endDateObj.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			trends.push({
				date: dateStr,
				count: trendMap.get(dateStr) || 0,
			});
		}

		return trends;
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
	};

	// Use a minimum scale of 20 to make smaller values look more proportional
	const maxProjectCount = Math.max(...projectTrends.map(t => t.count), 20);

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

							{/* Date Filter */}
							<div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4">
								<div className="flex items-center gap-2">
									<label className="text-sm font-medium text-gray-700">Dari:</label>
									<input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div className="flex items-center gap-2">
									<label className="text-sm font-medium text-gray-700">Sampai:</label>
									<input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
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
							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								{/* Projects Chart */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Status Project</h3>
									<div className="flex items-center justify-center mb-6">
										<div className="relative w-48 h-48">
											<svg className="w-full h-full transform -rotate-90">
												<circle
													cx="96"
													cy="96"
													r="80"
													fill="none"
													stroke="#E5E7EB"
													strokeWidth="24"
												/>
												<circle
													cx="96"
													cy="96"
													r="80"
													fill="none"
													stroke="#3B82F6"
													strokeWidth="24"
													strokeDasharray={`${(stats.activeProjects / stats.totalProjects) * 502.4} 502.4`}
													strokeLinecap="round"
												/>
											</svg>
											<div className="absolute inset-0 flex flex-col items-center justify-center">
												<p className="text-4xl font-bold text-gray-900">
													{stats.totalProjects > 0 ? ((stats.activeProjects / stats.totalProjects) * 100).toFixed(1) : 0}%
												</p>
												<p className="text-sm text-gray-600">Project Periode Ini</p>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center">
											<p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
											<p className="text-sm text-gray-600 flex items-center justify-center gap-1">
												<span className="w-3 h-3 bg-gray-300 rounded-full"></span>
												Total Project
											</p>
										</div>
										<div className="text-center">
											<p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
											<p className="text-sm text-gray-600 flex items-center justify-center gap-1">
												<span className="w-3 h-3 bg-blue-500 rounded-full"></span>
												Project Periode Ini
											</p>
										</div>
									</div>
									<Link href="/projects" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
										Lihat detail →
									</Link>
								</div>

								{/* Other Stats */}
								<div className="grid grid-cols-1 gap-6">
									{/* Total Quotations */}
									<div className="bg-white rounded-lg shadow-md p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-600">
													Total Quotation
												</p>
												<p className="text-3xl font-bold text-gray-900 mt-2">
													{stats.totalQuotations}
												</p>
											</div>
											<div className="bg-purple-100 rounded-full p-3">
												<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
										</div>
										<Link href="/quotations" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
											Lihat quotation →
										</Link>
									</div>

									{/* Reports Link */}
									<div className="bg-white rounded-lg shadow-md p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-600">
													Laporan Project
												</p>
												<p className="text-3xl font-bold text-gray-900 mt-2">
													{stats.activeProjects}
												</p>
											</div>
											<div className="bg-orange-100 rounded-full p-3">
												<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
										</div>
										<Link href="/reports-project" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
											Lihat laporan →
										</Link>
									</div>
								</div>
							</div>

							{/* Project Trends Chart */}
							<div className="bg-white rounded-lg shadow-md p-6 mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Tren Project (7 Hari Terakhir)
								</h2>
								<div className="space-y-4">
									{projectTrends.map((trend, index) => (
										<div key={index} className="flex items-center gap-4">
											<div className="w-24 text-sm text-gray-700 font-medium text-right">
												{formatDate(trend.date)}
											</div>
											<div className="flex-1 relative group">
												<div
													className="bg-blue-500 rounded-r hover:bg-blue-600 transition-colors h-12 flex items-center justify-end pr-4"
													style={{
														width: `${(trend.count / maxProjectCount) * 100}%`,
														minWidth: trend.count > 0 ? '60px' : '4px'
													}}
												>
													<span className="text-white font-semibold text-sm">
														{trend.count}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Quick Actions */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<Link href="/reports-project" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-blue-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Laporan Project</h3>
											<p className="text-sm text-gray-600">Lihat semua laporan</p>
										</div>
									</div>
								</Link>

								<Link href="/projects" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-green-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Projects</h3>
											<p className="text-sm text-gray-600">Kelola data project</p>
										</div>
									</div>
								</Link>

								<Link href="/quotations" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-purple-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Quotation</h3>
											<p className="text-sm text-gray-600">Kelola quotation</p>
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
