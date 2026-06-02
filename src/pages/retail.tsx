import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getStores } from '@/lib/stores';
import { getVisits, Visit } from '@/lib/visits';

interface RetailStats {
	totalStores: number;
	totalVisits: number;
	activeStores: number;
	totalOrders: number;
}

interface VisitTrend {
	date: string;
	count: number;
}

export default function RetailOverview() {
	const [stats, setStats] = useState<RetailStats>({
		totalStores: 0,
		totalVisits: 0,
		activeStores: 0,
		totalOrders: 0,
	});
	const [visitTrends, setVisitTrends] = useState<VisitTrend[]>([]);
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

	const fetchRetailData = useCallback(async () => {
		setLoading(true);
		try {
			// Fetch stores data
			const storesResponse = await getStores(1, 1000);
			const totalStores = storesResponse.pagination?.totalItems || 0;
			const activeStores = storesResponse.data?.filter(
				(store) => store.totalVisit > 0
			).length || 0;

			// Fetch visits data with selected date range
			const visitsResponse = await getVisits({
				page: 1,
				limit: 1000,
				startDate: startDate,
				endDate: endDate,
			});

			const totalVisits = visitsResponse.data?.pagination.totalItems || 0;

			// Process visit trends
			const trends = processVisitTrends(visitsResponse.data?.visits || []);

			setStats({
				totalStores,
				totalVisits,
				activeStores,
				totalOrders: 0, // To be implemented with orders API
			});

			setVisitTrends(trends);
			setError('');
		} catch (err) {
			console.error('Error fetching retail data:', err);
			setError('Gagal memuat data retail. Silakan coba lagi.');
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate]);

	useEffect(() => {
		if (startDate && endDate) {
			fetchRetailData();
		}
	}, [startDate, endDate, fetchRetailData]);

	const processVisitTrends = (visits: Visit[]): VisitTrend[] => {
		const trendMap = new Map<string, number>();

		visits.forEach((visit) => {
			const date = new Date(visit.createdAt).toISOString().split('T')[0];
			trendMap.set(date, (trendMap.get(date) || 0) + 1);
		});

		const trends: VisitTrend[] = [];
		const endDate = new Date();

		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(endDate.getDate() - i);
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
	const maxVisitCount = Math.max(...visitTrends.map(t => t.count), 20);

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Sales Retail Overview
								</h1>
								<p className="mt-2 text-sm text-gray-600">
									Ringkasan dan statistik penjualan retail
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
								{/* Stores Chart */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Status Toko</h3>
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
													stroke="#10B981"
													strokeWidth="24"
													strokeDasharray={`${(stats.activeStores / stats.totalStores) * 502.4} 502.4`}
													strokeLinecap="round"
												/>
											</svg>
											<div className="absolute inset-0 flex flex-col items-center justify-center">
												<p className="text-4xl font-bold text-gray-900">
													{stats.totalStores > 0 ? ((stats.activeStores / stats.totalStores) * 100).toFixed(1) : 0}%
												</p>
												<p className="text-sm text-gray-600">Toko Aktif</p>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center">
											<p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
											<p className="text-sm text-gray-600 flex items-center justify-center gap-1">
												<span className="w-3 h-3 bg-gray-300 rounded-full"></span>
												Total Toko
											</p>
										</div>
										<div className="text-center">
											<p className="text-2xl font-bold text-green-600">{stats.activeStores}</p>
											<p className="text-sm text-gray-600 flex items-center justify-center gap-1">
												<span className="w-3 h-3 bg-green-500 rounded-full"></span>
												Toko Aktif
											</p>
										</div>
									</div>
									<Link href="/stores" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
										Lihat detail →
									</Link>
								</div>

								{/* Other Stats */}
								<div className="grid grid-cols-1 gap-6">
									{/* Total Visits */}
									<div className="bg-white rounded-lg shadow-md p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-600">
													Total Kunjungan
												</p>
												<p className="text-3xl font-bold text-gray-900 mt-2">
													{stats.totalVisits}
												</p>
											</div>
											<div className="bg-purple-100 rounded-full p-3">
												<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
												</svg>
											</div>
										</div>
										<Link href="/reports" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
											Lihat laporan →
										</Link>
									</div>

									{/* Total Orders */}
									<div className="bg-white rounded-lg shadow-md p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-600">
													Total Pesanan
												</p>
												<p className="text-3xl font-bold text-gray-900 mt-2">
													{stats.totalOrders}
												</p>
											</div>
											<div className="bg-orange-100 rounded-full p-3">
												<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
												</svg>
											</div>
										</div>
										<Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
											Lihat pesanan →
										</Link>
									</div>
								</div>
							</div>

							{/* Visit Trends Chart */}
							<div className="bg-white rounded-lg shadow-md p-6 mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Tren Kunjungan (7 Hari Terakhir)
								</h2>
								<div className="space-y-4">
									{visitTrends.map((trend, index) => (
										<div key={index} className="flex items-center gap-4">
											<div className="w-24 text-sm text-gray-700 font-medium text-right">
												{formatDate(trend.date)}
											</div>
											<div className="flex-1 relative group">
												<div
													className="bg-blue-500 rounded-r hover:bg-blue-600 transition-colors h-12 flex items-center justify-end pr-4"
													style={{
														width: `${(trend.count / maxVisitCount) * 100}%`,
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<Link href="/reports" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-blue-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Laporan Visit</h3>
											<p className="text-sm text-gray-600">Lihat semua kunjungan</p>
										</div>
									</div>
								</Link>

								<Link href="/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-green-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Pesanan</h3>
											<p className="text-sm text-gray-600">Kelola pesanan</p>
										</div>
									</div>
								</Link>

								<Link href="/stores" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-purple-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Toko</h3>
											<p className="text-sm text-gray-600">Kelola data toko</p>
										</div>
									</div>
								</Link>

								<Link href="/demo" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
									<div className="flex items-center space-x-3">
										<div className="bg-orange-100 rounded-lg p-2">
											<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Demo</h3>
											<p className="text-sm text-gray-600">Kelola demo produk</p>
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
