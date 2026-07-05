import MainLayout from '@/components/MainLayout';
import {
	createPO,
	getPOs,
	updatePOStatus,
	SALESPEOPLE,
	type CreatePORequest,
	type PerSales,
	type PO,
	type POItem,
	type SalespersonUsername,
	type UpdatePOStatusRequest,
	type ValueSummary,
} from '@/lib/po';
import { getCollectors, type Assignee } from '@/lib/kolektor';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

const STATUS_LABEL = {
	processing: 'Processing',
	delivered: 'Delivered',
	cancelled: 'Cancelled',
};

const formatRupiah = (
	n: number,
): string => {
	return (
		'Rp ' + n.toLocaleString('id-ID')
	);
};

// Substatus options based on status
const SUBSTATUS_OPTIONS = {
	processing: [
		'PO Confirmed',
		'In Production',
		'Out for Delivery',
	],
	delivered: [
		'Delivered — Signed',
		'Delivered',
	],
	cancelled: [
		'Cancelled by Client',
		'Cancelled — Stock',
	],
};

// Status Edit Form Component
function StatusEditForm({
	po,
	onSave,
	onCancel,
	updating
}: {
	po: PO;
	onSave: (data: UpdatePOStatusRequest) => void;
	onCancel: () => void;
	updating: boolean;
}) {
	const [status, setStatus] = useState<'processing' | 'delivered' | 'cancelled'>(po.status);
	const [substatus, setSubstatus] = useState(po.substatus);
	const [collector, setCollector] = useState('');
	const [collectors, setCollectors] = useState<Assignee[]>([]);
	const [loadingCollectors, setLoadingCollectors] = useState(false);

	// Fetch collectors when status is delivered
	useEffect(() => {
		if (status === 'delivered') {
			setLoadingCollectors(true);
			getCollectors()
				.then((response) => {
					if (response.status === 'success' && response.data) {
						setCollectors(response.data);
					}
				})
				.catch((err) => console.error('Error fetching collectors:', err))
				.finally(() => setLoadingCollectors(false));
		}
	}, [status]);

	const handleStatusChange = (newStatus: 'processing' | 'delivered' | 'cancelled') => {
		setStatus(newStatus);
		setSubstatus(SUBSTATUS_OPTIONS[newStatus][0]);
		// Reset collector when changing away from delivered
		if (newStatus !== 'delivered') {
			setCollector('');
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const data: UpdatePOStatusRequest = { status, substatus };
		// Include collector if status is delivered and collector is selected
		if (status === 'delivered' && collector) {
			data.collector = collector;
		}
		onSave(data);
	};

	return (
		<form onSubmit={handleSubmit} className="status-edit-form">
			<div className="status-edit-field">
				<label>Status</label>
				<select value={status} onChange={(e) => handleStatusChange(e.target.value as 'processing' | 'delivered' | 'cancelled')} disabled={updating}>
					<option value="processing">Processing</option>
					<option value="delivered">Delivered</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
			<div className="status-edit-field">
				<label>Substatus</label>
				<select value={substatus} onChange={(e) => setSubstatus(e.target.value)} disabled={updating}>
					{SUBSTATUS_OPTIONS[status].map((option) => (
						<option key={option} value={option}>{option}</option>
					))}
				</select>
			</div>

			{/* Show collector dropdown when status is delivered */}
			{status === 'delivered' && (
				<div className="status-edit-field">
					<label>Assign Collector {!collector && <span style={{color: '#fe2c23'}}>*</span>}</label>
					{loadingCollectors ? (
						<div style={{ padding: '8px 12px', color: '#9a9a9a', fontSize: '13px' }}>Loading collectors...</div>
					) : (
						<select
							value={collector}
							onChange={(e) => setCollector(e.target.value)}
							disabled={updating}
							required={status === 'delivered'}
						>
							<option value="">Select a collector</option>
							{collectors.map((c) => (
								<option key={c.username || c.name} value={c.username}>
									{c.name}
								</option>
							))}
						</select>
					)}
				</div>
			)}

			<div className="status-edit-actions">
				<button type="button" onClick={onCancel} disabled={updating} className="btn-cancel-status">
					Cancel
				</button>
				<button type="submit" disabled={updating} className="btn-save-status">
					{updating ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	);
}

// Create PO Modal Component
function CreatePOModal({
	onClose,
	onSubmit,
	creating,
}: {
	onClose: () => void;
	onSubmit: (
		data: CreatePORequest,
	) => void;
	creating: boolean;
}) {
	// Internal state uses YYYY-MM-DD format for date inputs
	const [dateISO, setDateISO] =
		useState('');
	const [deliveryISO, setDeliveryISO] =
		useState('');
	const [
		deliveryFullISO,
		setDeliveryFullISO,
	] = useState('');

	const [formData, setFormData] =
		useState<CreatePORequest>({
			client: '',
			project: '',
			date: '',
			delivery: '',
			value: 0,
			username: 'tonosutono',
			status: 'processing',
			substatus: 'PO Confirmed',
			addr: '',
			dateAdded: new Date()
				.toISOString()
				.split('T')[0]
				.replace(/-/g, '/'),
			deliveryFull: '',
			top: '30d',
			items: [
				{
					name: '',
					qty: 1,
					unit: 0,
					total: 0,
				},
			],
			total: 0,
		});

	// Convert YYYY-MM-DD to DD/MM/YYYY
	const convertToDDMMYYYY = (
		isoDate: string,
	): string => {
		if (!isoDate) return '';
		const [year, month, day] =
			isoDate.split('-');
		return `${day}/${month}/${year}`;
	};

	// Convert YYYY-MM-DD to YYYY/MM/DD
	const convertToYYYYMMDD = (
		isoDate: string,
	): string => {
		if (!isoDate) return '';
		return isoDate.replace(/-/g, '/');
	};

	// Update substatus when status changes
	const handleStatusChange = (
		newStatus:
			| 'processing'
			| 'delivered'
			| 'cancelled',
	) => {
		setFormData({
			...formData,
			status: newStatus,
			substatus:
				SUBSTATUS_OPTIONS[newStatus][0], // Set to first option of new status
		});
	};

	// Handle date changes
	const handleDateChange = (
		isoDate: string,
	) => {
		setDateISO(isoDate);
		setFormData({
			...formData,
			date: convertToDDMMYYYY(isoDate),
		});
	};

	const handleDeliveryChange = (
		isoDate: string,
	) => {
		setDeliveryISO(isoDate);
		setFormData({
			...formData,
			delivery:
				convertToDDMMYYYY(isoDate),
		});
	};

	const handleDeliveryFullChange = (
		isoDate: string,
	) => {
		setDeliveryFullISO(isoDate);
		setFormData({
			...formData,
			deliveryFull:
				convertToYYYYMMDD(isoDate),
		});
	};

	const handleItemChange = (
		index: number,
		field: keyof POItem,
		value: string | number,
	) => {
		const newItems = [
			...formData.items,
		];
		newItems[index] = {
			...newItems[index],
			[field]: value,
		};

		// Auto-calculate total for this item
		if (
			field === 'qty' ||
			field === 'unit'
		) {
			newItems[index].total =
				newItems[index].qty *
				newItems[index].unit;
		}

		// Calculate overall total
		const total = newItems.reduce(
			(sum, item) => sum + item.total,
			0,
		);

		setFormData({
			...formData,
			items: newItems,
			total,
			value: total,
		});
	};

	const addItem = () => {
		setFormData({
			...formData,
			items: [
				...formData.items,
				{
					name: '',
					qty: 1,
					unit: 0,
					total: 0,
				},
			],
		});
	};

	const removeItem = (
		index: number,
	) => {
		if (formData.items.length > 1) {
			const newItems =
				formData.items.filter(
					(_, i) => i !== index,
				);
			const total = newItems.reduce(
				(sum, item) => sum + item.total,
				0,
			);
			setFormData({
				...formData,
				items: newItems,
				total,
				value: total,
			});
		}
	};

	const handleSubmit = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<div
			className="modal-overlay"
			onClick={onClose}
		>
			<div
				className="modal-content"
				onClick={(e) =>
					e.stopPropagation()
				}
			>
				<div className="modal-header">
					<h2>Create New PO</h2>
					<button
						onClick={onClose}
						className="modal-close"
					>
						&times;
					</button>
				</div>
				<form
					onSubmit={handleSubmit}
					className="modal-form"
				>
					<div className="form-grid">
						<div className="form-group">
							<label>Client *</label>
							<input
								type="text"
								value={formData.client}
								onChange={(e) =>
									setFormData({
										...formData,
										client:
											e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>Project *</label>
							<input
								type="text"
								value={formData.project}
								onChange={(e) =>
									setFormData({
										...formData,
										project:
											e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>
								Salesperson *
							</label>
							<select
								value={
									formData.username
								}
								onChange={(e) =>
									setFormData({
										...formData,
										username:
											e.target.value,
									})
								}
								required
							>
								{Object.entries(
									SALESPEOPLE,
								).map(
									([
										username,
										displayName,
									]) => (
										<option
											key={username}
											value={username}
										>
											{displayName}
										</option>
									),
								)}
							</select>
						</div>
						<div className="form-group">
							<label>PO Date *</label>
							<input
								type="date"
								value={dateISO}
								onChange={(e) =>
									handleDateChange(
										e.target.value,
									)
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>
								Delivery Date *
							</label>
							<input
								type="date"
								value={deliveryISO}
								onChange={(e) =>
									handleDeliveryChange(
										e.target.value,
									)
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>
								Delivery Full *
							</label>
							<input
								type="date"
								value={deliveryFullISO}
								onChange={(e) =>
									handleDeliveryFullChange(
										e.target.value,
									)
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>
								Terms of Payment *
							</label>
							<select
								value={formData.top}
								onChange={(e) =>
									setFormData({
										...formData,
										top: e.target.value,
									})
								}
								required
							>
								<option value="30d">
									30 Days
								</option>
								<option value="45d">
									45 Days
								</option>
								<option value="60d">
									60 Days
								</option>
							</select>
						</div>
						<div className="form-group">
							<label>Status *</label>
							<select
								value={formData.status}
								onChange={(e) =>
									handleStatusChange(
										e.target
											.value as 'processing' | 'delivered' | 'cancelled',
									)
								}
								required
							>
								<option value="processing">
									Processing
								</option>
								<option value="delivered">
									Delivered
								</option>
								<option value="cancelled">
									Cancelled
								</option>
							</select>
						</div>
						<div className="form-group full-width">
							<label>
								Delivery Address *
							</label>
							<textarea
								value={formData.addr}
								onChange={(e) =>
									setFormData({
										...formData,
										addr: e.target
											.value,
									})
								}
								required
								rows={2}
							/>
						</div>
						<div className="form-group full-width">
							<label>Substatus *</label>
							<select
								value={
									formData.substatus
								}
								onChange={(e) =>
									setFormData({
										...formData,
										substatus:
											e.target.value,
									})
								}
								required
							>
								{SUBSTATUS_OPTIONS[
									formData.status
								].map((option) => (
									<option
										key={option}
										value={option}
									>
										{option}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="items-section">
						<div className="items-header">
							<h3>Items</h3>
							<button
								type="button"
								onClick={addItem}
								className="add-item-btn"
							>
								+ Add Item
							</button>
						</div>
						{formData.items.map(
							(item, idx) => (
								<div
									key={idx}
									className="item-row"
								>
									<input
										type="text"
										placeholder="Product name"
										value={item.name}
										onChange={(e) =>
											handleItemChange(
												idx,
												'name',
												e.target.value,
											)
										}
										required
									/>
									<input
										type="number"
										placeholder="Qty"
										value={item.qty}
										onChange={(e) =>
											handleItemChange(
												idx,
												'qty',
												Number(
													e.target
														.value,
												),
											)
										}
										required
										min="1"
									/>
									<input
										type="number"
										placeholder="Unit price"
										value={item.unit}
										onChange={(e) =>
											handleItemChange(
												idx,
												'unit',
												Number(
													e.target
														.value,
												),
											)
										}
										required
										min="0"
									/>
									<div className="item-total">
										{formatRupiah(
											item.total,
										)}
									</div>
									{formData.items
										.length > 1 && (
										<button
											type="button"
											onClick={() =>
												removeItem(idx)
											}
											className="remove-item-btn"
										>
											×
										</button>
									)}
								</div>
							),
						)}
						<div className="total-row">
							<strong>Total:</strong>
							<strong>
								{formatRupiah(
									formData.total,
								)}
							</strong>
						</div>
					</div>

					<div className="modal-actions">
						<button
							type="button"
							onClick={onClose}
							className="btn-cancel"
							disabled={creating}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn-submit"
							disabled={creating}
						>
							{creating
								? 'Creating...'
								: 'Create PO'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default function POPage() {
	// State
	const [pos, setPOs] = useState<PO[]>(
		[],
	);
	const [perSales, setPerSales] =
		useState<PerSales[]>([]);
	const [
		valueSummary,
		setValueSummary,
	] = useState<ValueSummary>({
		total: 0,
		processing: 0,
		realized: 0,
		target: 0,
	});
	const [totalItems, setTotalItems] =
		useState(0);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] = useState<
		string | null
	>(null);

	const [activeSP, setActiveSP] =
		useState<Set<string>>(
			new Set([
				'tonosutono',
				'taufik',
				'feri',
			]),
		);
	const [curStatus, setCurStatus] =
		useState<string>('all');
	const [openRow, setOpenRow] =
		useState<string | null>(null);
	const [currentPage, setCurrentPage] =
		useState(1);
	const perPage = 10;

	// Create PO Modal State
	const [
		showCreateModal,
		setShowCreateModal,
	] = useState(false);
	const [creating, setCreating] =
		useState(false);

	// Update Status State
	const [editingStatusPO, setEditingStatusPO] = useState<string | null>(null);
	const [updating, setUpdating] = useState(false);

	// Fetch data from API
	const fetchPOs =
		useCallback(async () => {
			setLoading(true);
			setError(null);

			try {
				const repsArray =
					Array.from(activeSP);
				const response = await getPOs(
					repsArray,
					curStatus,
					currentPage,
					perPage,
				);

				setPOs(response.rows || []);
				setPerSales(
					response.perSales || [],
				);
				setValueSummary(
					response.value || {
						total: 0,
						processing: 0,
						realized: 0,
						target: 0,
					},
				);
				setTotalItems(
					response.total || 0,
				);
			} catch (err) {
				console.error(
					'Error fetching POs:',
					err,
				);
				setError(
					'Failed to load Purchase Orders. Please try again.',
				);
			} finally {
				setLoading(false);
			}
		}, [
			activeSP,
			curStatus,
			currentPage,
			perPage,
		]);

	// Fetch data on mount and when filters change
	useEffect(() => {
		fetchPOs();
	}, [fetchPOs]);

	// Toggle salesperson
	const toggleSP = (
		username: string,
	) => {
		setActiveSP((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(username)) {
				// Don't allow deselecting all
				if (newSet.size > 1) {
					newSet.delete(username);
				}
			} else {
				newSet.add(username);
			}
			return newSet;
		});
		setCurrentPage(1);
	};

	// Toggle row expansion
	const toggleRow = (poId: string) => {
		setOpenRow((prev) =>
			prev === poId ? null : poId,
		);
	};

	// Change status filter
	const handleStatusChange = (
		status: string,
	) => {
		setCurStatus(status);
		setCurrentPage(1);
	};

	// Handle create PO
	const handleCreatePO = async (
		formData: CreatePORequest,
	) => {
		setCreating(true);
		try {
			await createPO(formData);
			setShowCreateModal(false);
			fetchPOs(); // Refresh the list
		} catch (err) {
			console.error(
				'Error creating PO:',
				err,
			);
			alert(
				'Failed to create PO. Please try again.',
			);
		} finally {
			setCreating(false);
		}
	};

	// Handle update PO status
	const handleUpdateStatus = async (poId: string, data: UpdatePOStatusRequest) => {
		setUpdating(true);
		try {
			await updatePOStatus(poId, data);
			setEditingStatusPO(null);
			fetchPOs(); // Refresh the list
		} catch (err) {
			console.error('Error updating PO status:', err);
			alert('Failed to update PO status. Please try again.');
		} finally {
			setUpdating(false);
		}
	};

	// Calculate pagination
	const totalPages = Math.ceil(
		totalItems / perPage,
	);
	const pct = valueSummary.target
		? Math.min(
				100,
				Math.round(
					(valueSummary.total /
						valueSummary.target) *
						100,
				),
			)
		: 0;

	if (loading && pos.length === 0) {
		return (
			<MainLayout title="Purchase Orders">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<div className="text-lg text-gray-600 font-medium">
							Loading Purchase Orders...
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Purchase Orders">
			<div className="po-container">
				{/* Page Header */}
				<div className="po-header">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Purchase Orders
						</h1>
						<p className="text-gray-600">
							Manage and track purchase
							orders
						</p>
					</div>
					<button
						onClick={() =>
							setShowCreateModal(true)
						}
						className="create-po-btn"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="w-5 h-5"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
						Create PO
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
						<div className="text-red-600 font-medium">
							{error}
						</div>
						<button
							onClick={fetchPOs}
							className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
						>
							Retry
						</button>
					</div>
				)}

				{/* Salesperson Filter */}
				<div className="filter-row">
					<div className="sp-filter">
						{Object.entries(
							SALESPEOPLE,
						).map(
							([
								username,
								displayName,
							]) => (
								<button
									key={username}
									className={`sp-pill ${activeSP.has(username) ? 'active' : ''}`}
									onClick={() =>
										toggleSP(username)
									}
									disabled={loading}
								>
									<span className="dot"></span>
									{displayName}
								</button>
							),
						)}
					</div>
				</div>

				{/* Salesperson Summary Cards */}
				<div className="summary-row">
					{perSales
						.filter((s) =>
							activeSP.has(s.rep),
						)
						.map((s) => (
							<div
								key={s.rep}
								className="sum-card"
							>
								<div className="sum-top">
									<div className="sum-avatar">
										{SALESPEOPLE[
											s.rep as SalespersonUsername
										]
											?.charAt(0)
											.toUpperCase() ||
											'S'}
									</div>
									<div className="sum-name">
										{SALESPEOPLE[
											s.rep as SalespersonUsername
										] || s.rep}
									</div>
								</div>
								<div className="sum-stat">
									<span className="k">
										Open POs
									</span>
									<span className="v">
										{s.count}
									</span>
								</div>
								<div className="sum-stat">
									<span className="k">
										Value
									</span>
									<span className="v-small">
										{formatRupiah(
											s.value,
										)}
									</span>
								</div>
							</div>
						))}
				</div>

				{/* Value Summary */}
				<div className="val-summary">
					<div className="vs-head">
						<div>
							<span className="vs-lbl">
								Total PO Value
							</span>
							<span className="vs-amt grad">
								{formatRupiah(
									valueSummary.total,
								)}
							</span>
						</div>
					</div>
					<div className="vs-track">
						<div
							className="vs-fill"
							style={{
								width: `${pct}%`,
							}}
						></div>
					</div>
					<div className="vs-cap">
						<b>{pct}%</b> of target
					</div>
					<div className="vs-subs">
						<div className="vs-sub">
							<span className="dot pend"></span>
							<span className="k">
								Processing Value
							</span>
							<span className="v">
								{formatRupiah(
									valueSummary.processing,
								)}
							</span>
						</div>
						<div className="vs-sub">
							<span className="dot real"></span>
							<span className="k">
								Realized Value
							</span>
							<span className="v">
								{formatRupiah(
									valueSummary.realized,
								)}
							</span>
						</div>
						<div className="vs-sub">
							<span className="dot tgt"></span>
							<span className="k">
								Target
							</span>
							<span className="v">
								{formatRupiah(
									valueSummary.target,
								)}
							</span>
						</div>
					</div>
				</div>

				{/* Status Filter */}
				<div className="status-filter">
					{[
						'all',
						'processing',
						'delivered',
						'cancelled',
					].map((status) => (
						<button
							key={status}
							className={`sf-pill ${curStatus === status ? 'active' : ''}`}
							onClick={() =>
								handleStatusChange(
									status,
								)
							}
							disabled={loading}
						>
							{status === 'all'
								? 'All'
								: STATUS_LABEL[
										status as keyof typeof STATUS_LABEL
									]}
						</button>
					))}
				</div>

				{/* Loading State for Table */}
				{loading && (
					<div className="text-center py-8">
						<div className="inline-flex items-center space-x-2">
							<div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
							<span className="text-gray-600">
								Loading...
							</span>
						</div>
					</div>
				)}

				{/* PO Table */}
				{!loading &&
				pos.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-xl border border-gray-200">
						<div className="text-gray-500 text-lg">
							No Purchase Orders found
						</div>
						<p className="text-gray-400 mt-2">
							Try adjusting your filters
						</p>
					</div>
				) : (
					<div className="po-table">
						{pos.map((po) => (
							<div
								key={po.poId}
								className="v-rowwrap"
							>
								<div
									className="v-row"
									onClick={() =>
										toggleRow(po.poId)
									}
								>
									<div className="v-id">
										{po.poId}
									</div>
									<div className="v-main">
										<div className="v-client">
											{po.client}
										</div>
										<div className="v-proj">
											{po.project}
										</div>
									</div>
									<div className="v-meta">
										<div>
											{SALESPEOPLE[
												po.sp as SalespersonUsername
											] || po.sp}
										</div>
										<div>{po.date}</div>
									</div>
									<div className="v-val">
										{formatRupiah(
											po.value,
										)}
									</div>
									<button
										className={`v-chev ${openRow === po.poId ? 'open' : ''}`}
									>
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<polyline points="6 9 12 15 18 9" />
										</svg>
									</button>
								</div>

								{openRow === po.poId && (
									<div className="v-ex">
										<div className="v-ex-left">
											<div className="v-ex-id">
												{po.poId}
											</div>
											<div className="v-ex-store">
												{po.client}
											</div>
											<div className="v-ex-addrlabel">
												Alamat
												Pengiriman
											</div>
											<div className="v-ex-addr">
												{po.addr}
											</div>
											<div className="v-ex-meta">
												<div>
													<b>Sales:</b>{' '}
													{SALESPEOPLE[
														po.sp as SalespersonUsername
													] || po.sp}
												</div>
												<div>
													<b>
														PO Date:
													</b>{' '}
													{po.date}
												</div>
												<div>
													<b>
														Delivery:
													</b>{' '}
													{po.delivery}
												</div>
												<div>
													<b>T.O.P:</b>{' '}
													{po.top}
												</div>
											</div>
											<div
												className={`v-ex-pill ${po.status}`}
											>
												<span className="pdot"></span>
												{
													STATUS_LABEL[
														po.status
													]
												}
											</div>
											<div className="v-ex-substatus">
												<div className="sk">
													STATUS
												</div>
												<div
													className={`sv ${po.status}`}
												>
													{po.substatus}
												</div>
											</div>

											{editingStatusPO === po.poId ? (
												<StatusEditForm
													po={po}
													onSave={(data) => handleUpdateStatus(po.poId, data)}
													onCancel={() => setEditingStatusPO(null)}
													updating={updating}
												/>
											) : (
												<button
													onClick={() => setEditingStatusPO(po.poId)}
													className="edit-status-btn"
												>
													Edit Status
												</button>
											)}
										</div>
										<div className="v-ex-right">
											{po.items.map(
												(item, idx) => (
													<div
														key={idx}
														className="li-row"
													>
														<div className="li-main">
															<div className="li-name">
																{
																	item.name
																}
															</div>
															<div className="li-unit">
																{formatRupiah(
																	item.unit,
																)}{' '}
																/ unit
															</div>
														</div>
														<div className="li-qty">
															{item.qty}
															×
														</div>
														<div className="li-total">
															{formatRupiah(
																item.total,
															)}
														</div>
													</div>
												),
											)}
											<div className="li-totalrow">
												<div className="tl">
													TOTAL
												</div>
												<div className="tv">
													{formatRupiah(
														po.total,
													)}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{!loading && pos.length > 0 && (
					<div className="pagination">
						<span className="pg-info">
							Showing {pos.length} of{' '}
							{totalItems} POs (Page{' '}
							{currentPage} of{' '}
							{totalPages})
						</span>
						{totalPages > 1 &&
							Array.from(
								{
									length: Math.min(
										totalPages,
										10,
									),
								},
								(_, i) => i + 1,
							).map((page) => (
								<button
									key={page}
									className={`pg-btn ${currentPage === page ? 'active' : ''}`}
									onClick={() =>
										setCurrentPage(page)
									}
									disabled={loading}
								>
									{page}
								</button>
							))}
						{totalPages > 10 &&
							currentPage <
								totalPages && (
								<>
									<span className="pg-info">
										...
									</span>
									<button
										className="pg-btn"
										onClick={() =>
											setCurrentPage(
												totalPages,
											)
										}
										disabled={loading}
									>
										{totalPages}
									</button>
								</>
							)}
					</div>
				)}

				{/* Create PO Modal */}
				{showCreateModal && (
					<CreatePOModal
						onClose={() =>
							setShowCreateModal(false)
						}
						onSubmit={handleCreatePO}
						creating={creating}
					/>
				)}

				<style jsx global>{`
					/* Modal Styles */
					.modal-overlay {
						position: fixed;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: rgba(
							0,
							0,
							0,
							0.5
						);
						display: flex;
						align-items: center;
						justify-content: center;
						z-index: 1000;
						padding: 20px;
					}

					.modal-content {
						background: white;
						border-radius: 16px;
						max-width: 800px;
						width: 100%;
						max-height: 90vh;
						overflow-y: auto;
						box-shadow: 0 8px 32px
							rgba(0, 0, 0, 0.2);
					}

					.modal-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 24px;
						border-bottom: 1px solid
							#e0e0e0;
					}

					.modal-header h2 {
						font-size: 24px;
						font-weight: 700;
						color: #111;
						margin: 0;
					}

					.modal-close {
						background: none;
						border: none;
						font-size: 32px;
						color: #9a9a9a;
						cursor: pointer;
						line-height: 1;
						padding: 0;
						width: 32px;
						height: 32px;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.modal-close:hover {
						color: #111;
					}

					.modal-form {
						padding: 24px;
					}

					.form-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 16px;
						margin-bottom: 24px;
					}

					.form-group {
						display: flex;
						flex-direction: column;
						gap: 8px;
					}

					.form-group.full-width {
						grid-column: 1 / -1;
					}

					.form-group label {
						font-size: 13px;
						font-weight: 600;
						color: #111;
					}

					.form-group input,
					.form-group select,
					.form-group textarea {
						padding: 10px 12px;
						border: 1px solid #e0e0e0;
						border-radius: 8px;
						font-size: 14px;
						font-family: inherit;
						color: #111;
					}

					.form-group input:focus,
					.form-group select:focus,
					.form-group textarea:focus {
						outline: none;
						border-color: #1ca7ec;
					}

					.items-section {
						margin-bottom: 24px;
						padding: 20px;
						background: #f8f9fa;
						border-radius: 12px;
					}

					.items-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 16px;
					}

					.items-header h3 {
						font-size: 16px;
						font-weight: 700;
						color: #111;
						margin: 0;
					}

					.add-item-btn {
						padding: 6px 12px;
						background: #1ca7ec;
						color: white;
						border: none;
						border-radius: 6px;
						font-size: 13px;
						font-weight: 600;
						cursor: pointer;
					}

					.add-item-btn:hover {
						background: #1590cd;
					}

					.item-row {
						display: grid;
						grid-template-columns: 2fr 100px 120px 120px 40px;
						gap: 8px;
						margin-bottom: 8px;
						align-items: center;
					}

					.item-row input {
						padding: 8px 10px;
						border: 1px solid #e0e0e0;
						border-radius: 6px;
						font-size: 13px;
						color: #111;
					}

					.item-total {
						font-size: 13px;
						font-weight: 600;
						color: #121567;
					}

					.remove-item-btn {
						background: #fe2c23;
						color: white;
						border: none;
						border-radius: 4px;
						width: 30px;
						height: 30px;
						cursor: pointer;
						font-size: 20px;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.total-row {
						display: flex;
						justify-content: space-between;
						margin-top: 16px;
						padding-top: 16px;
						border-top: 2px solid
							#e0e0e0;
						font-size: 16px;
						color: #121567;
					}

					.modal-actions {
						display: flex;
						gap: 12px;
						justify-content: flex-end;
					}

					.btn-cancel,
					.btn-submit {
						padding: 10px 24px;
						border: none;
						border-radius: 8px;
						font-size: 14px;
						font-weight: 600;
						cursor: pointer;
					}

					.btn-cancel {
						background: #e0e0e0;
						color: #111;
					}

					.btn-cancel:hover {
						background: #d0d0d0;
					}

					.btn-submit {
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						color: white;
					}

					.btn-submit:hover {
						box-shadow: 0 4px 12px
							rgba(28, 167, 236, 0.3);
					}

					.btn-submit:disabled,
					.btn-cancel:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					/* Status Edit Styles */
					.edit-status-btn {
						margin-top: 16px;
						padding: 8px 16px;
						background: #1ca7ec;
						color: white;
						border: none;
						border-radius: 6px;
						font-size: 13px;
						font-weight: 600;
						cursor: pointer;
						transition: background 0.2s;
					}

					.edit-status-btn:hover {
						background: #1590cd;
					}

					.status-edit-form {
						margin-top: 16px;
						padding: 16px;
						background: #f8f9fa;
						border-radius: 8px;
						border: 1px solid #e0e0e0;
					}

					.status-edit-field {
						margin-bottom: 12px;
					}

					.status-edit-field label {
						display: block;
						font-size: 12px;
						font-weight: 600;
						color: #111;
						margin-bottom: 6px;
						text-transform: uppercase;
						letter-spacing: 0.05em;
					}

					.status-edit-field select {
						width: 100%;
						padding: 8px 12px;
						border: 1px solid #e0e0e0;
						border-radius: 6px;
						font-size: 13px;
						color: #111;
						background: white;
					}

					.status-edit-field select:focus {
						outline: none;
						border-color: #1ca7ec;
					}

					.status-edit-field select:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					.status-edit-actions {
						display: flex;
						gap: 8px;
						margin-top: 16px;
					}

					.btn-cancel-status,
					.btn-save-status {
						flex: 1;
						padding: 8px 16px;
						border: none;
						border-radius: 6px;
						font-size: 13px;
						font-weight: 600;
						cursor: pointer;
					}

					.btn-cancel-status {
						background: #e0e0e0;
						color: #111;
					}

					.btn-cancel-status:hover {
						background: #d0d0d0;
					}

					.btn-save-status {
						background: linear-gradient(90deg, #61bedf 0%, #1ca7ec 50%, #1590cd 100%);
						color: white;
					}

					.btn-save-status:hover {
						box-shadow: 0 4px 12px rgba(28, 167, 236, 0.3);
					}

					.btn-cancel-status:disabled,
					.btn-save-status:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					@media (max-width: 768px) {
						.form-grid {
							grid-template-columns: 1fr;
						}

						.item-row {
							grid-template-columns: 1fr;
						}

						.item-total {
							text-align: right;
						}
					}
				`}</style>

				<style jsx>{`
					.po-container {
						max-width: 1400px;
						margin: 0 auto;
						padding: 24px;
					}

					.po-header {
						margin-bottom: 32px;
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
					}

					.create-po-btn {
						display: inline-flex;
						align-items: center;
						gap: 8px;
						padding: 10px 20px;
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						color: white;
						border: none;
						border-radius: 8px;
						font-weight: 600;
						font-size: 14px;
						cursor: pointer;
						transition:
							transform 0.2s,
							box-shadow 0.2s;
					}

					.create-po-btn:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 12px
							rgba(28, 167, 236, 0.3);
					}

					.filter-row {
						margin-bottom: 20px;
					}

					.sp-filter {
						display: flex;
						gap: 8px;
						flex-wrap: wrap;
					}

					.sp-pill {
						display: inline-flex;
						align-items: center;
						gap: 8px;
						padding: 8px 16px;
						border-radius: 100px;
						border: 2px solid #e0e0e0;
						background: #fff;
						color: #9a9a9a;
						font-weight: 600;
						font-size: 13px;
						cursor: pointer;
						transition: all 0.2s;
					}

					.sp-pill:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					.sp-pill .dot {
						width: 8px;
						height: 8px;
						border-radius: 50%;
						background: currentColor;
						opacity: 0.3;
					}

					.sp-pill.active {
						border-color: #1ca7ec;
						color: #1ca7ec;
					}

					.sp-pill.active .dot {
						opacity: 1;
					}

					.summary-row {
						display: flex;
						gap: 12px;
						margin-bottom: 20px;
						flex-wrap: wrap;
					}

					.sum-card {
						flex: 1;
						min-width: 140px;
						background: #fff;
						border-radius: 16px;
						padding: 16px;
						box-shadow: 0 2px 8px
							rgba(0, 0, 0, 0.08);
						border: 1px solid #e0e0e0;
					}

					.sum-top {
						display: flex;
						align-items: center;
						gap: 12px;
						margin-bottom: 12px;
					}

					.sum-avatar {
						width: 36px;
						height: 36px;
						border-radius: 50%;
						background: linear-gradient(
							135deg,
							#61bedf 0%,
							#1ca7ec 100%
						);
						color: #fff;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: 700;
						font-size: 14px;
					}

					.sum-name {
						font-weight: 600;
						font-size: 14px;
						color: #111;
					}

					.sum-stat {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 4px;
					}

					.sum-stat:last-child {
						margin-bottom: 0;
					}

					.sum-stat .k {
						font-size: 12px;
						color: #9a9a9a;
					}

					.sum-stat .v {
						font-weight: 700;
						font-size: 18px;
						color: #121567;
					}

					.sum-stat .v-small {
						font-weight: 600;
						font-size: 13px;
						color: #121567;
					}

					.val-summary {
						background: #fff;
						border-radius: 20px;
						padding: 24px;
						margin-bottom: 20px;
						box-shadow: 0 2px 12px
							rgba(0, 0, 0, 0.08);
						border: 1px solid #e0e0e0;
					}

					.vs-head {
						margin-bottom: 16px;
					}

					.vs-lbl {
						display: block;
						font-size: 13px;
						color: #9a9a9a;
						font-weight: 500;
						margin-bottom: 8px;
					}

					.vs-amt {
						font-size: 32px;
						font-weight: 800;
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
					}

					.vs-track {
						height: 12px;
						background: #e0e0e0;
						border-radius: 6px;
						overflow: hidden;
						margin-bottom: 8px;
					}

					.vs-fill {
						height: 100%;
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						transition: width 0.5s ease;
					}

					.vs-cap {
						font-size: 13px;
						color: #9a9a9a;
						margin-bottom: 16px;
					}

					.vs-cap b {
						color: #121567;
						font-weight: 700;
					}

					.vs-subs {
						display: flex;
						gap: 24px;
						flex-wrap: wrap;
					}

					.vs-sub {
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.vs-sub .dot {
						width: 10px;
						height: 10px;
						border-radius: 50%;
					}

					.vs-sub .dot.pend {
						background: #f5a623;
					}

					.vs-sub .dot.real {
						background: #27ae60;
					}

					.vs-sub .dot.tgt {
						background: #121567;
					}

					.vs-sub .k {
						font-size: 13px;
						color: #9a9a9a;
					}

					.vs-sub .v {
						font-weight: 700;
						font-size: 15px;
						color: #121567;
					}

					.status-filter {
						display: flex;
						gap: 8px;
						margin-bottom: 20px;
						flex-wrap: wrap;
					}

					.sf-pill {
						padding: 8px 20px;
						border-radius: 100px;
						border: 2px solid #e0e0e0;
						background: #fff;
						color: #9a9a9a;
						font-weight: 600;
						font-size: 14px;
						cursor: pointer;
						transition: all 0.2s;
					}

					.sf-pill:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					.sf-pill.active {
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						border-color: transparent;
						color: #fff;
					}

					.po-table {
						display: flex;
						flex-direction: column;
						gap: 12px;
					}

					.v-rowwrap {
						background: #fff;
						border-radius: 16px;
						overflow: hidden;
						box-shadow: 0 2px 8px
							rgba(0, 0, 0, 0.08);
						border: 1px solid #e0e0e0;
					}

					.v-row {
						display: flex;
						align-items: center;
						gap: 16px;
						padding: 20px;
						cursor: pointer;
						transition: background 0.2s;
					}

					.v-row:hover {
						background: #f8f9fa;
					}

					.v-id {
						font-weight: 800;
						font-size: 16px;
						color: #121567;
						min-width: 100px;
					}

					.v-main {
						flex: 1;
						min-width: 0;
					}

					.v-client {
						font-weight: 700;
						font-size: 15px;
						color: #111;
						margin-bottom: 4px;
					}

					.v-proj {
						font-weight: 500;
						font-size: 13px;
						color: #9a9a9a;
					}

					.v-meta {
						font-size: 13px;
						color: #9a9a9a;
						text-align: right;
						min-width: 100px;
					}

					.v-val {
						font-weight: 700;
						font-size: 16px;
						color: #121567;
						min-width: 140px;
						text-align: right;
					}

					.v-chev {
						width: 24px;
						height: 24px;
						border: none;
						background: transparent;
						cursor: pointer;
						color: #9a9a9a;
						transition: transform 0.3s;
					}

					.v-chev.open {
						transform: rotate(180deg);
					}

					.v-chev svg {
						width: 100%;
						height: 100%;
					}

					.v-ex {
						display: flex;
						gap: 24px;
						padding: 0 20px 20px;
						border-top: 1px solid
							#e0e0e0;
						animation: slideDown 0.3s
							ease;
					}

					@keyframes slideDown {
						from {
							opacity: 0;
							max-height: 0;
						}
						to {
							opacity: 1;
							max-height: 1000px;
						}
					}

					.v-ex-left {
						flex: 0 0 300px;
					}

					.v-ex-id {
						font-weight: 800;
						font-size: 22px;
						color: #121567;
						margin-bottom: 12px;
					}

					.v-ex-store {
						font-weight: 700;
						font-size: 16px;
						color: #111;
					}

					.v-ex-addrlabel {
						font-weight: 500;
						font-style: italic;
						font-size: 13px;
						color: #9a9a9a;
						margin-top: 12px;
					}

					.v-ex-addr {
						font-weight: 400;
						font-size: 13px;
						color: #111;
						line-height: 1.6;
						margin-bottom: 16px;
					}

					.v-ex-meta {
						font-weight: 400;
						font-size: 13px;
						color: #111;
						line-height: 1.9;
					}

					.v-ex-pill {
						display: inline-flex;
						align-items: center;
						gap: 8px;
						margin-top: 12px;
						padding: 6px 20px;
						border-radius: 100px;
						color: #fff;
						font-weight: 700;
						font-size: 13px;
					}

					.v-ex-pill.processing {
						background: #f5a623;
					}

					.v-ex-pill.delivered {
						background: #27ae60;
					}

					.v-ex-pill.cancelled {
						background: #fe2c23;
					}

					.v-ex-pill .pdot {
						width: 8px;
						height: 8px;
						border-radius: 50%;
						background: rgba(
							0,
							0,
							0,
							0.28
						);
					}

					.v-ex-substatus {
						display: flex;
						flex-direction: column;
						gap: 2px;
						margin-top: 12px;
					}

					.v-ex-substatus .sk {
						font-weight: 500;
						font-size: 12px;
						color: #9a9a9a;
						text-transform: uppercase;
						letter-spacing: 0.06em;
					}

					.v-ex-substatus .sv {
						font-weight: 700;
						font-size: 14px;
					}

					.v-ex-substatus
						.sv.processing {
						color: #f5a623;
					}

					.v-ex-substatus
						.sv.delivered {
						color: #27ae60;
					}

					.v-ex-substatus
						.sv.cancelled {
						color: #fe2c23;
					}

					.v-ex-right {
						flex: 1;
						min-width: 0;
					}

					.li-row {
						display: flex;
						align-items: flex-start;
						gap: 12px;
						padding: 8px 0;
						border-bottom: 1px solid
							#e0e0e0;
					}

					.li-main {
						flex: 1;
						min-width: 0;
					}

					.li-name {
						font-weight: 600;
						font-size: 14px;
						color: #111;
					}

					.li-unit {
						font-weight: 400;
						font-size: 12px;
						color: #9a9a9a;
						margin-top: 2px;
					}

					.li-qty {
						font-weight: 400;
						font-size: 13px;
						color: #9a9a9a;
						min-width: 30px;
						text-align: center;
					}

					.li-total {
						font-weight: 600;
						font-size: 14px;
						color: #111;
						min-width: 110px;
						text-align: right;
					}

					.li-totalrow {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-top: 8px;
					}

					.li-totalrow .tl {
						font-weight: 700;
						font-size: 15px;
						color: #111;
					}

					.li-totalrow .tv {
						font-weight: 800;
						font-size: 15px;
						color: #121567;
					}

					.pagination {
						display: flex;
						align-items: center;
						justify-content: flex-end;
						gap: 8px;
						margin-top: 20px;
						flex-wrap: wrap;
					}

					.pg-info {
						font-weight: 400;
						font-size: 13px;
						color: #9a9a9a;
						margin-right: 8px;
					}

					.pg-btn {
						height: 30px;
						padding: 0 14px;
						border: 1px solid #e0e0e0;
						background: #fff;
						border-radius: 6px;
						cursor: pointer;
						font-weight: 500;
						font-size: 13px;
						color: #9a9a9a;
						transition: 0.2s;
					}

					.pg-btn:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					.pg-btn:hover:not(
							.active
						):not(:disabled) {
						border-color: #1ca7ec;
						color: #1ca7ec;
					}

					.pg-btn.active {
						background: linear-gradient(
							90deg,
							#61bedf 0%,
							#1ca7ec 50%,
							#1590cd 100%
						);
						border-color: transparent;
						color: #fff;
					}

					@media (max-width: 768px) {
						.v-row {
							flex-wrap: wrap;
						}

						.v-ex {
							flex-direction: column;
						}

						.v-ex-left {
							flex: 1;
						}
					}
				`}</style>
			</div>
		</MainLayout>
	);
}
