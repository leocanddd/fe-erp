import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/MainLayout';
import { getOrderByOrderId, Order } from '@/lib/orders';

export default function OrderDetail() {
	const router = useRouter();
	const { orderId } = router.query;
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (orderId && typeof orderId === 'string') {
			fetchOrderDetail(orderId);
		}
	}, [orderId]);

	const fetchOrderDetail = async (orderIdParam: string) => {
		setLoading(true);
		try {
			const response = await getOrderByOrderId(orderIdParam);
			if (response.statusCode === 200 && response.data) {
				setOrder(response.data);
				setError('');
			} else {
				setError(response.error || 'Pesanan tidak ditemukan');
			}
		} catch {
			setError('Gagal memuat detail pesanan');
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (order: Order) => {
		if (order.cancelled?.isActive || order.isCancelled) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
					Dibatalkan
				</span>
			);
		}
		if (order.finished?.isActive || order.isFinished) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
					Selesai
				</span>
			);
		}
		if (order.processed?.isActive || order.isProcessed) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
					Diproses
				</span>
			);
		}
		if (order.approved?.isActive || order.isApproved) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
					Disetujui
				</span>
			);
		}
		if (order.priceApproved?.isActive) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
					Harga Disetujui
				</span>
			);
		}
		if (order.rejected?.isActive || order.isRejected) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
					Ditolak
				</span>
			);
		}
		return (
			<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
				Pending
			</span>
		);
	};

	if (loading) {
		return (
			<MainLayout title="Detail Pesanan">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<div className="text-lg text-gray-600 font-medium">
							Memuat detail pesanan...
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	if (error || !order) {
		return (
			<MainLayout title="Detail Pesanan">
				<div className="max-w-4xl mx-auto">
					<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
						<div className="text-red-600 font-medium text-lg mb-2">
							{error || 'Pesanan tidak ditemukan'}
						</div>
						<button
							onClick={() => router.push('/orders')}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
						>
							Kembali ke Daftar Pesanan
						</button>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title={`Detail Pesanan ${order.orderId}`}>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Detail Pesanan {order.orderId}
						</h2>
						<p className="text-gray-600">
							Detail lengkap informasi pesanan
						</p>
					</div>
					<button
						onClick={() => router.push('/orders')}
						className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
					>
						Kembali
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Order Information */}
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">
							Informasi Pesanan
						</h3>

						<div className="space-y-4">
							<div>
								<dt className="text-sm font-medium text-gray-500">Order ID</dt>
								<dd className="text-sm font-semibold text-gray-900">{order.orderId}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Customer</dt>
								<dd className="text-sm font-semibold text-gray-900">{order.customer}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Kontak</dt>
								<dd className="text-sm font-semibold text-gray-900">{order.contact}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Tanggal Pesanan</dt>
								<dd className="text-sm font-semibold text-gray-900">
									{new Date(order.orderDate).toLocaleDateString('id-ID', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Waktu Pengiriman</dt>
								<dd className="text-sm font-semibold text-gray-900">
									{order.shipmentTime || '-'}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Total Nilai</dt>
								<dd className="text-sm font-semibold text-gray-900">
									Rp {order.totalValue.toLocaleString('id-ID')}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Status</dt>
								<dd className="mt-1">{getStatusBadge(order)}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Dibuat Oleh</dt>
								<dd className="text-sm font-semibold text-gray-900">{order.createdBy}</dd>
							</div>
							{order.username && (
								<div>
									<dt className="text-sm font-medium text-gray-500">Username</dt>
									<dd className="text-sm font-semibold text-gray-900">{order.username}</dd>
								</div>
							)}
						</div>
					</div>

					{/* Products */}
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">
							Produk
						</h3>

						<div className="space-y-4">
							{order.products.map((product, index) => (
								<div key={index} className="border border-gray-200 rounded-lg p-4">
									<div className="flex justify-between items-start">
										<div>
											<h4 className="font-medium text-gray-900">{product.product}</h4>
											<p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
										</div>
										<div className="text-right">
											<p className="font-medium text-gray-900">
												Rp {product.value.toLocaleString('id-ID')}
											</p>
											<p className="text-sm text-gray-500">per unit</p>
										</div>
									</div>
									<div className="mt-2 pt-2 border-t border-gray-100">
										<div className="flex justify-between">
											<span className="text-sm font-medium text-gray-600">Subtotal:</span>
											<span className="text-sm font-medium text-gray-900">
												Rp {(product.quantity * product.value).toLocaleString('id-ID')}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Timeline Status */}
					<div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<h3 className="text-lg font-semibold text-gray-900 mb-8">
							Timeline Status Pesanan
						</h3>

						<div className="relative">
							{/* Timeline line */}
							<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

							<div className="space-y-8">
								{/* Order Created */}
								<div className="relative flex items-start">
									<div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									</div>
									<div className="ml-6 flex-1">
										<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
											<div className="flex items-center justify-between mb-2">
												<h4 className="font-semibold text-blue-600">Pesanan Dibuat</h4>
												<span className="text-xs text-gray-500">
													{order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
												</span>
											</div>
											<p className="text-sm text-gray-600">Pesanan telah dibuat dan masuk ke sistem</p>
											<p className="text-xs text-gray-500 mt-2">Oleh: {order.createdBy}</p>
										</div>
									</div>
								</div>

								{/* Price Approved */}
								{order.priceApproved?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-indigo-600">Harga Disetujui</h4>
													<span className="text-xs text-gray-500">
														{order.priceApproved.actionAt ? new Date(order.priceApproved.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.priceApproved.description || 'Harga pesanan telah disetujui'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.priceApproved.actionBy}</p>
											</div>
										</div>
									</div>
								)}

								{/* Approved */}
								{order.approved?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-emerald-600">Pesanan Disetujui</h4>
													<span className="text-xs text-gray-500">
														{order.approved.actionAt ? new Date(order.approved.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.approved.description || 'Pesanan telah disetujui dan akan diproses'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.approved.actionBy}</p>
											</div>
										</div>
									</div>
								)}

								{/* Rejected */}
								{order.rejected?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.633 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-orange-600">Pesanan Ditolak</h4>
													<span className="text-xs text-gray-500">
														{order.rejected.actionAt ? new Date(order.rejected.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.rejected.description || 'Pesanan ditolak dan tidak dapat diproses'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.rejected.actionBy}</p>
											</div>
										</div>
									</div>
								)}

								{/* Processed */}
								{order.processed?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-blue-600">Pesanan Diproses</h4>
													<span className="text-xs text-gray-500">
														{order.processed.actionAt ? new Date(order.processed.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.processed.description || 'Pesanan sedang dalam tahap pemrosesan'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.processed.actionBy}</p>
											</div>
										</div>
									</div>
								)}

								{/* Finished */}
								{order.finished?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-green-600">Pesanan Selesai</h4>
													<span className="text-xs text-gray-500">
														{order.finished.actionAt ? new Date(order.finished.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.finished.description || 'Pesanan telah selesai dan berhasil diselesaikan'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.finished.actionBy}</p>
											</div>
										</div>
									</div>
								)}

								{/* Cancelled */}
								{order.cancelled?.isActive && (
									<div className="relative flex items-start">
										<div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</div>
										<div className="ml-6 flex-1">
											<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-semibold text-red-600">Pesanan Dibatalkan</h4>
													<span className="text-xs text-gray-500">
														{order.cancelled.actionAt ? new Date(order.cancelled.actionAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' WIB' : '-'}
													</span>
												</div>
												<p className="text-sm text-gray-600">{order.cancelled.description || 'Pesanan telah dibatalkan'}</p>
												<p className="text-xs text-gray-500 mt-2">Oleh: {order.cancelled.actionBy}</p>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* If no status updates */}
							{!order.priceApproved?.isActive && !order.processed?.isActive && !order.approved?.isActive && !order.rejected?.isActive && !order.finished?.isActive && !order.cancelled?.isActive && (
								<div className="relative flex items-start mt-8">
									<div className="flex-shrink-0 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div className="ml-6 flex-1">
										<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
											<h4 className="font-semibold text-gray-600 mb-2">Menunggu Update Status</h4>
											<p className="text-sm text-gray-600">Pesanan sedang menunggu update status lebih lanjut</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Timestamps */}
					<div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">
							Informasi Waktu
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<dt className="text-sm font-medium text-gray-500">Dibuat Pada</dt>
								<dd className="text-sm font-semibold text-gray-900">
									{order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Terakhir Diubah</dt>
								<dd className="text-sm font-semibold text-gray-900">
									{order.updatedAt ? new Date(order.updatedAt).toLocaleString('id-ID') : '-'}
								</dd>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}