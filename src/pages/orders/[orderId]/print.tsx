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
						margin: 0;
						padding: 0;
					}
					.no-print {
						display: none !important;
					}
					@page {
						size: A4;
						margin: 0.5cm;
					}
					.print-container {
						width: 100%;
						height: 100vh;
						display: flex;
						flex-direction: column;
						gap: 0.5cm;
					}
					.print-copy {
						flex: 1;
						display: flex;
						flex-direction: column;
						page-break-after: avoid;
						page-break-inside: avoid;
						border: 1px solid #ddd;
						padding: 0.3cm;
						box-sizing: border-box;
					}
					.print-copy h1 {
						font-size: 16px !important;
						margin-bottom: 4px !important;
					}
					.print-copy h2 {
						font-size: 12px !important;
						margin-bottom: 6px !important;
						margin-top: 8px !important;
					}
					.print-copy p,
					.print-copy td,
					.print-copy th {
						font-size: 9px !important;
						margin: 2px 0 !important;
						padding: 2px 4px !important;
					}
					.print-copy .text-3xl {
						font-size: 16px !important;
					}
					.print-copy .text-xl {
						font-size: 12px !important;
					}
					.print-copy .text-base {
						font-size: 9px !important;
					}
					.print-copy .text-sm {
						font-size: 8px !important;
					}
					.print-copy .mb-8 {
						margin-bottom: 8px !important;
					}
					.print-copy .mb-4 {
						margin-bottom: 4px !important;
					}
					.print-copy .pb-4 {
						padding-bottom: 4px !important;
					}
					.print-copy .pb-2 {
						padding-bottom: 2px !important;
					}
				}
				@media screen {
					.print-container {
						max-width: 210mm;
						margin: 0 auto;
						padding: 1cm;
					}
				}
			`}</style>

			<div className="print-container">
				{/* First Copy */}
				<div className="print-copy">
					{renderOrderContent(order)}
				</div>

				{/* Second Copy */}
				<div className="print-copy">
					{renderOrderContent(order)}
				</div>
			</div>

			{/* Print Button - Hidden on print */}
			<div className="no-print mt-8 text-center pb-8">
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
		</>
	);

	function renderOrderContent(order: Order) {
		return (
			<div className="bg-white">
				{/* Header */}
				<div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
					<h1 className="text-3xl font-bold text-gray-900">
						#{order.orderId}
					</h1>
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
			</div>
		);
	}
}
