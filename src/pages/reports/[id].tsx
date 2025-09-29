import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { getVisitById, Visit, formatVisitDateOnly, formatVisitTimeOnly } from '@/lib/visits';

export default function VisitDetail() {
	const router = useRouter();
	const { id } = router.query;
	const [visit, setVisit] = useState<Visit | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (id && typeof id === 'string') {
			fetchVisitDetail(id);
		}
	}, [id]);

	const fetchVisitDetail = async (visitId: string) => {
		setLoading(true);
		try {
			const response = await getVisitById(visitId);
			if (response.statusCode === 200 && response.data) {
				setVisit(response.data);
				setError('');
			} else {
				setError(response.error || 'Failed to fetch visit details');
				setVisit(null);
			}
		} catch {
			setError('Failed to fetch visit details');
			setVisit(null);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<MainLayout title="Detail Kunjungan">
				<div className="max-w-4xl mx-auto">
					<div className="p-8 text-center">
						<div className="inline-flex items-center space-x-3">
							<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
							<span className="text-gray-600">Memuat detail kunjungan...</span>
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	if (error || !visit) {
		return (
			<MainLayout title="Detail Kunjungan">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<Link
							href="/reports"
							className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Kembali ke Laporan
						</Link>
					</div>
					<div className="bg-red-50 border border-red-200 rounded-xl p-6">
						<div className="text-red-600 font-medium">
							{error || 'Kunjungan tidak ditemukan'}
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Detail Kunjungan">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/reports"
						className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Kembali ke Laporan
					</Link>
					<h2 className="text-2xl font-bold text-gray-900">Detail Kunjungan</h2>
					<p className="text-gray-600">Informasi lengkap kunjungan sales</p>
				</div>

				{/* Visit Details */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					<div className="p-8">
						{/* Sales Info */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sales</h3>
							<div className="flex items-center space-x-4">
								<div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
									<span className="text-white font-semibold text-xl">
										{visit.username.charAt(0).toUpperCase()}
									</span>
								</div>
								<div>
									<div className="text-xl font-medium text-gray-900">{visit.name}</div>
									<div className="text-gray-500">@{visit.username}</div>
								</div>
							</div>
						</div>

						{/* Visit Details Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Left Column */}
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Toko
									</h4>
									<p className="text-lg text-gray-900">{visit.store}</p>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Tanggal Kunjungan
									</h4>
									<p className="text-lg text-gray-900">{formatVisitDateOnly(visit)}</p>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Waktu Kunjungan
									</h4>
									<p className="text-lg text-gray-900">{formatVisitTimeOnly(visit)}</p>
								</div>

								{visit.orderId && (
									<div>
										<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
											Order ID
										</h4>
										<p className="text-lg text-gray-900">{visit.orderId}</p>
									</div>
								)}
							</div>

							{/* Right Column */}
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Lokasi
									</h4>
									<p className="text-lg text-gray-900">{visit.location}</p>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Deskripsi
									</h4>
									<p className="text-lg text-gray-900">{visit.description}</p>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Dibuat pada
									</h4>
									<p className="text-gray-600">
										{new Date(visit.createdAt).toLocaleDateString('id-ID', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
										Terakhir diupdate
									</h4>
									<p className="text-gray-600">
										{new Date(visit.updatedAt).toLocaleDateString('id-ID', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}