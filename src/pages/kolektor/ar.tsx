import MainLayout from '@/components/MainLayout';
import {
	assignCollector,
	formatCurrency as formatCurrencyUtil,
	getARList,
	getARSummary,
	getCollectors,
	getSalespeople,
	sendReminder,
	updateReminderStatus,
	type ARItem,
	type ARSummary,
	type Assignee,
	type ReminderStatus,
	type SalespersonUser,
	type StatusFilter,
} from '@/lib/kolektor';
import {
	useEffect,
	useState,
} from 'react';

const ITEMS_PER_PAGE = 10;

export default function ARPage() {
	const [currentDate] = useState(
		new Date(),
	);
	const [salespeople, setSalespeople] =
		useState<SalespersonUser[]>([]);
	const [
		activeSalespeople,
		setActiveSalespeople,
	] = useState<string[]>([]);
	const [
		currentStatus,
		setCurrentStatus,
	] = useState<StatusFilter>('all');
	const [arData, setArData] = useState<
		ARItem[]
	>([]);
	const [summary, setSummary] =
		useState<ARSummary | null>(null);
	const [
		collectorsList,
		setCollectorsList,
	] = useState<Assignee[]>([]);
	const [
		expandedRows,
		setExpandedRows,
	] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalItems, setTotalItems] =
		useState(0);
	const [loading, setLoading] =
		useState(true);

	const formatCurrency = (
		value: number,
	): string => {
		return formatCurrencyUtil(value);
	};

	const formatDate = (
		date: Date,
	): string => {
		return date.toLocaleDateString(
			'id-ID',
			{
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			},
		);
	};

	const toggleSalesperson = (
		spId: string,
	) => {
		setActiveSalespeople((prev) =>
			prev.includes(spId)
				? prev.filter((s) => s !== spId)
				: [...prev, spId],
		);
		setCurrentPage(1);
	};

	const toggleRow = (id: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	// Fetch salespeople on mount
	useEffect(() => {
		const fetchSalespeople =
			async () => {
				try {
					const res =
						await getSalespeople();
					if (
						res.statusCode === 200 &&
						res.data
					) {
						setSalespeople(res.data);
						// Set all salespeople as active by default
						setActiveSalespeople(
							res.data.map(
								(sp) => sp._id,
							),
						);
					}
				} catch (error) {
					console.error(
						'Error fetching salespeople:',
						error,
					);
				}
			};

		fetchSalespeople();
	}, []);

	// Fetch AR list
	useEffect(() => {
		if (activeSalespeople.length === 0)
			return;

		const fetchARList = async () => {
			setLoading(true);
			try {
				const res = await getARList({
					sp: activeSalespeople,
					status: currentStatus,
					page: currentPage,
				});

				if (
					res.statusCode === 200 &&
					res.data
				) {
					setArData(res.data.rows);
					setTotalItems(res.data.total);
				}
			} catch (error) {
				console.error(
					'Error fetching AR list:',
					error,
				);
			} finally {
				setLoading(false);
			}
		};

		fetchARList();
	}, [
		activeSalespeople,
		currentStatus,
		currentPage,
	]);

	// Fetch summary
	useEffect(() => {
		if (activeSalespeople.length === 0)
			return;

		const fetchSummary = async () => {
			try {
				const res = await getARSummary({
					sp: activeSalespeople,
				});

				if (
					res.statusCode === 200 &&
					res.data
				) {
					setSummary(res.data);
				}
			} catch (error) {
				console.error(
					'Error fetching AR summary:',
					error,
				);
			}
		};

		fetchSummary();
	}, [activeSalespeople]);

	// Fetch collectors list
	useEffect(() => {
		const fetchCollectors =
			async () => {
				try {
					const res =
						await getCollectors();
					if (
						res.statusCode === 200 &&
						res.data
					) {
						setCollectorsList(res.data);
					}
				} catch (error) {
					console.error(
						'Error fetching collectors:',
						error,
					);
				}
			};

		fetchCollectors();
	}, []);

	const handleAssignCollector = async (
		receivableId: string,
		collectorUsername: string,
	) => {
		try {
			const res = await assignCollector(
				receivableId,
				collectorUsername,
			);
			if (res.statusCode === 200) {
				// Refresh data
				const arRes = await getARList({
					sp: activeSalespeople,
					status: currentStatus,
					page: currentPage,
				});

				if (
					arRes.statusCode === 200 &&
					arRes.data
				) {
					setArData(arRes.data.rows);
					setTotalItems(
						arRes.data.total,
					);
				}

				alert(
					'Collector assigned successfully!',
				);
			} else {
				alert(`Error: ${res.error}`);
			}
		} catch (error) {
			alert(
				'Failed to assign collector',
			);
			console.error(error);
		}
	};

	const handleUpdateReminder = async (
		id: string,
		status: ReminderStatus,
	) => {
		try {
			const res =
				await updateReminderStatus(
					id,
					status,
				);
			if (res.statusCode === 200) {
				// Update local data
				setArData((prev) =>
					prev.map((item) =>
						item.id === id
							? {
									...item,
									remindStatus: status,
									remindCount:
										status === 'none'
											? 0
											: (item.remindCount ||
													0) + 1,
									lastRemind:
										status === 'none'
											? undefined
											: new Date().toISOString(),
								}
							: item,
					),
				);
			} else {
				alert(`Error: ${res.error}`);
			}
		} catch (error) {
			alert(
				'Failed to update reminder status',
			);
			console.error(error);
		}
	};

	const handleSendReminder = async (
		id: string,
		channel: 'whatsapp' | 'email',
	) => {
		try {
			const res = await sendReminder(
				id,
				channel,
			);
			if (res.statusCode === 200) {
				alert(
					`Reminder sent via ${channel}!`,
				);
				// Update local data
				setArData((prev) =>
					prev.map((item) =>
						item.id === id
							? {
									...item,
									remindCount:
										(item.remindCount ||
											0) + 1,
									lastRemind:
										new Date().toISOString(),
								}
							: item,
					),
				);
			} else {
				alert(`Error: ${res.error}`);
			}
		} catch (error) {
			alert('Failed to send reminder');
			console.error(error);
		}
	};

	const totalPages = Math.ceil(
		totalItems / ITEMS_PER_PAGE,
	);

	const getStatusColor = (
		status: string,
	) => {
		switch (status) {
			case 'outstanding':
				return '#1CA7EC';
			case 'due2w':
				return '#FFA726';
			case 'overdue':
				return '#FE2C23';
			case 'paid':
				return '#4CAF50';
			default:
				return '#9a9a9a';
		}
	};

	const getStatusLabel = (
		status: string,
	) => {
		switch (status) {
			case 'outstanding':
				return 'Outstanding';
			case 'due2w':
				return 'Due in 2 Weeks';
			case 'overdue':
				return 'Overdue';
			case 'paid':
				return 'Paid';
			default:
				return status;
		}
	};

	const getReminderStatusColor = (
		status: ReminderStatus,
	) => {
		switch (status) {
			case 'none':
				return '#9a9a9a';
			case 'reminded':
				return '#1CA7EC';
			case 'promised':
				return '#4CAF50';
			case 'disputed':
				return '#FE2C23';
			default:
				return '#9a9a9a';
		}
	};

	const getSalespersonName = (
		spId: string,
	) => {
		const sp = salespeople.find(
			(s) => s._id === spId,
		);
		return sp
			? sp.name ||
					`${sp.firstName} ${sp.lastName}`
			: spId;
	};

	return (
		<MainLayout>
			<div className="ar-page">
				{/* Welcome Section */}
				<div className="welcome">
					<div>
						<h1>Accounts Receivable</h1>
						<div className="date">
							{formatDate(currentDate)}
						</div>
					</div>
					<div className="role">
						Superadmin
					</div>
				</div>

				{/* Export Row */}
				<div className="export-row">
					<button className="export-btn">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line
								x1="12"
								y1="15"
								x2="12"
								y2="3"
							/>
						</svg>
						Export
					</button>
					<button className="excel-btn">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line
								x1="9"
								y1="15"
								x2="15"
								y2="15"
							/>
						</svg>
						Excel
					</button>
				</div>

				{/* Value Card */}
				<div className="vcard">
					{/* Value Summary */}
					{summary && (
						<div
							className="valsummary"
							id="valSummary"
						>
							<div className="val-main">
								<div className="val-label">
									Total Receivables
								</div>
								<div className="val-amount gradient-text">
									{formatCurrency(
										summary.total,
									)}
								</div>
							</div>
							<div className="val-progress">
								<div
									className="val-progress-bar"
									style={{
										width: `${summary.targetProgress}%`,
									}}
								></div>
							</div>
							<div className="val-stats">
								<div className="val-stat">
									<div className="val-stat-label">
										Outstanding
									</div>
									<div className="val-stat-value">
										{formatCurrency(
											summary.outstanding,
										)}
									</div>
								</div>
								<div className="val-stat">
									<div className="val-stat-label">
										Collected
									</div>
									<div className="val-stat-value">
										{formatCurrency(
											summary.collected,
										)}
									</div>
								</div>
								<div className="val-stat">
									<div className="val-stat-label">
										Target
									</div>
									<div className="val-stat-value">
										{formatCurrency(
											summary.target,
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Salesperson Filter */}
					<div
						className="filter2-row"
						id="spFilter"
					>
						{salespeople.map((sp) => (
							<button
								key={sp._id}
								className={`sp-pill ${activeSalespeople.includes(sp._id) ? 'active' : ''}`}
								onClick={() =>
									toggleSalesperson(
										sp._id,
									)
								}
							>
								<span className="dot"></span>
								{sp.name ||
									`${sp.firstName} ${sp.lastName}`}
							</button>
						))}
					</div>

					{/* Summary Row - Per Sales Outstanding */}
					{summary &&
						summary.bySalesperson && (
							<div
								className="summary-row"
								id="summaryRow"
							>
								{summary.bySalesperson
									.filter((sp) =>
										activeSalespeople.includes(
											sp.id,
										),
									)
									.map((sp) => {
										const salesperson =
											salespeople.find(
												(s) =>
													s._id ===
													sp.id,
											);
										return (
											<div
												key={sp.id}
												className="summary-card"
											>
												<div className="summary-card-label">
													{salesperson
														? salesperson.name ||
															`${salesperson.firstName} ${salesperson.lastName}`
														: 'Unknown'}
												</div>
												<div className="summary-card-value">
													{formatCurrency(
														sp.outstanding,
													)}
												</div>
											</div>
										);
									})}
							</div>
						)}

					{/* Status Filter */}
					<div
						className="statusfilter"
						id="statusFilter"
					>
						{[
							{
								key: 'all',
								label: 'All',
							},
							{
								key: 'outstanding',
								label: 'Outstanding',
							},
							{
								key: 'due2w',
								label: 'Due in 2 Weeks',
							},
							{
								key: 'overdue',
								label: 'Overdue',
							},
							{
								key: 'paid',
								label: 'Paid',
							},
						].map((status) => (
							<button
								key={status.key}
								className={`status-pill ${currentStatus === status.key ? 'active' : ''}`}
								style={{
									...(currentStatus ===
										status.key && {
										background:
											getStatusColor(
												status.key,
											),
										color: '#fff',
										borderColor:
											getStatusColor(
												status.key,
											),
									}),
								}}
								onClick={() => {
									setCurrentStatus(
										status.key as StatusFilter,
									);
									setCurrentPage(1);
								}}
							>
								{status.label}
							</button>
						))}
					</div>

					<div className="divider"></div>

					{/* AR Table */}
					<div
						className="visit-table"
						id="arTable"
					>
						{/* Table Header */}
						<div className="ar-table-head">
							<div className="ar-col-id">
								Invoice
							</div>
							<div className="ar-col-client">
								Client / Project
							</div>
							<div className="ar-col-date">
								Date / Delivery
							</div>
							<div className="ar-col-value">
								Value
							</div>
							<div className="ar-col-sp">
								SP
							</div>
							<div className="ar-col-status">
								Status
							</div>
							<div className="ar-col-expand"></div>
						</div>

						{/* Table Body */}
						{loading ? (
							<div className="ar-loading">
								Loading...
							</div>
						) : arData?.length === 0 ? (
							<div className="ar-empty">
								No receivables found
							</div>
						) : (
							arData?.map((item) => (
								<div
									key={item.id}
									className="ar-row-wrap"
								>
									{/* Main Row */}
									<div
										className="ar-row"
										onClick={() =>
											toggleRow(item.id)
										}
									>
										<div className="ar-col-id">
											<span className="ar-id">
												{item.id}
											</span>
											<span
												className={`ar-src ${item.source.toLowerCase()}`}
											>
												{item.source}
											</span>
										</div>
										<div className="ar-col-client">
											<div className="ar-client">
												{item.client}
											</div>
											{item.subject && (
												<div className="ar-subject">
													{item.subject}
												</div>
											)}
										</div>
										<div className="ar-col-date">
											<div>
												{item.date}
											</div>
											<div className="ar-delivery">
												{item.delivery}
											</div>
										</div>
										<div className="ar-col-value">
											{formatCurrency(
												item.value,
											)}
										</div>
										<div className="ar-col-sp">
											{getSalespersonName(
												item.sp,
											)}
										</div>
										<div className="ar-col-status">
											<span
												className="ar-status-badge"
												style={{
													background:
														getStatusColor(
															item.status,
														),
													color: '#fff',
												}}
											>
												{getStatusLabel(
													item.status,
												)}
											</span>
											{item.substatus && (
												<div className="ar-substatus">
													{
														item.substatus
													}
												</div>
											)}
										</div>
										<div className="ar-col-expand">
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className={`expand-icon ${expandedRows.has(item.id) ? 'expanded' : ''}`}
											>
												<polyline points="6 9 12 15 18 9" />
											</svg>
										</div>
									</div>

									{/* Expanded Content */}
									{expandedRows.has(
										item.id,
									) && (
										<div className="ar-expanded">
											{/* Items */}
											<div className="ar-items-section">
												<h4>Items</h4>
												<table className="ar-items-table">
													<thead>
														<tr>
															<th>
																Item
															</th>
															<th>
																Qty
															</th>
															<th>
																Unit
															</th>
															<th>
																Total
															</th>
														</tr>
													</thead>
													<tbody>
														{item.items.map(
															(
																lineItem,
																idx,
															) => (
																<tr
																	key={
																		idx
																	}
																>
																	<td>
																		{
																			lineItem.name
																		}
																	</td>
																	<td>
																		{
																			lineItem.qty
																		}
																	</td>
																	<td>
																		{
																			lineItem.unit
																		}
																	</td>
																	<td>
																		{formatCurrency(
																			lineItem.total,
																		)}
																	</td>
																</tr>
															),
														)}
													</tbody>
												</table>
												<div className="ar-items-total">
													<strong>
														Total:
													</strong>{' '}
													{formatCurrency(
														item.total,
													)}
												</div>
											</div>

											{/* Address */}
											<div className="ar-address-section">
												<h4>
													Delivery
													Address
												</h4>
												<p>
													{item.addr}
												</p>
											</div>

											{/* Tanda Terima Tracker (for Project only) */}
											{item.source ===
												'Project' && (
												<div className="tt-tracker">
													<h4>
														Tanda Terima
														Status
													</h4>
													<div className="tt-steps">
														<div
															className={`tt-step ${item.shipped ? 'completed' : ''}`}
														>
															<div className="tt-step-icon">
																{item.shipped
																	? '✓'
																	: '○'}
															</div>
															<div className="tt-step-label">
																Shipped
																{item.shippedDate && (
																	<span className="tt-date">
																		{
																			item.shippedDate
																		}
																	</span>
																)}
															</div>
														</div>
														<div className="tt-line"></div>
														<div
															className={`tt-step ${item.ttIssued ? 'completed' : ''}`}
														>
															<div className="tt-step-icon">
																{item.ttIssued
																	? '✓'
																	: '○'}
															</div>
															<div className="tt-step-label">
																TT
																Issued
																{item.ttDate && (
																	<span className="tt-date">
																		{
																			item.ttDate
																		}
																	</span>
																)}
															</div>
														</div>
													</div>
												</div>
											)}

											{/* Reminder Block */}
											<div className="rm-block">
												<h4>
													Reminder
													Workflow
												</h4>

												{/* Current Status */}
												<div className="rm-current">
													<span
														className="rm-status-pill"
														style={{
															background:
																getReminderStatusColor(
																	item.remindStatus,
																),
															color:
																'#fff',
														}}
													>
														{item.remindStatus.toUpperCase()}
													</span>
													<span className="rm-count">
														{item.remindCount >
															0 &&
															`${item.remindCount} reminders`}
													</span>
													{item.lastRemind && (
														<span className="rm-last">
															Last:{' '}
															{new Date(
																item.lastRemind,
															).toLocaleDateString(
																'id-ID',
															)}
														</span>
													)}
												</div>

												{/* Status Selector */}
												<div className="rm-selector">
													{(
														[
															'none',
															'reminded',
															'promised',
															'disputed',
														] as ReminderStatus[]
													).map(
														(
															status,
														) => (
															<button
																key={
																	status
																}
																className={`rm-selector-btn ${item.remindStatus === status ? 'active' : ''}`}
																onClick={() =>
																	handleUpdateReminder(
																		item.id,
																		status,
																	)
																}
															>
																{status}
															</button>
														),
													)}
												</div>

												{/* Send Buttons */}
												<div className="rm-send-row">
													<button
														className="rm-send whatsapp"
														onClick={() =>
															handleSendReminder(
																item.id,
																'whatsapp',
															)
														}
													>
														<svg
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill="currentColor"
														>
															<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
														</svg>
														WhatsApp
													</button>
													<button
														className="rm-send email"
														onClick={() =>
															handleSendReminder(
																item.id,
																'email',
															)
														}
													>
														<svg
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
															<polyline points="22,6 12,13 2,6" />
														</svg>
														Email
													</button>
												</div>

												{/* Collector & Note */}
												{item.collector &&
													item.collectorNote && (
														<div className="vc-block">
															<div className="vc-label">
																Collector
																Note:
															</div>
															<div className="vc-assignee">
																{
																	item.collector
																}
															</div>
															<div className="vc-note">
																{
																	item.collectorNote
																}
															</div>
															{item.noteDate && (
																<div className="vc-date">
																	{
																		item.noteDate
																	}
																</div>
															)}
														</div>
													)}
											</div>
										</div>
									)}
								</div>
							))
						)}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div
							className="pagination"
							id="pagination"
						>
							<button
								className="page-btn"
								disabled={
									currentPage === 1
								}
								onClick={() =>
									setCurrentPage(
										currentPage - 1,
									)
								}
							>
								Previous
							</button>
							<div className="page-info">
								Page {currentPage} of{' '}
								{totalPages}
							</div>
							<button
								className="page-btn"
								disabled={
									currentPage ===
									totalPages
								}
								onClick={() =>
									setCurrentPage(
										currentPage + 1,
									)
								}
							>
								Next
							</button>
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
