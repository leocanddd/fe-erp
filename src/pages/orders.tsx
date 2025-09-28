import {
	createOrder,
	deleteOrder,
	getOrders,
	Order,
	OrderProduct,
	updateOrder,
} from '@/lib/orders';
import { getStoredUser } from '@/lib/auth';
import { useEffect, useState, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

export default function Orders() {
	const [orders, setOrders] = useState<
		Order[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [search, setSearch] =
		useState('');
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalPages, setTotalPages] =
		useState(0);
	const [totalItems, setTotalItems] =
		useState(0);
	const [
		showDeleteModal,
		setShowDeleteModal,
	] = useState(false);
	const [
		orderToDelete,
		setOrderToDelete,
	] = useState<Order | null>(null);
	const [
		showAddModal,
		setShowAddModal,
	] = useState(false);
	const [
		showEditModal,
		setShowEditModal,
	] = useState(false);
	const [
		editingOrder,
		setEditingOrder,
	] = useState<Order | null>(null);
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);
	const [formData, setFormData] =
		useState({
			customer: '',
			contact: '',
			orderDate: '',
			shipmentTime: '',
			products: [
				{
					product: '',
					quantity: 1,
					value: 0,
				},
			] as OrderProduct[],
		});

	const [user, setUser] = useState<User | null>(null);
	const [showDescModal, setShowDescModal] = useState(false);
	const [descModalType, setDescModalType] = useState<'isProcessed' | 'isFinished' | 'isCancelled' | 'isApproved' | 'isRejected' | 'isPriceApproved' | 'isShipment' | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [description, setDescription] = useState('');

	useEffect(() => {
		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
		}
	}, []);

	const fetchOrders = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getOrders(
				currentPage,
				10,
				search
			);
			if (response.statusCode === 200) {
				setOrders(response.data || []);
				setTotalPages(
					response.pagination.totalPages
				);
				setTotalItems(
					response.pagination.totalItems
				);
				setError('');
			} else {
				setError(
					response.error ||
						'Failed to fetch orders'
				);
			}
		} catch {
			setError(
				'Failed to fetch orders'
			);
		} finally {
			setLoading(false);
		}
	}, [currentPage, search]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleSearch = (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchOrders();
	};

	// const handleDelete = async (
	//	order: Order
	// ) => {
	//	setOrderToDelete(order);
	//	setShowDeleteModal(true);
	// };

	const confirmDelete = async () => {
		if (!orderToDelete) return;

		try {
			const response =
				await deleteOrder(
					orderToDelete.id!
				);
			if (response.statusCode === 200) {
				fetchOrders();
				setShowDeleteModal(false);
				setOrderToDelete(null);
			} else {
				setError(
					response.error ||
						'Failed to delete order'
				);
			}
		} catch {
			setError(
				'Failed to delete order'
			);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			| HTMLInputElement
			| HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleProductChange = (
		index: number,
		field: keyof OrderProduct,
		value: string | number
	) => {
		const updatedProducts = [
			...formData.products,
		];
		updatedProducts[index] = {
			...updatedProducts[index],
			[field]: value,
		};
		setFormData((prev) => ({
			...prev,
			products: updatedProducts,
		}));
	};

	const addProduct = () => {
		setFormData((prev) => ({
			...prev,
			products: [
				...prev.products,
				{
					product: '',
					quantity: 1,
					value: 0,
				},
			],
		}));
	};

	const removeProduct = (
		index: number
	) => {
		if (formData.products.length > 1) {
			const updatedProducts =
				formData.products.filter(
					(_, i) => i !== index
				);
			setFormData((prev) => ({
				...prev,
				products: updatedProducts,
			}));
		}
	};

	const resetForm = () => {
		setFormData({
			customer: '',
			contact: '',
			orderDate: '',
			shipmentTime: '',
			products: [
				{
					product: '',
					quantity: 1,
					value: 0,
				},
			],
		});
	};

	const handleAddOrder = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const orderData = {
				customer:
					formData.customer.trim(),
				contact:
					formData.contact.trim(),
				orderDate: formData.orderDate,
				shipmentTime:
					formData.shipmentTime,
				products: formData.products.map(
					(p) => ({
						product: p.product.trim(),
						quantity: Number(
							p.quantity
						),
						value: Number(p.value),
					})
				),
				createdBy: user!.username,
			};

			const response =
				await createOrder(orderData);
			if (response.statusCode === 201) {
				fetchOrders();
				setShowAddModal(false);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal menambah pesanan'
				);
			}
		} catch {
			setError(
				'Gagal menambah pesanan'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// const handleEdit = (order: Order) => {
	//	setEditingOrder(order);
	//	setFormData({
	//		customer: order.customer,
	//		contact: order.contact,
	//		orderDate:
	//			order.orderDate.split('T')[0], // Convert to YYYY-MM-DD format
	//		shipmentTime: order.shipmentTime,
	//		products: order.products,
	//	});
	//	setShowEditModal(true);
	// };

	const handleUpdateOrder = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		if (!editingOrder) return;

		setIsSubmitting(true);
		setError('');

		try {
			const orderData = {
				customer:
					formData.customer.trim(),
				contact:
					formData.contact.trim(),
				orderDate: formData.orderDate,
				shipmentTime:
					formData.shipmentTime,
				products: formData.products.map(
					(p) => ({
						product: p.product.trim(),
						quantity: Number(
							p.quantity
						),
						value: Number(p.value),
					})
				),
				createdBy: user!.username,
			};

			const response =
				await updateOrder(
					editingOrder.id!,
					orderData
				);
			if (response.statusCode === 200) {
				fetchOrders();
				setShowEditModal(false);
				setEditingOrder(null);
				resetForm();
			} else {
				setError(
					response.error ||
						'Gagal mengubah pesanan'
				);
			}
		} catch {
			setError(
				'Gagal mengubah pesanan'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleOrderStatus = (
		order: Order,
		field:
			| 'isProcessed'
			| 'isFinished'
			| 'isCancelled'
			| 'isApproved'
			| 'isRejected'
			| 'isPriceApproved'
			| 'isShipment'
	) => {
		setSelectedOrder(order);
		setDescModalType(field);
		setDescription('');
		setShowDescModal(true);
	};

	const handleDescriptionSubmit = async () => {
		if (!selectedOrder || !descModalType || !user) return;

		try {
			const currentUserName = `${user.firstName} ${user.lastName}`;

			const getStatusField = (type: string) => {
				switch (type) {
					case 'isProcessed': return 'processed';
					case 'isFinished': return 'finished';
					case 'isCancelled': return 'cancelled';
					case 'isApproved': return 'approved';
					case 'isRejected': return 'rejected';
					case 'isPriceApproved': return 'priceApproved';
					case 'isShipment': return 'shipment';
					default: return '';
				}
			};

			const statusField = getStatusField(descModalType);
			const currentStatus = selectedOrder[statusField as keyof Order] as { isActive?: boolean };
			const isCurrentlyActive = currentStatus?.isActive || selectedOrder[descModalType as keyof Order];

			const updateData = {
				customer: selectedOrder.customer,
				contact: selectedOrder.contact,
				products: selectedOrder.products,
				orderDate: selectedOrder.orderDate,
				shipmentTime: selectedOrder.shipmentTime,
				createdBy: selectedOrder.createdBy,
				[statusField]: {
					isActive: !isCurrentlyActive,
					description: description,
					actionBy: currentUserName
				}
			};

			const response = await updateOrder(selectedOrder.id!, updateData);
			if (response.statusCode === 200) {
				setShowDescModal(false);
				setSelectedOrder(null);
				setDescModalType(null);
				setDescription('');
				fetchOrders();
			} else {
				setError(
					response.error ||
						'Gagal mengubah status pesanan'
				);
			}
		} catch {
			setError(
				'Gagal mengubah status pesanan'
			);
		}
	};

	const getStatusBadge = (
		order: Order
	) => {
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
		if (order.shipment?.isActive) {
			return (
				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
					Dikirim
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


	return (
		<MainLayout title="Pesanan">
					<div className="max-w-7xl mx-auto">
						{/* Header with search and add button */}
						<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									Pesanan
								</h2>
								<p className="text-gray-600">
									Kelola pesanan dan
									status pengiriman
								</p>
							</div>
							<div className="mt-4 sm:mt-0">
								<button
									onClick={() =>
										setShowAddModal(
											true
										)
									}
									className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
								>
									Tambah Pesanan
								</button>
							</div>
						</div>

						{/* Search */}
						<div className="mb-6">
							<form
								onSubmit={handleSearch}
								className="flex gap-4"
							>
								<div className="flex-1">
									<input
										type="text"
										value={search}
										onChange={(e) =>
											setSearch(
												e.target.value
											)
										}
										placeholder="Cari pesanan berdasarkan nama customer..."
										className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									/>
								</div>
								<button
									type="submit"
									className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
								>
									Cari
								</button>
							</form>
						</div>

						{error && (
							<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="text-sm text-red-600 font-medium">
									{error}
								</div>
							</div>
						)}

						{/* Orders table */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							{loading ? (
								<div className="p-8 text-center">
									<div className="inline-flex items-center space-x-3">
										<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
										<span className="text-gray-600">
											Memuat pesanan...
										</span>
									</div>
								</div>
							) : orders.length ===
							  0 ? (
								<div className="p-8 text-center text-gray-500">
									Tidak ada pesanan yang
									ditemukan
								</div>
							) : (
								<>
									<div className="overflow-x-auto">
										<table className="min-w-full">
											<thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
												<tr>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Order ID
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Total Value
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Tanggal
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Produk
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Sales
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Status
													</th>
													<th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Detail
													</th>
													<th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-100">
												{orders.map(
													(order) => (
														<tr
															key={
																order.id
															}
															className="hover:bg-blue-50/50 transition-colors duration-200"
														>
															<td className="px-6 py-4 whitespace-nowrap">
																<div className="text-sm font-semibold text-gray-900">
																	{order.orderId || 'N/A'}
																</div>
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<div className="text-sm font-semibold text-gray-900">
																	Rp {order.totalValue.toLocaleString('id-ID')}
																</div>
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<div className="text-sm text-gray-900">
																	{new Date(
																		order.orderDate
																	).toLocaleDateString(
																		'id-ID'
																	)}
																</div>
																{order.shipmentTime && (
																	<div className="text-xs text-gray-500">
																		{order.shipmentTime}
																	</div>
																)}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<div className="text-sm text-gray-900">
																	{order?.products?.length || 0} item{(order?.products?.length || 0) !== 1 ? '' : ''}
																</div>
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<div className="text-sm text-gray-900">
																	{order.createdBy}
																</div>
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																{getStatusBadge(
																	order
																)}
															</td>
															{/* Detail Column */}
															<td className="px-6 py-4 whitespace-nowrap text-center">
																<button
																	onClick={() => window.location.href = `/orders/${order.orderId}`}
																	className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors duration-200"
																	title="Lihat detail pesanan"
																>
																	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
																	</svg>
																</button>
															</td>

															{/* Actions Column */}
															<td className="px-6 py-4 whitespace-nowrap text-center">
																<div className="flex items-center justify-center space-x-2">
																	{/* Price Approval Button - Role 7 (Pricing) */}
																	{user?.role === 7 && !order.priceApproved?.isActive && !(order.cancelled?.isActive || order.isCancelled) && !(order.finished?.isActive || order.isFinished) && (
																		<button
																			onClick={() =>
																				toggleOrderStatus(
																					order,
																					'isPriceApproved'
																				)
																			}
																			className="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
																		>
																			Setujui Harga
																		</button>
																	)}

																	{/* General Approval Buttons - Role 6 (Approver) */}
																	{user?.role === 6 && order.priceApproved?.isActive && !(order.approved?.isActive || order.isApproved) && !(order.rejected?.isActive || order.isRejected) && !(order.cancelled?.isActive || order.isCancelled) && !(order.finished?.isActive || order.isFinished) && (
																		<>
																			<button
																				onClick={() =>
																					toggleOrderStatus(
																						order,
																						'isApproved'
																					)
																				}
																				className="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
																			>
																				Setujui
																			</button>
																			<button
																				onClick={() =>
																					toggleOrderStatus(
																						order,
																						'isRejected'
																					)
																				}
																				className="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 bg-orange-100 text-orange-700 hover:bg-orange-200"
																			>
																				Tolak
																			</button>
																		</>
																	)}

																	{/* Processing Buttons - Role 3 (Admin) */}
																	{user?.role === 3 && (order.approved?.isActive || order.isApproved) && !(order.cancelled?.isActive || order.isCancelled) && !(order.finished?.isActive || order.isFinished) && (
																		<button
																			onClick={() =>
																				toggleOrderStatus(
																					order,
																					'isProcessed'
																				)
																			}
																			className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 ${
																				(order.processed?.isActive || order.isProcessed)
																					? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
																					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
																			}`}
																		>
																			{(order.processed?.isActive || order.isProcessed) ? 'Batal Proses' : 'Proses'}
																		</button>
																	)}

																	{/* Shipment and Finish Buttons - Role 8 (Gudang) */}
																	{user?.role === 8 && (order.approved?.isActive || order.isApproved) && !(order.cancelled?.isActive || order.isCancelled) && !(order.finished?.isActive || order.isFinished) && (
																		<>
																			{!order.shipment?.isActive ? (
																				<button
																					onClick={() =>
																						toggleOrderStatus(
																							order,
																							'isShipment'
																						)
																					}
																					className="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
																				>
																					Kirim
																				</button>
																			) : (
																				<button
																					onClick={() =>
																						toggleOrderStatus(
																							order,
																							'isFinished'
																						)
																					}
																					className="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 bg-green-100 text-green-700 hover:bg-green-200"
																				>
																					Selesai
																				</button>
																			)}
																		</>
																	)}

																	{/* Cancel Button - Available to all roles when appropriate */}
																	{!(order.finished?.isActive || order.isFinished) && (
																		<button
																			onClick={() =>
																				toggleOrderStatus(
																					order,
																					'isCancelled'
																				)
																			}
																			className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 ${
																				(order.cancelled?.isActive || order.isCancelled)
																					? 'bg-red-100 text-red-700 hover:bg-red-200'
																					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
																			}`}
																		>
																			{(order.cancelled?.isActive || order.isCancelled) ? 'Batal Pembatalan' : 'Batalkan'}
																		</button>
																	)}
																</div>
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									</div>

									{/* Pagination */}
									<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
										<div className="flex-1 flex justify-between sm:hidden">
											<button
												onClick={() =>
													setCurrentPage(
														Math.max(
															1,
															currentPage -
																1
														)
													)
												}
												disabled={
													currentPage ===
													1
												}
												className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Sebelumnya
											</button>
											<button
												onClick={() =>
													setCurrentPage(
														Math.min(
															totalPages,
															currentPage +
																1
														)
													)
												}
												disabled={
													currentPage ===
													totalPages
												}
												className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Berikutnya
											</button>
										</div>
										<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
											<div>
												<p className="text-sm text-gray-700">
													Menampilkan{' '}
													<span className="font-medium">
														{(currentPage -
															1) *
															10 +
															1}
													</span>{' '}
													sampai{' '}
													<span className="font-medium">
														{Math.min(
															currentPage *
																10,
															totalItems
														)}
													</span>{' '}
													dari{' '}
													<span className="font-medium">
														{totalItems}
													</span>{' '}
													hasil
												</p>
											</div>
											<div>
												<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
													<button
														onClick={() =>
															setCurrentPage(
																Math.max(
																	1,
																	currentPage -
																		1
																)
															)
														}
														disabled={
															currentPage ===
															1
														}
														className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														Sebelumnya
													</button>
													<button
														onClick={() =>
															setCurrentPage(
																Math.min(
																	totalPages,
																	currentPage +
																		1
																)
															)
														}
														disabled={
															currentPage ===
															totalPages
														}
														className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														Berikutnya
													</button>
												</nav>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

			{/* Add Order Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowAddModal(false);
								resetForm();
								setError('');
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
							<form
								onSubmit={
									handleAddOrder
								}
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
									<div className="sm:flex sm:items-start">
										<div className="w-full">
											<div className="flex items-center justify-between mb-6">
												<h3 className="text-2xl font-bold text-gray-900">
													Tambah Pesanan
													Baru
												</h3>
												<button
													type="button"
													onClick={() => {
														setShowAddModal(
															false
														);
														resetForm();
														setError(
															''
														);
													}}
													className="text-gray-400 hover:text-gray-600 transition-colors"
												>
													<svg
														className="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={
																2
															}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>

											{error && (
												<div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
													<div className="text-sm text-red-600 font-medium">
														{error}
													</div>
												</div>
											)}

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div>
													<label
														htmlFor="customer"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Nama
														Customer *
													</label>
													<input
														type="text"
														id="customer"
														name="customer"
														required
														value={
															formData.customer
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nama customer"
													/>
												</div>

												<div>
													<label
														htmlFor="contact"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Kontak *
													</label>
													<input
														type="text"
														id="contact"
														name="contact"
														required
														value={
															formData.contact
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Masukkan nomor telepon/email"
													/>
												</div>

												<div>
													<label
														htmlFor="orderDate"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Tanggal
														Pesanan *
													</label>
													<input
														type="date"
														id="orderDate"
														name="orderDate"
														required
														value={
															formData.orderDate
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
													/>
												</div>

												<div>
													<label
														htmlFor="shipmentTime"
														className="block text-sm font-semibold text-gray-700 mb-2"
													>
														Waktu
														Pengiriman *
													</label>
													<input
														type="text"
														id="shipmentTime"
														name="shipmentTime"
														required
														value={
															formData.shipmentTime
														}
														onChange={
															handleInputChange
														}
														className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														placeholder="Contoh: 08:00-10:00"
													/>
												</div>
											</div>

											{/* Products Section */}
											<div className="mt-8">
												<div className="flex items-center justify-between mb-4">
													<h4 className="text-lg font-semibold text-gray-900">
														Produk
													</h4>
													<button
														type="button"
														onClick={
															addProduct
														}
														className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
													>
														Tambah
														Produk
													</button>
												</div>

												{formData.products.map(
													(
														product,
														index
													) => (
														<div
															key={
																index
															}
															className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-2xl"
														>
															<div className="md:col-span-2">
																<label className="block text-sm font-medium text-gray-700 mb-1">
																	Nama
																	Produk
																	*
																</label>
																<input
																	type="text"
																	required
																	value={
																		product.product
																	}
																	onChange={(
																		e
																	) =>
																		handleProductChange(
																			index,
																			'product',
																			e
																				.target
																				.value
																		)
																	}
																	className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	placeholder="Masukkan nama produk"
																/>
															</div>
															<div>
																<label className="block text-sm font-medium text-gray-700 mb-1">
																	Jumlah
																	*
																</label>
																<input
																	type="number"
																	required
																	min="1"
																	value={
																		product.quantity
																	}
																	onChange={(
																		e
																	) =>
																		handleProductChange(
																			index,
																			'quantity',
																			parseInt(
																				e
																					.target
																					.value
																			)
																		)
																	}
																	className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																/>
															</div>
															<div className="flex items-end">
																<div className="flex-1">
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		Harga
																		(Rp)
																		*
																	</label>
																	<input
																		type="number"
																		required
																		min="0"
																		step="0.01"
																		value={
																			product.value
																		}
																		onChange={(
																			e
																		) =>
																			handleProductChange(
																				index,
																				'value',
																				parseFloat(
																					e
																						.target
																						.value
																				)
																			)
																		}
																		className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	/>
																</div>
																{formData
																	.products
																	.length >
																	1 && (
																	<button
																		type="button"
																		onClick={() =>
																			removeProduct(
																				index
																			)
																		}
																		className="ml-2 p-2 text-red-600 hover:text-red-800"
																		title="Hapus produk"
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
																				strokeWidth={
																					2
																				}
																				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																			/>
																		</svg>
																	</button>
																)}
															</div>
														</div>
													)
												)}
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
									<button
										type="submit"
										disabled={
											isSubmitting
										}
										className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Menyimpan...
											</div>
										) : (
											'Simpan Pesanan'
										)}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowAddModal(
												false
											);
											resetForm();
											setError('');
										}}
										className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
									>
										Batal
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Order Modal */}
			{showEditModal &&
				editingOrder && (
					<div className="fixed inset-0 z-[60] overflow-y-auto">
						<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div
								className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
								onClick={() => {
									setShowEditModal(
										false
									);
									setEditingOrder(null);
									resetForm();
									setError('');
								}}
							></div>
							<div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
								<form
									onSubmit={
										handleUpdateOrder
									}
								>
									<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
										<div className="sm:flex sm:items-start">
											<div className="w-full">
												<div className="flex items-center justify-between mb-6">
													<h3 className="text-2xl font-bold text-gray-900">
														Edit Pesanan
													</h3>
													<button
														type="button"
														onClick={() => {
															setShowEditModal(
																false
															);
															setEditingOrder(
																null
															);
															resetForm();
															setError(
																''
															);
														}}
														className="text-gray-400 hover:text-gray-600 transition-colors"
													>
														<svg
															className="w-6 h-6"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={
																	2
																}
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>

												{error && (
													<div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
														<div className="text-sm text-red-600 font-medium">
															{error}
														</div>
													</div>
												)}

												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<div>
														<label
															htmlFor="edit-customer"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Nama
															Customer *
														</label>
														<input
															type="text"
															id="edit-customer"
															name="customer"
															required
															value={
																formData.customer
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan nama customer"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-contact"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Kontak *
														</label>
														<input
															type="text"
															id="edit-contact"
															name="contact"
															required
															value={
																formData.contact
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Masukkan nomor telepon/email"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-orderDate"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Tanggal
															Pesanan *
														</label>
														<input
															type="date"
															id="edit-orderDate"
															name="orderDate"
															required
															value={
																formData.orderDate
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
														/>
													</div>

													<div>
														<label
															htmlFor="edit-shipmentTime"
															className="block text-sm font-semibold text-gray-700 mb-2"
														>
															Waktu
															Pengiriman
															*
														</label>
														<input
															type="text"
															id="edit-shipmentTime"
															name="shipmentTime"
															required
															value={
																formData.shipmentTime
															}
															onChange={
																handleInputChange
															}
															className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
															placeholder="Contoh: 08:00-10:00"
														/>
													</div>
												</div>

												{/* Products Section */}
												<div className="mt-8">
													<div className="flex items-center justify-between mb-4">
														<h4 className="text-lg font-semibold text-gray-900">
															Produk
														</h4>
														<button
															type="button"
															onClick={
																addProduct
															}
															className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
														>
															Tambah
															Produk
														</button>
													</div>

													{formData.products.map(
														(
															product,
															index
														) => (
															<div
																key={
																	index
																}
																className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-2xl"
															>
																<div className="md:col-span-2">
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		Nama
																		Produk
																		*
																	</label>
																	<input
																		type="text"
																		required
																		value={
																			product.product
																		}
																		onChange={(
																			e
																		) =>
																			handleProductChange(
																				index,
																				'product',
																				e
																					.target
																					.value
																			)
																		}
																		className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																		placeholder="Masukkan nama produk"
																	/>
																</div>
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		Jumlah
																		*
																	</label>
																	<input
																		type="number"
																		required
																		min="1"
																		value={
																			product.quantity
																		}
																		onChange={(
																			e
																		) =>
																			handleProductChange(
																				index,
																				'quantity',
																				parseInt(
																					e
																						.target
																						.value
																				)
																			)
																		}
																		className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																	/>
																</div>
																<div className="flex items-end">
																	<div className="flex-1">
																		<label className="block text-sm font-medium text-gray-700 mb-1">
																			Harga
																			(Rp)
																			*
																		</label>
																		<input
																			type="number"
																			required
																			min="0"
																			step="0.01"
																			value={
																				product.value
																			}
																			onChange={(
																				e
																			) =>
																				handleProductChange(
																					index,
																					'value',
																					parseFloat(
																						e
																							.target
																							.value
																					)
																				)
																			}
																			className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
																		/>
																	</div>
																	{formData
																		.products
																		.length >
																		1 && (
																		<button
																			type="button"
																			onClick={() =>
																				removeProduct(
																					index
																				)
																			}
																			className="ml-2 p-2 text-red-600 hover:text-red-800"
																			title="Hapus produk"
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
																					strokeWidth={
																						2
																					}
																					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																				/>
																			</svg>
																		</button>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										</div>
									</div>
									<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
										<button
											type="submit"
											disabled={
												isSubmitting
											}
											className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
										>
											{isSubmitting ? (
												<div className="flex items-center">
													<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
													Menyimpan...
												</div>
											) : (
												'Simpan Perubahan'
											)}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowEditModal(
													false
												);
												setEditingOrder(
													null
												);
												resetForm();
												setError('');
											}}
											className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
										>
											Batal
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

			{/* Delete confirmation modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowDeleteModal(
									false
								);
								setOrderToDelete(null);
							}}
						></div>
						<div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
										<svg
											className="h-6 w-6 text-red-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
										<h3 className="text-lg leading-6 font-medium text-gray-900">
											Hapus Pesanan
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Apakah Anda
												yakin ingin
												menghapus
												pesanan dari &quot;
												{
													orderToDelete?.customer
												}
												&quot;? Tindakan ini
												tidak dapat
												dibatalkan.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={
										confirmDelete
									}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Hapus
								</button>
								<button
									onClick={() => {
										setShowDeleteModal(
											false
										);
										setOrderToDelete(
											null
										);
									}}
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Batal
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Description Modal */}
			{showDescModal && selectedOrder && descModalType && (
				<div className="fixed inset-0 z-[60] overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							onClick={() => {
								setShowDescModal(false);
								setSelectedOrder(null);
								setDescModalType(null);
								setDescription('');
							}}
						></div>
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen">
							&#8203;
						</span>
						<div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
										<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
											{descModalType === 'isProcessed' && 'Proses Pesanan'}
											{descModalType === 'isFinished' && 'Selesaikan Pesanan'}
											{descModalType === 'isCancelled' && 'Batalkan Pesanan'}
											{descModalType === 'isApproved' && 'Setujui Pesanan'}
											{descModalType === 'isRejected' && 'Tolak Pesanan'}
											{descModalType === 'isPriceApproved' && 'Setujui Harga'}
											{descModalType === 'isShipment' && 'Kirim Pesanan'}
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500 mb-4">
												Berikan deskripsi untuk tindakan ini:
											</p>
											<textarea
												value={description}
												onChange={(e) => setDescription(e.target.value)}
												placeholder="Masukkan deskripsi..."
												rows={4}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={handleDescriptionSubmit}
									disabled={!description.trim()}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{descModalType === 'isProcessed' && ((selectedOrder.processed?.isActive || selectedOrder.isProcessed) ? 'Batalkan Proses' : 'Proses')}
									{descModalType === 'isFinished' && ((selectedOrder.finished?.isActive || selectedOrder.isFinished) ? 'Batalkan Selesai' : 'Selesaikan')}
									{descModalType === 'isCancelled' && ((selectedOrder.cancelled?.isActive || selectedOrder.isCancelled) ? 'Batalkan Pembatalan' : 'Batalkan')}
									{descModalType === 'isApproved' && 'Setujui'}
									{descModalType === 'isRejected' && 'Tolak'}
									{descModalType === 'isPriceApproved' && 'Setujui Harga'}
									{descModalType === 'isShipment' && (selectedOrder.shipment?.isActive ? 'Batalkan Pengiriman' : 'Kirim')}
								</button>
								<button
									onClick={() => {
										setShowDescModal(false);
										setSelectedOrder(null);
										setDescModalType(null);
										setDescription('');
									}}
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Batal
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</MainLayout>
	);
}
