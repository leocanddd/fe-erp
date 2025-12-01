import { getOrderByOrderId, Order } from '@/lib/orders';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function OrderPrint() {
	const router = useRouter();
	const { orderId } = router.query;
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);

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
				// Auto print after data is loaded
				setTimeout(() => {
					window.print();
				}, 500);
			}
		} catch {
			console.error('Failed to fetch order');
		} finally {
			setLoading(false);
		}
	};

	const getStatusText = (order: Order) => {
		if (order.cancelled?.isActive || order.isCancelled) {
			return 'Dibatalkan';
		}
		if (order.finished?.isActive || order.isFinished) {
			return 'Selesai';
		}
		if (order.shipment?.isActive) {
			return 'Dikirim';
		}
		if (order.processed?.isActive || order.isProcessed) {
			return 'Diproses';
		}
		if (order.approved?.isActive || order.isApproved) {
			return 'Disetujui';
		}
		if (order.priceApproved?.isActive) {
			return 'Harga Disetujui';
		}
		if (order.rejected?.isActive || order.isRejected) {
			return 'Ditolak';
		}
		return 'Pending';
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Memuat...</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Pesanan tidak ditemukan</div>
			</div>
		);
	}

	return (
		<>
			<style jsx global>{`
				@media print {
					body {
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
					.no-print {
						display: none !important;
					}
					@page {
						margin: 1cm;
					}
				}
			`}</style>

			<div className="max-w-4xl mx-auto p-8 bg-white">
				{/* Header */}
				<div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						DETAIL PESANAN
					</h1>
					<p className="text-xl font-semibold text-gray-700">
						Order ID: {order.orderId}
					</p>
				</div>

				{/* Order Information */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-2">
						Informasi Pesanan
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">Customer:</p>
							<p className="text-base font-semibold text-gray-900">
								{order.customer}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Kontak:</p>
							<p className="text-base font-semibold text-gray-900">
								{order.contact}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Tanggal Pesanan:</p>
							<p className="text-base font-semibold text-gray-900">
								{new Date(order.orderDate).toLocaleDateString('id-ID', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Waktu Pengiriman:</p>
							<p className="text-base font-semibold text-gray-900">
								{order.shipmentTime || '-'}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Status:</p>
							<p className="text-base font-semibold text-gray-900">
								{getStatusText(order)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Dibuat Oleh:</p>
							<p className="text-base font-semibold text-gray-900">
								{order.createdBy}
							</p>
						</div>
					</div>
				</div>

				{/* Products */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-2">
						Produk
					</h2>
					<table className="w-full border-collapse border border-gray-400">
						<thead>
							<tr className="bg-gray-200">
								<th className="border border-gray-400 px-4 py-2 text-left">
									No
								</th>
								<th className="border border-gray-400 px-4 py-2 text-left">
									Nama Produk
								</th>
								<th className="border border-gray-400 px-4 py-2 text-right">
									Jumlah
								</th>
								<th className="border border-gray-400 px-4 py-2 text-right">
									Harga Satuan
								</th>
								<th className="border border-gray-400 px-4 py-2 text-right">
									Subtotal
								</th>
							</tr>
						</thead>
						<tbody>
							{order.products.map((product, index) => (
								<tr key={index}>
									<td className="border border-gray-400 px-4 py-2">
										{index + 1}
									</td>
									<td className="border border-gray-400 px-4 py-2">
										{product.product}
									</td>
									<td className="border border-gray-400 px-4 py-2 text-right">
										{product.quantity}
									</td>
									<td className="border border-gray-400 px-4 py-2 text-right">
										Rp {product.value.toLocaleString('id-ID')}
									</td>
									<td className="border border-gray-400 px-4 py-2 text-right">
										Rp{' '}
										{(product.quantity * product.value).toLocaleString(
											'id-ID'
										)}
									</td>
								</tr>
							))}
							<tr className="bg-gray-100 font-bold">
								<td
									colSpan={4}
									className="border border-gray-400 px-4 py-2 text-right"
								>
									Total:
								</td>
								<td className="border border-gray-400 px-4 py-2 text-right">
									Rp {order.totalValue.toLocaleString('id-ID')}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* Description */}
				{order.description && (
					<div className="mb-8">
						<h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-2">
							Deskripsi
						</h2>
						<p className="text-base text-gray-900">{order.description}</p>
					</div>
				)}

				{/* Timeline */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-2">
						Timeline Status
					</h2>
					<div className="space-y-3">
						{/* Created */}
						<div className="flex justify-between items-start border-b border-gray-300 pb-2">
							<div>
								<p className="font-semibold text-gray-900">Pesanan Dibuat</p>
								<p className="text-sm text-gray-600">
									Oleh: {order.createdBy}
								</p>
							</div>
							<div className="text-right text-sm text-gray-600">
								{order.createdAt
									? new Date(order.createdAt).toLocaleString('id-ID', {
											timeZone: 'Asia/Jakarta',
											hour12: false,
											hour: '2-digit',
											minute: '2-digit',
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
									  }) + ' WIB'
									: '-'}
							</div>
						</div>

						{/* Price Approved */}
						{order.priceApproved?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Harga Disetujui
									</p>
									<p className="text-sm text-gray-600">
										{order.priceApproved.description ||
											'Harga pesanan telah disetujui'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.priceApproved.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.priceApproved.actionAt
										? new Date(
												order.priceApproved.actionAt
										  ).toLocaleString('id-ID', {
												timeZone: 'Asia/Jakarta',
												hour12: false,
												hour: '2-digit',
												minute: '2-digit',
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
										  }) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Approved */}
						{order.approved?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Disetujui
									</p>
									<p className="text-sm text-gray-600">
										{order.approved.description ||
											'Pesanan telah disetujui dan akan diproses'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.approved.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.approved.actionAt
										? new Date(order.approved.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Rejected */}
						{order.rejected?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Ditolak
									</p>
									<p className="text-sm text-gray-600">
										{order.rejected.description ||
											'Pesanan ditolak dan tidak dapat diproses'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.rejected.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.rejected.actionAt
										? new Date(order.rejected.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Processed */}
						{order.processed?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Diproses
									</p>
									<p className="text-sm text-gray-600">
										{order.processed.description ||
											'Pesanan sedang dalam tahap pemrosesan'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.processed.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.processed.actionAt
										? new Date(order.processed.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Shipment */}
						{order.shipment?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Dikirim
									</p>
									<p className="text-sm text-gray-600">
										{order.shipment.description ||
											'Pesanan telah dikirim ke alamat tujuan'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.shipment.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.shipment.actionAt
										? new Date(order.shipment.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Finished */}
						{order.finished?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Selesai
									</p>
									<p className="text-sm text-gray-600">
										{order.finished.description ||
											'Pesanan telah selesai dan berhasil diselesaikan'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.finished.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.finished.actionAt
										? new Date(order.finished.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}

						{/* Cancelled */}
						{order.cancelled?.isActive && (
							<div className="flex justify-between items-start border-b border-gray-300 pb-2">
								<div>
									<p className="font-semibold text-gray-900">
										Pesanan Dibatalkan
									</p>
									<p className="text-sm text-gray-600">
										{order.cancelled.description ||
											'Pesanan telah dibatalkan'}
									</p>
									<p className="text-sm text-gray-600">
										Oleh: {order.cancelled.actionBy}
									</p>
								</div>
								<div className="text-right text-sm text-gray-600">
									{order.cancelled.actionAt
										? new Date(order.cancelled.actionAt).toLocaleString(
												'id-ID',
												{
													timeZone: 'Asia/Jakarta',
													hour12: false,
													hour: '2-digit',
													minute: '2-digit',
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
												}
										  ) + ' WIB'
										: '-'}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 pt-4 border-t-2 border-gray-800 text-center text-sm text-gray-600">
					<p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
				</div>

				{/* Print Button - Hidden on print */}
				<div className="no-print mt-8 text-center">
					<button
						onClick={() => window.print()}
						className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mr-4"
					>
						Print / Save as PDF
					</button>
					<button
						onClick={() => window.close()}
						className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</>
	);
}
