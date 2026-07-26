import MainLayout from '@/components/MainLayout';
import {
	getUsers,
	User,
} from '@/lib/users';
import {
	formatVisitDateOnly,
	formatVisitTimeOnly,
	getVisitId,
	getVisits,
	Visit,
	VisitFilters,
} from '@/lib/visits';
import Link from 'next/link';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';
import * as XLSX from 'xlsx';

export default function Reports() {
	const [visits, setVisits] = useState<
		Visit[]
	>([]);
	const [users, setUsers] = useState<
		User[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [currentPage, setCurrentPage] =
		useState(1);
	const [totalPages, setTotalPages] =
		useState(1);
	const [totalItems, setTotalItems] =
		useState(0);
	const [
		itemsPerPage,
		setItemsPerPage,
	] = useState(10);

	const [filters, setFilters] =
		useState<VisitFilters>({
			page: 1,
			limit: 10,
			username: '',
			startDate: '',
			endDate: '',
		});

	const fetchUsers =
		useCallback(async () => {
			try {
				const response =
					await getUsers();
				if (
					response.statusCode === 200 &&
					response.data
				) {
					// Filter to only show Sales Retail users (role = 1)
					const salesRetailUsers =
						response.data.filter(
							(user) => user.role === 1,
						);
					setUsers(salesRetailUsers);
				}
			} catch {
				console.error(
					'Failed to fetch users for filter',
				);
			}
		}, []);

	const fetchVisits =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getVisits(filters);
				if (
					response.statusCode === 200 &&
					response.data
				) {
					setVisits(
						response.data.visits,
					);
					setCurrentPage(
						response.data.pagination
							.currentPage,
					);
					setTotalPages(
						response.data.pagination
							.totalPages,
					);
					setTotalItems(
						response.data.pagination
							.totalItems,
					);
					setItemsPerPage(
						response.data.pagination
							.itemsPerPage,
					);
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch visits',
					);
					setVisits([]);
				}
			} catch {
				setError(
					'Failed to fetch visits',
				);
				setVisits([]);
			} finally {
				setLoading(false);
			}
		}, [filters]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		fetchVisits();
	}, [fetchVisits]);

	const handleFilterChange = (
		key: keyof VisitFilters,
		value: string | number,
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			page:
				key !== 'page'
					? 1
					: typeof value === 'number'
						? value
						: 1, // Reset to page 1 when changing filters except pagination
		}));
	};

	const handleSearch = (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setFilters((prev) => ({
			...prev,
			page: 1,
		}));
	};

	const clearFilters = () => {
		setFilters({
			page: 1,
			limit: 10,
			username: '',
			startDate: '',
			endDate: '',
		});
	};

	const handlePageChange = (
		page: number,
	) => {
		if (
			page >= 1 &&
			page <= totalPages
		) {
			handleFilterChange('page', page);
		}
	};

	const handleLimitChange = (
		limit: number,
	) => {
		handleFilterChange('limit', limit);
	};

	const exportToExcel = async () => {
		try {
			// Fetch all visits with the same filters but no pagination limit
			const exportFilters: VisitFilters =
				{
					...filters,
					limit: 999999, // Get all records
					page: 1,
				};

			const response = await getVisits(
				exportFilters,
			);

			if (
				response.statusCode !== 200 ||
				!response.data
			) {
				alert(
					'Failed to fetch data for export',
				);
				return;
			}

			const allVisits =
				response.data.visits;

			// Prepare data for export
			const exportData = allVisits.map(
				(visit) => ({
					Sales: visit.name,
					Username: visit.username,
					Toko: visit.store,
					Lokasi: visit.location,
					Tanggal:
						formatVisitDateOnly(visit),
					Jam: formatVisitTimeOnly(
						visit,
					),
					Deskripsi: visit.description,
					'Order ID':
						visit.orderId || '-',
				}),
			);

			// Create worksheet
			const worksheet =
				XLSX.utils.json_to_sheet(
					exportData,
				);

			// Create workbook
			const workbook =
				XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(
				workbook,
				worksheet,
				'Laporan Kunjungan',
			);

			// Generate filename with current date
			const date = new Date()
				.toISOString()
				.split('T')[0];
			const filename = `laporan-kunjungan-${date}.xlsx`;

			// Download file
			XLSX.writeFile(
				workbook,
				filename,
			);
		} catch (error) {
			console.error(
				'Export error:',
				error,
			);
			alert('Failed to export data');
		}
	};

	const exportSummary = async () => {
		try {
			// Fetch all visits with the same filters but no pagination limit
			const exportFilters: VisitFilters =
				{
					...filters,
					limit: 999999, // Get all records
					page: 1,
				};

			const response = await getVisits(
				exportFilters,
			);

			if (
				response.statusCode !== 200 ||
				!response.data
			) {
				alert(
					'Failed to fetch data for export',
				);
				return;
			}

			const allVisits =
				response.data.visits;

			// Group visits by username and week
			const summaryMap = new Map<
				string,
				Map<string, Set<string>>
			>();

			allVisits.forEach((visit) => {
				// Get week number and year
				const visitDate = new Date(
					visit.startTime,
				);
				const weekNumber =
					getWeekNumber(visitDate);
				const year =
					visitDate.getFullYear();
				const weekKey = `${year}-W${weekNumber}`;

				// Initialize username map if not exists
				if (
					!summaryMap.has(
						visit.username,
					)
				) {
					summaryMap.set(
						visit.username,
						new Map(),
					);
				}

				const userWeeks =
					summaryMap.get(
						visit.username,
					)!;

				// Initialize week set if not exists
				if (!userWeeks.has(weekKey)) {
					userWeeks.set(
						weekKey,
						new Set(),
					);
				}

				// Add store to the set (automatically handles duplicates)
				userWeeks
					.get(weekKey)!
					.add(visit.store);
			});

			// Convert to export format
			const exportData: Array<{
				Sales: string;
				Username: string;
				Week: string;
				'Unique Stores Visited': number;
			}> = [];

			summaryMap.forEach(
				(weeks, username) => {
					const salesName =
						allVisits.find(
							(v) =>
								v.username === username,
						)?.name || username;

					weeks.forEach(
						(stores, weekKey) => {
							exportData.push({
								Sales: salesName,
								Username: username,
								Week: weekKey,
								'Unique Stores Visited':
									stores.size,
							});
						},
					);
				},
			);

			// Sort by username and week
			exportData.sort((a, b) => {
				if (a.Username !== b.Username) {
					return a.Username.localeCompare(
						b.Username,
					);
				}
				return a.Week.localeCompare(
					b.Week,
				);
			});

			// Create worksheet
			const worksheet =
				XLSX.utils.json_to_sheet(
					exportData,
				);

			// Create workbook
			const workbook =
				XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(
				workbook,
				worksheet,
				'Summary Kunjungan',
			);

			// Generate filename with current date
			const date = new Date()
				.toISOString()
				.split('T')[0];
			const filename = `summary-kunjungan-${date}.xlsx`;

			// Download file
			XLSX.writeFile(
				workbook,
				filename,
			);
		} catch (error) {
			console.error(
				'Export error:',
				error,
			);
			alert('Failed to export summary');
		}
	};

	// Helper function to get week number
	const getWeekNumber = (
		date: Date,
	): number => {
		const d = new Date(
			Date.UTC(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
			),
		);
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(
			d.getUTCDate() + 4 - dayNum,
		);
		const yearStart = new Date(
			Date.UTC(
				d.getUTCFullYear(),
				0,
				1,
			),
		);
		return Math.ceil(
			((d.getTime() -
				yearStart.getTime()) /
				86400000 +
				1) /
				7,
		);
	};

	return (
		<MainLayout title="Laporan Kunjungan">
			<style jsx>{`
				.welcome {
					display: flex;
					align-items: flex-start;
					margin-bottom: 24px;
				}
				.welcome h1 {
					margin: 0;
					font-weight: 700;
					font-size: 20px;
					color: #111111;
				}
				.welcome .date {
					margin-top: 4px;
					font-weight: 400;
					font-size: 13px;
					color: #9a9a9a;
				}
				.export-row {
					display: flex;
					justify-content: flex-end;
					gap: 10px;
					margin: -8px 0 16px;
				}
				.btn-export,
				.btn-excel {
					height: 34px;
					padding: 0 20px;
					border: none;
					border-radius: 8px;
					cursor: pointer;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 700;
					font-size: 13px;
					color: #fff;
					transition: filter 0.2s ease;
				}
				.btn-export {
					background: linear-gradient(
						90deg,
						#61bedf 0%,
						#1ca7ec 50%,
						#1590cd 100%
					);
				}
				.btn-excel {
					background: #27ae60;
				}
				.btn-export:hover,
				.btn-excel:hover {
					filter: brightness(1.08);
				}
				.btn-export:disabled,
				.btn-excel:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.vcard {
					background: #ffffff;
					border: 1px solid #e0e0e0;
					border-radius: 12px;
					padding: 24px 28px;
					box-shadow: 0 2px 8px
						rgba(0, 0, 0, 0.04);
					margin-bottom: 16px;
				}
				.controls-row {
					display: flex;
					align-items: center;
					gap: 16px;
					flex-wrap: wrap;
					margin-bottom: 14px;
				}
				.vcard-title {
					margin: 0;
					font-weight: 700;
					font-size: 16px;
					color: #111111;
				}
				.filter-group {
					display: flex;
					align-items: center;
					gap: 12px;
					flex-wrap: wrap;
					flex: 1;
				}
				.filter-label {
					font-weight: 500;
					font-size: 13px;
					color: #9a9a9a;
				}
				.filter-select {
					height: 30px;
					padding: 0 14px;
					border: 1px solid #e0e0e0;
					border-radius: 8px;
					background: #fff;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 500;
					font-size: 13px;
					color: #111111;
					cursor: pointer;
					transition: border-color 0.2s
						ease;
				}
				.filter-select:focus {
					outline: none;
					border-color: #1ca7ec;
				}
				.filter-input {
					height: 30px;
					padding: 0 14px;
					border: 1px solid #e0e0e0;
					border-radius: 8px;
					background: #fff;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 500;
					font-size: 13px;
					color: #111111;
					transition: border-color 0.2s
						ease;
				}
				.filter-input:focus {
					outline: none;
					border-color: #1ca7ec;
				}
				.btn-filter {
					height: 30px;
					padding: 0 16px;
					border: none;
					border-radius: 8px;
					background: linear-gradient(
						90deg,
						#61bedf 0%,
						#1ca7ec 50%,
						#1590cd 100%
					);
					color: #fff;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 700;
					font-size: 13px;
					cursor: pointer;
					transition: filter 0.2s ease;
				}
				.btn-filter:hover {
					filter: brightness(1.08);
				}
				.btn-clear {
					height: 30px;
					padding: 0 16px;
					border: 1px solid #e0e0e0;
					border-radius: 8px;
					background: #fff;
					color: #9a9a9a;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 600;
					font-size: 13px;
					cursor: pointer;
					transition: all 0.2s ease;
				}
				.btn-clear:hover {
					border-color: #1ca7ec;
					color: #1ca7ec;
				}
				.perpage {
					margin-left: auto;
					display: flex;
					align-items: center;
					gap: 10px;
				}
				.pp-label {
					font-weight: 500;
					font-size: 13px;
					color: #9a9a9a;
				}
				.pp-pill {
					height: 30px;
					padding: 0 14px;
					border: none;
					border-radius: 8px;
					cursor: pointer;
					background: linear-gradient(
						90deg,
						#61bedf 0%,
						#1ca7ec 50%,
						#1590cd 100%
					);
					color: #fff;
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 700;
					font-size: 13px;
				}
				.divider {
					height: 1px;
					background: #e0e0e0;
					width: 100%;
					margin: 20px 0;
				}
				.visit-table {
					margin-top: 4px;
					overflow-x: auto;
					-webkit-overflow-scrolling: touch;
				}
				.visit-table-inner {
					min-width: 1300px;
				}
				.v-header {
					display: flex;
					align-items: center;
					gap: 14px;
					padding: 12px 8px;
					border-bottom: 1px solid
						#e0e0e0;
					background: #f8fbff;
					border-radius: 8px 8px 0 0;
				}
				.v-header-cell {
					font-weight: 600;
					font-size: 10px;
					text-transform: uppercase;
					letter-spacing: 0.04em;
					color: #9a9a9a;
				}
				.v-header .v-avatar {
					opacity: 0;
					pointer-events: none;
				}
				.v-rowwrap {
					border-bottom: 1px solid
						#f4f6f9;
				}
				.v-row {
					display: flex;
					align-items: center;
					gap: 14px;
					padding: 12px 8px;
					cursor: pointer;
					transition: background 0.2s
						ease;
					border-radius: 8px;
				}
				.v-row:hover {
					background: #f8fbff;
				}
				.v-avatar {
					flex: 0 0 32px;
					width: 32px;
					height: 32px;
					border-radius: 50%;
					background: linear-gradient(
						90deg,
						#61bedf 0%,
						#1ca7ec 50%,
						#1590cd 100%
					);
					display: flex;
					align-items: center;
					justify-content: center;
					color: #fff;
					font-weight: 700;
					font-size: 11px;
				}
				.v-name {
					flex: 0 0 100px;
					font-weight: 600;
					font-size: 14px;
					color: #111111;
					white-space: nowrap;
				}
				.v-store {
					flex: 0 0 140px;
					font-weight: 500;
					font-size: 14px;
					color: #111111;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.v-loc {
					flex: 0 0 280px;
					font-weight: 400;
					font-size: 13px;
					color: #9a9a9a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.v-date {
					flex: 0 0 95px;
					font-weight: 400;
					font-size: 13px;
					color: #9a9a9a;
					white-space: nowrap;
				}
				.v-time {
					flex: 0 0 130px;
					font-weight: 500;
					font-size: 13px;
					color: #111111;
					white-space: nowrap;
				}
				.v-desc {
					flex: 0 0 150px;
					font-weight: 400;
					font-size: 13px;
					color: #9a9a9a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.v-result {
					flex: 0 0 100px;
					font-weight: 500;
					font-size: 13px;
					color: #111111;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.v-notes {
					flex: 0 0 100px;
					font-weight: 400;
					font-size: 13px;
					color: #9a9a9a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.v-view {
					flex: 0 0 50px;
					font-weight: 700;
					font-size: 13px;
					cursor: pointer;
					text-align: right;
					display: inline-block;
				}
				:global(.v-view) {
					color: #000000 !important;
					text-decoration: none !important;
				}
				:global(.v-view:hover) {
					text-decoration: underline !important;
					color: #1ca7ec !important;
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
					font-family:
						'Montserrat',
						-apple-system,
						BlinkMacSystemFont,
						'Segoe UI',
						sans-serif;
					font-weight: 500;
					font-size: 13px;
					color: #9a9a9a;
					transition: 0.2s;
				}
				.pg-btn:hover:not(.active):not(
						:disabled
					) {
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
				.pg-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.error-banner {
					background: #fff5f5;
					border: 1px solid #feb2b2;
					border-radius: 8px;
					padding: 12px 16px;
					margin-bottom: 16px;
				}
				.error-text {
					font-weight: 500;
					font-size: 13px;
					color: #c53030;
				}
				.loading-container {
					padding: 32px;
					text-align: center;
				}
				.loading-spinner {
					display: inline-block;
					width: 24px;
					height: 24px;
					border: 3px solid #e0e0e0;
					border-top-color: #1ca7ec;
					border-radius: 50%;
					animation: spin 0.8s linear
						infinite;
				}
				@keyframes spin {
					to {
						transform: rotate(360deg);
					}
				}
				.loading-text {
					margin-top: 12px;
					font-weight: 500;
					font-size: 14px;
					color: #9a9a9a;
				}
				.empty-state {
					padding: 32px;
					text-align: center;
					font-weight: 500;
					font-size: 14px;
					color: #9a9a9a;
				}
				@media (max-width: 1280px) {
					.v-desc {
						display: none;
					}
				}
				@media (max-width: 1060px) {
					.v-loc {
						display: none;
					}
				}
				@media (max-width: 900px) {
					.v-date {
						display: none;
					}
				}
			`}</style>
			<div>
				{/* Header */}
				<div className="welcome">
					<div>
						<h1>Laporan Kunjungan</h1>
						<div className="date">
							{new Date().toLocaleDateString(
								'id-ID',
								{
									day: '2-digit',
									month: 'short',
									year: 'numeric',
								},
							)}
						</div>
					</div>
				</div>

				{/* Export buttons */}
				<div className="export-row">
					<button
						onClick={exportSummary}
						disabled={
							visits.length === 0
						}
						className="btn-export"
					>
						Export Summary
					</button>
					<button
						onClick={exportToExcel}
						disabled={
							visits.length === 0
						}
						className="btn-excel"
					>
						Export Excel
					</button>
				</div>

				{error && (
					<div className="error-banner">
						<div className="error-text">
							{error}
						</div>
					</div>
				)}

				{/* Main card */}
				<div className="vcard">
					<div className="controls-row">
						<h2 className="vcard-title">
							Visits Performance
						</h2>
						<div className="filter-group">
							<span className="filter-label">
								Sales:
							</span>
							<select
								value={
									filters.username || ''
								}
								onChange={(e) =>
									handleFilterChange(
										'username',
										e.target.value,
									)
								}
								className="filter-select"
							>
								<option value="">
									Semua Sales
								</option>
								{users.map((user) => (
									<option
										key={
											user._id ||
											user.id
										}
										value={
											user.username
										}
									>
										{user.firstName}
									</option>
								))}
							</select>
							<span className="filter-label">
								From:
							</span>
							<input
								type="date"
								value={
									filters.startDate ||
									''
								}
								onChange={(e) =>
									handleFilterChange(
										'startDate',
										e.target.value,
									)
								}
								className="filter-input"
							/>
							<span className="filter-label">
								To:
							</span>
							<input
								type="date"
								value={
									filters.endDate || ''
								}
								onChange={(e) =>
									handleFilterChange(
										'endDate',
										e.target.value,
									)
								}
								className="filter-input"
							/>
							<button
								onClick={handleSearch}
								className="btn-filter"
							>
								Filter
							</button>
							<button
								onClick={clearFilters}
								className="btn-clear"
							>
								Clear
							</button>
						</div>
						<div className="perpage">
							<span className="pp-label">
								View per page
							</span>
							<select
								value={
									filters.limit || 10
								}
								onChange={(e) =>
									handleLimitChange(
										Number(
											e.target.value,
										),
									)
								}
								className="pp-pill"
							>
								<option value={10}>
									10
								</option>
								<option value={25}>
									25
								</option>
								<option value={50}>
									50
								</option>
								<option value={100}>
									100
								</option>
							</select>
						</div>
					</div>

					<div className="divider"></div>

					{/* Visits table */}
					<div className="visit-table">
						{loading ? (
							<div className="loading-container">
								<div className="loading-spinner"></div>
								<div className="loading-text">
									Memuat data
									kunjungan...
								</div>
							</div>
						) : visits.length === 0 ? (
							<div className="empty-state">
								Tidak ada data kunjungan
								yang ditemukan
							</div>
						) : (
							<div className="visit-table-inner">
								{/* Table Header */}
								<div className="v-header">
									<div className="v-avatar"></div>
									<div className="v-name v-header-cell">
										Sales
									</div>
									<div className="v-store v-header-cell">
										Store
									</div>
									<div className="v-loc v-header-cell">
										Location
									</div>
									<div className="v-date v-header-cell">
										Date
									</div>
									<div className="v-time v-header-cell">
										Time
									</div>
									<div className="v-desc v-header-cell">
										Description
									</div>
									<div className="v-result v-header-cell">
										Result
									</div>
									<div className="v-notes v-header-cell">
										Notes
									</div>
									<div className="v-view v-header-cell">
										Action
									</div>
								</div>
								{/* Table Rows */}
								{visits.map((visit) => (
									<div
										key={getVisitId(
											visit,
										)}
										className="v-rowwrap"
									>
										<div className="v-row">
											<div className="v-avatar">
												{visit.name
													.split(' ')[0]
													.charAt(0)
													.toUpperCase()}
											</div>
											<div className="v-name">
												{
													visit.name.split(
														' ',
													)[0]
												}
											</div>
											<div className="v-store">
												{visit.store}
											</div>
											<div className="v-loc">
												{visit.location}
											</div>
											<div className="v-date">
												{formatVisitDateOnly(
													visit,
												)}
											</div>
											<div className="v-time">
												{formatVisitTimeOnly(
													visit,
												)}
											</div>
											<div className="v-desc">
												{
													visit.description
												}
											</div>
											<div className="v-result">
												{visit.result}
											</div>
											<div className="v-notes">
												{visit.notes}
											</div>
											<Link
												href={`/reports/${getVisitId(visit)}`}
												className="v-view"
											>
												View
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Pagination */}
					{!loading &&
						visits.length > 0 && (
							<div className="pagination">
								<span className="pg-info">
									Menampilkan{' '}
									{Math.min(
										(currentPage - 1) *
											itemsPerPage +
											1,
										totalItems,
									)}{' '}
									-{' '}
									{Math.min(
										currentPage *
											itemsPerPage,
										totalItems,
									)}{' '}
									dari {totalItems}{' '}
									kunjungan
								</span>
								<button
									onClick={() =>
										handlePageChange(
											currentPage - 1,
										)
									}
									disabled={
										currentPage === 1
									}
									className="pg-btn"
								>
									Previous
								</button>
								{Array.from(
									{
										length: Math.min(
											5,
											totalPages,
										),
									},
									(_, i) => {
										const startPage =
											Math.max(
												1,
												currentPage -
													Math.floor(
														5 / 2,
													),
											);
										const page =
											Math.min(
												startPage + i,
												totalPages,
											);
										return (
											<button
												key={page}
												onClick={() =>
													handlePageChange(
														page,
													)
												}
												className={`pg-btn ${
													page ===
													currentPage
														? 'active'
														: ''
												}`}
											>
												{page}
											</button>
										);
									},
								)}
								<button
									onClick={() =>
										handlePageChange(
											currentPage + 1,
										)
									}
									disabled={
										currentPage ===
										totalPages
									}
									className="pg-btn"
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
