import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/MainLayout';
import { getVisits, Visit } from '@/lib/visits';
import 'leaflet/dist/leaflet.css';

// Dynamically import the Map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
	loading: () => (
		<div className="h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center">
			<div className="inline-flex items-center space-x-3">
				<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
				<span className="text-gray-600">Loading map...</span>
			</div>
		</div>
	),
});

export default function UserVisitsMap() {
	const router = useRouter();
	const { username } = router.query;
	const [visits, setVisits] = useState<Visit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [mappedVisitsCount, setMappedVisitsCount] = useState<number>(0);

	const fetchTodayVisits = useCallback(async () => {
		if (!username || typeof username !== 'string') return;

		setLoading(true);
		try {
			// Get today's date in YYYY-MM-DD format
			const today = new Date().toISOString().split('T')[0];

			const response = await getVisits({
				username,
				startDate: today,
				endDate: today,
				limit: 100, // Get all visits for today
			});

			if (response.statusCode === 200 && response.data) {
				setVisits(response.data.visits || []);
				setError('');
			} else {
				setError(response.error || 'Failed to fetch visits');
				setVisits([]);
			}
		} catch {
			setError('Failed to fetch visits');
			setVisits([]);
		} finally {
			setLoading(false);
		}
	}, [username]);

	useEffect(() => {
		fetchTodayVisits();
	}, [fetchTodayVisits]);

	return (
		<MainLayout title={`Visits Map - ${username}`}>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<button
							onClick={() => router.push('/demo')}
							className="mb-3 text-blue-600 hover:text-blue-700 flex items-center space-x-2 transition-colors duration-200"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							<span>Back to Users</span>
						</button>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Today&apos;s Visits - {username}
						</h2>
						<p className="text-gray-600">
							{visits.length} visit{visits.length !== 1 ? 's' : ''} today
							{mappedVisitsCount > 0 && mappedVisitsCount < visits.length && (
								<span className="ml-2 text-amber-600">
									({mappedVisitsCount} mapped on map)
								</span>
							)}
						</p>
					</div>
					<button
						onClick={fetchTodayVisits}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 flex items-center space-x-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span>Refresh</span>
					</button>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">{error}</div>
					</div>
				)}

				{/* Map */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden p-4">
					{loading ? (
						<div className="h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">Loading visits...</span>
							</div>
						</div>
					) : visits.length === 0 ? (
						<div className="h-[600px] bg-gray-50 rounded-2xl flex items-center justify-center">
							<div className="text-center">
								<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
								</svg>
								<p className="text-gray-500 text-lg">No visits found for today</p>
							</div>
						</div>
					) : (
						<MapComponent visits={visits} onMappedCount={setMappedVisitsCount} />
					)}
				</div>

				{/* Visits List */}
				{visits.length > 0 && (
					<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Visit Details</h3>
							<div className="space-y-3">
								{visits.map((visit, index) => (
									<div
										key={visit.id}
										className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-semibold rounded-full">
														{index + 1}
													</span>
													<h4 className="text-lg font-semibold text-gray-900">{visit.store}</h4>
												</div>
												<div className="text-sm text-gray-600 space-y-1 ml-8">
													<p><span className="font-medium">Location:</span> {visit.location}</p>
													<p><span className="font-medium">Time:</span> {new Date(visit.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {visit.endTime ? new Date(visit.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}</p>
													{visit.description && (
														<p><span className="font-medium">Description:</span> {visit.description}</p>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</MainLayout>
	);
}
