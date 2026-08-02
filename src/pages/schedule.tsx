import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

interface Collector {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	name: string;
}

interface ARItem {
	_id: string;
	arItemId: string;
	source: string;
	client: string;
	subject: string;
	date: string;
	delivery: string;
	value: number;
	total: number;
	status: string;
	substatus: string;
	collector: string;
	addr: string;
	items: Array<{
		name: string;
		qty: number;
		unit: string;
		total: number;
	}>;
}

interface Assignment {
	_id: string;
	arItemId: string;
	arDetails: ARItem;
	collectorName: string;
	scheduledDate: string;
	status: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

interface ScheduleData {
	collectors: Collector[];
	assignments: Assignment[];
	unassignedARs: ARItem[] | null;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function Schedule() {
	const [user, setUser] = useState<User | null>(null);
	const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
	const [loading, setLoading] = useState(true);
	const [weekIndex, setWeekIndex] = useState(1);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [selectedCell, setSelectedCell] = useState<{ ci: number; di: number } | null>(null);
	const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

	const WEEKS = [
		'02 – 07 Jun 2026',
		'09 – 14 Jun 2026',
		'16 – 21 Jun 2026',
		'23 – 28 Jun 2026',
	];

	useEffect(() => {
		const storedUser = getStoredUser();
		if (!storedUser) {
			window.location.href = '/login';
			return;
		}
		setUser(storedUser);
		loadSchedule();
	}, []);

	const loadSchedule = async () => {
		setLoading(true);
		try {
			const response = await fetch('http://localhost:8080/api/collection/schedule');
			const result = await response.json();

			if (result.status === 'success') {
				const data = result.data;
				setScheduleData({
					collectors: data.collectors || [],
					assignments: data.assignments || [],
					unassignedARs: data.unassignedARs || [],
				});
			}
		} catch (error) {
			console.error('Failed to load schedule:', error);
		} finally {
			setLoading(false);
		}
	};

	const rupiah = (n: number) => {
		return 'Rp ' + (n || 0).toLocaleString('id-ID');
	};

	const handlePrevWeek = () => {
		setWeekIndex((weekIndex + WEEKS.length - 1) % WEEKS.length);
	};

	const handleNextWeek = () => {
		setWeekIndex((weekIndex + 1) % WEEKS.length);
	};

	const openAssignModal = (ci: number, di: number) => {
		setSelectedCell({ ci, di });
		const currentAssignments = getAssignmentsForCell(ci, di);
		const selected: Record<string, boolean> = {};
		currentAssignments.forEach((assignment) => {
			selected[assignment.arDetails._id] = true;
		});
		setSelectedItems(selected);
		setShowAssignModal(true);
	};

	const getAssignmentsForCell = (ci: number, di: number): Assignment[] => {
		if (!scheduleData) return [];
		const collector = scheduleData.collectors[ci];
		if (!collector) return [];

		const cellDate = calculateScheduledDate(weekIndex, di);

		return scheduleData.assignments.filter((assignment) => {
			if (assignment.collectorName !== collector.name) return false;

			const assignmentDate = new Date(assignment.scheduledDate);
			const isSameDay =
				assignmentDate.getFullYear() === cellDate.getFullYear() &&
				assignmentDate.getMonth() === cellDate.getMonth() &&
				assignmentDate.getDate() === cellDate.getDate();

			return isSameDay;
		});
	};

	const getAllARs = (): ARItem[] => {
		if (!scheduleData) return [];
		const assignedARs = scheduleData.assignments.map((a) => a.arDetails);
		const unassignedARs = scheduleData.unassignedARs || [];
		return [...assignedARs, ...unassignedARs];
	};

	const getARById = (id: string): ARItem | undefined => {
		return getAllARs().find((ar) => ar._id === id);
	};

	const removeAssignment = async (assignmentId: string) => {
		if (!scheduleData) return;

		// Update local state immediately
		const newAssignments = scheduleData.assignments.filter((a) => a._id !== assignmentId);
		setScheduleData({ ...scheduleData, assignments: newAssignments });

		// TODO: Call DELETE API to remove assignment from backend
		try {
			await fetch(`http://localhost:8080/api/ar-collection-assignments/${assignmentId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			console.error('Failed to remove assignment:', error);
			// Reload on error to restore correct state
			loadSchedule();
		}
	};

	const saveAssignments = async () => {
		if (!selectedCell || !scheduleData || !user) return;
		const { ci, di } = selectedCell;
		const collector = scheduleData.collectors[ci];
		if (!collector) return;

		const newIds = Object.keys(selectedItems).filter((id) => selectedItems[id]);
		const currentAssignments = getAssignmentsForCell(ci, di);
		const currentIds = currentAssignments.map((a) => a.arDetails._id);

		// Calculate which ARs to add
		const toAdd = newIds.filter((id) => !currentIds.includes(id));

		try {
			// Add new assignments
			for (const arId of toAdd) {
				const ar = getARById(arId);
				if (!ar) continue;

				const scheduledDate = calculateScheduledDate(weekIndex, di);

				await fetch('http://localhost:8080/api/ar-collection-assignments', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						arItemId: ar.arItemId,
						scheduledDate: scheduledDate.toISOString(),
						collectorName: collector.name,
						notes: '',
						createdBy: user.username,
					}),
				});
			}

			setShowAssignModal(false);

			// Reload data from server to get fresh assignments
			await loadSchedule();
		} catch (error) {
			console.error('Failed to save assignments:', error);
			alert('Failed to save assignments. Please try again.');
		}
	};

	const calculateScheduledDate = (weekIndex: number, dayIndex: number): Date => {
		// Base date for week 0 (02 Jun 2026)
		const baseDate = new Date('2026-06-02');

		// Calculate the date based on week and day
		const daysToAdd = weekIndex * 7 + dayIndex;
		const scheduledDate = new Date(baseDate);
		scheduledDate.setDate(baseDate.getDate() + daysToAdd);
		scheduledDate.setHours(9, 0, 0, 0); // Set to 9:00 AM

		return scheduledDate;
	};

	const handleAutoAssign = async () => {
		if (!scheduleData || !user) return;

		const unassignedARs = scheduleData.unassignedARs || [];
		if (unassignedARs.length === 0) {
			alert('No unassigned ARs to auto-assign');
			return;
		}

		let collectorIndex = 0;
		let dayIndex = 0;

		try {
			for (const ar of unassignedARs) {
				const collector = scheduleData.collectors[collectorIndex];
				const scheduledDate = calculateScheduledDate(weekIndex, dayIndex);

				await fetch('http://localhost:8080/api/ar-collection-assignments', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						arItemId: ar.arItemId,
						scheduledDate: scheduledDate.toISOString(),
						collectorName: collector.name,
						notes: 'Auto-assigned',
						createdBy: user.username,
					}),
				});

				// Move to next day
				dayIndex++;
				if (dayIndex >= DAYS.length) {
					dayIndex = 0;
					collectorIndex = (collectorIndex + 1) % scheduleData.collectors.length;
				}
			}

			// Reload data
			await loadSchedule();
			alert('Auto-assign completed successfully!');
		} catch (error) {
			console.error('Auto-assign failed:', error);
			alert('Auto-assign failed. Please try again.');
		}
	};

	const isAssignedInCurrentSelection = (arId: string): boolean => {
		if (!scheduleData || !selectedCell) return false;

		// Check if this AR is already assigned to another cell in this week
		for (let ci = 0; ci < scheduleData.collectors.length; ci++) {
			for (let di = 0; di < DAYS.length; di++) {
				// Skip the currently selected cell
				if (ci === selectedCell.ci && di === selectedCell.di) continue;

				const assignments = getAssignmentsForCell(ci, di);
				if (assignments.some((a) => a.arDetails._id === arId)) {
					return true;
				}
			}
		}

		return false;
	};

	const getStatusClass = (ar: ARItem) => {
		if (ar.substatus === 'overdue') return 'ov';
		return 'due';
	};

	if (!user) return null;

	return (
		<MainLayout title="Schedule — Penagihan">
			<div className="welcome">
				<div>
					<h1>Schedule — Penagihan</h1>
					<div className="date">{new Date().toLocaleDateString('id-ID')}</div>
				</div>
				<div className="role">{user.firstName}</div>
			</div>

			<section className="vcard">
				<div className="toolbar">
					<button className="iconbtn" onClick={handlePrevWeek}>
						‹
					</button>
					<div
						className="pill-note"
						style={{
							fontWeight: 700,
							color: 'var(--dark)',
						}}
					>
						{WEEKS[weekIndex]}
					</div>
					<button className="iconbtn" onClick={handleNextWeek}>
						›
					</button>
					<div className="spacer"></div>
					<span
						className="pill-note"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '6px',
						}}
					>
						<span className="sc-dot ov"></span>Overdue
					</span>
					<span
						className="pill-note"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '6px',
						}}
					>
						<span className="sc-dot due"></span>Due 2 minggu
					</span>
					<button className="btn ghost sm" onClick={handleAutoAssign}>
						Auto-assign
					</button>
				</div>

				{loading ? (
					<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
				) : (
					<div className="sched-wrap">
						<div className="sched" id="schedGrid">
							<div className="sc-head">Kolektor</div>
							{DAYS.map((day) => (
								<div className="sc-head" key={day}>
									{day}
								</div>
							))}

							{scheduleData?.collectors.map((collector, ci) => (
								<>
									<div key={`collector-${ci}`} className="sc-cell sc-staff">
										<span className="sc-av">{collector.firstName.charAt(0)}</span>
										<div>
											<div className="sc-nm">{collector.firstName}</div>
											<div className="sc-ar">@{collector.username}</div>
										</div>
									</div>
									{DAYS.map((_, di) => {
										const assignments = getAssignmentsForCell(ci, di);
										return (
											<div key={`cell-${ci}-${di}`} className="sc-cell">
												<div className="sc-day">
													<div className="sc-cnt">{assignments.length} tagihan</div>
													{assignments.map((assignment) => {
														const ar = assignment.arDetails;
														return (
															<div
																key={assignment._id}
																className="sc-store"
																title={`${ar.client} · ${ar.subject} · ${rupiah(ar.total)}`}
															>
																<span className="sc-doc">
																	<span className={`sc-dot ${getStatusClass(ar)}`}></span>
																	<span className="sc-source">
																		{ar.source === 'Project' ? 'P' : 'R'}
																	</span>
																	{ar.arItemId}
																</span>
																<span
																	className="x"
																	onClick={() => removeAssignment(assignment._id)}
																>
																	×
																</span>
															</div>
														);
													})}
													<button
														className="sc-add"
														onClick={() => openAssignModal(ci, di)}
													>
														+ Assign
													</button>
												</div>
											</div>
										);
									})}
								</>
							))}
						</div>
					</div>
				)}
			</section>

			{/* Assign Modal */}
			{showAssignModal && selectedCell && scheduleData && (
				<div
					className="amodal-overlay open"
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowAssignModal(false);
					}}
				>
					<div className="amodal">
						<div className="amodal-head">
							<h3>
								Assign Penagihan —{' '}
								{scheduleData.collectors[selectedCell.ci]?.firstName} · {DAYS[selectedCell.di]}
							</h3>
							<button className="amodal-x" onClick={() => setShowAssignModal(false)}>
								×
							</button>
						</div>
						<div className="amodal-sub">
							Pilih PO / Order penagihan untuk ditugaskan ke kolektor ini.
						</div>
						<div className="amodal-list">
							{getAllARs().map((ar) => {
								const isAssigned = isAssignedInCurrentSelection(ar._id);
								const isSelected = selectedItems[ar._id];
								const isDisabled = isAssigned && !isSelected;

								return (
									<label
										key={ar._id}
										className={`asg-item ${isSelected ? 'on' : ''} ${
											isDisabled ? 'disabled' : ''
										}`}
									>
										<input
											type="checkbox"
											checked={isSelected || false}
											disabled={isDisabled}
											onChange={(e) => {
												setSelectedItems({
													...selectedItems,
													[ar._id]: e.target.checked,
												});
											}}
										/>
										<span className={`sc-dot ${getStatusClass(ar)}`}></span>
										<span className="asg-source">{ar.source === 'Project' ? 'P' : 'R'}</span>
										<span className="asg-id">{ar.arItemId}</span>
										<span className="asg-client">{ar.client}</span>
										<span className="asg-val">{rupiah(ar.total)}</span>
										{isDisabled ? (
											<span className="asg-note">Assigned</span>
										) : (
											<span className={`asg-status ${getStatusClass(ar)}`}>
												{ar.substatus || ar.status}
											</span>
										)}
									</label>
								);
							})}
						</div>
						<div className="amodal-foot">
							<button className="btn ghost" onClick={() => setShowAssignModal(false)}>
								Batal
							</button>
							<button className="btn" onClick={saveAssignments}>
								Simpan
							</button>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				.welcome {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					margin-bottom: 24px;
				}

				.welcome h1 {
					margin: 0 0 8px 0;
					font-weight: 800;
					font-size: 24px;
					color: var(--dark);
				}

				.welcome .date {
					font-size: 14px;
					color: var(--muted);
				}

				.welcome .role {
					font-weight: 600;
					font-size: 14px;
					color: var(--text);
				}

				.vcard {
					background: var(--card, #fff);
					border: 1px solid var(--border);
					border-radius: 12px;
					padding: 24px 28px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
				}

				.toolbar {
					display: flex;
					align-items: center;
					gap: 12px;
					flex-wrap: wrap;
					margin-bottom: 18px;
				}

				.toolbar .spacer {
					margin-left: auto;
				}

				.pill-note {
					display: inline-block;
					font-size: 12px;
					color: var(--muted);
					background: var(--bg, #f5f5f5);
					border-radius: 100px;
					padding: 5px 12px;
				}

				.iconbtn {
					width: 30px;
					height: 30px;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					border: 1px solid var(--border);
					border-radius: 7px;
					background: #fff;
					color: var(--muted);
					cursor: pointer;
					transition: 0.18s;
					font-size: 16px;
				}

				.iconbtn:hover {
					border-color: var(--blue);
					color: var(--blue);
				}

				.btn {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					height: 38px;
					padding: 0 18px;
					border: none;
					border-radius: 9px;
					cursor: pointer;
					font-family: 'Montserrat', sans-serif;
					font-weight: 700;
					font-size: 13px;
					color: #fff;
					background: var(--grad);
					transition: 0.18s;
					white-space: nowrap;
				}

				.btn.ghost {
					background: #fff;
					border: 1px solid var(--border);
					color: var(--text);
				}

				.btn.sm {
					height: 32px;
					padding: 0 13px;
					font-size: 12px;
					border-radius: 8px;
				}

				.sched-wrap {
					overflow-x: auto;
					border: 1px solid var(--border);
					border-radius: 12px;
				}

				.sched {
					display: grid;
					grid-template-columns: 170px repeat(6, minmax(150px, 1fr));
					min-width: 1000px;
				}

				.sc-cell {
					border-right: 1px solid var(--border);
					border-bottom: 1px solid var(--border);
					padding: 9px;
				}

				.sc-head {
					background: #f8fbff;
					font-weight: 700;
					font-size: 12px;
					color: var(--dark);
					text-transform: uppercase;
					letter-spacing: 0.03em;
					text-align: center;
					padding: 12px 8px;
					border-bottom: 1px solid var(--border);
					border-right: 1px solid var(--border);
				}

				.sc-staff {
					display: flex;
					align-items: center;
					gap: 10px;
					background: #f8fbff;
				}

				.sc-av {
					flex: 0 0 32px;
					width: 32px;
					height: 32px;
					border-radius: 50%;
					background: var(--grad);
					color: #fff;
					font-weight: 700;
					font-size: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.sc-nm {
					font-weight: 700;
					font-size: 13px;
					color: var(--dark);
					line-height: 1.2;
				}

				.sc-ar {
					font-weight: 500;
					font-size: 11px;
					color: var(--muted);
				}

				.sc-day {
					display: flex;
					flex-direction: column;
					gap: 5px;
					min-height: 96px;
				}

				.sc-cnt {
					font-weight: 700;
					font-size: 10px;
					text-transform: uppercase;
					letter-spacing: 0.03em;
					color: var(--muted);
					margin-bottom: 1px;
				}

				.sc-store {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 6px;
					background: #fff;
					border: 1px solid var(--border);
					border-radius: 7px;
					padding: 5px 8px;
					font-size: 11px;
					font-weight: 600;
					color: var(--text);
				}

				.sc-store .x {
					cursor: pointer;
					color: var(--muted);
					font-weight: 700;
					flex: 0 0 auto;
				}

				.sc-store .x:hover {
					color: var(--red);
				}

				.sc-doc {
					display: flex;
					align-items: center;
					gap: 4px;
					min-width: 0;
					flex: 1;
					overflow: hidden;
				}

				.sc-source {
					flex: 0 0 auto;
					font-weight: 700;
					font-size: 8px;
					background: var(--dark);
					color: #fff;
					border-radius: 3px;
					padding: 1px 3px;
					line-height: 1;
				}

				.sc-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					flex: 0 0 auto;
					display: inline-block;
				}

				.sc-dot.ov {
					background: #fe2c23;
				}

				.sc-dot.due {
					background: #f5a623;
				}

				.sc-add {
					border: 1px dashed #c9d3df;
					background: none;
					border-radius: 7px;
					color: var(--muted);
					font-family: 'Montserrat', sans-serif;
					font-weight: 700;
					font-size: 11px;
					padding: 5px;
					cursor: pointer;
				}

				.sc-add:hover {
					border-color: var(--blue);
					color: var(--blue);
				}

				.amodal-overlay {
					position: fixed;
					inset: 0;
					background: rgba(18, 21, 103, 0.34);
					display: none;
					align-items: flex-start;
					justify-content: center;
					z-index: 2000;
					padding: 40px 20px;
					overflow: auto;
				}

				.amodal-overlay.open {
					display: flex;
				}

				.amodal {
					background: #fff;
					border-radius: 14px;
					width: 100%;
					max-width: 620px;
					box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
					margin: auto;
					overflow: hidden;
				}

				.amodal-head {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 20px 24px 14px;
				}

				.amodal-head h3 {
					margin: 0;
					font-weight: 800;
					font-size: 17px;
					color: var(--dark);
				}

				.amodal-x {
					border: none;
					background: none;
					font-size: 24px;
					line-height: 1;
					color: var(--muted);
					cursor: pointer;
				}

				.amodal-sub {
					padding: 0 24px 14px;
					font-size: 12.5px;
					color: var(--muted);
					border-bottom: 1px solid var(--border);
				}

				.amodal-list {
					max-height: 52vh;
					overflow: auto;
					padding: 8px 12px;
				}

				.asg-item {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 10px 12px;
					border-radius: 9px;
					cursor: pointer;
					font-size: 12px;
					border: 1px solid transparent;
				}

				.asg-item:hover {
					background: #f8fbff;
				}

				.asg-item.on {
					background: #f1f6fc;
					border-color: #cfe6f7;
				}

				.asg-item.disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.asg-item input {
					width: 16px;
					height: 16px;
					flex: 0 0 auto;
					cursor: pointer;
				}

				.asg-source {
					flex: 0 0 auto;
					font-weight: 700;
					font-size: 8px;
					background: var(--dark);
					color: #fff;
					border-radius: 3px;
					padding: 2px 4px;
					line-height: 1;
				}

				.asg-id {
					font-weight: 700;
					color: var(--dark);
					min-width: 80px;
					flex: 0 0 auto;
				}

				.asg-client {
					flex: 1;
					color: var(--text);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					min-width: 0;
				}

				.asg-val {
					font-weight: 600;
					color: var(--text);
					white-space: nowrap;
					font-size: 11px;
					flex: 0 0 auto;
				}

				.asg-status {
					font-weight: 700;
					font-size: 10px;
					white-space: nowrap;
					min-width: 50px;
					text-align: right;
					flex: 0 0 auto;
				}

				.asg-status.ov {
					color: #fe2c23;
				}

				.asg-status.due {
					color: #c77e12;
				}

				.asg-note {
					font-size: 10px;
					color: var(--muted);
					font-style: italic;
					white-space: nowrap;
					flex: 0 0 auto;
				}

				.amodal-foot {
					display: flex;
					justify-content: flex-end;
					gap: 10px;
					padding: 16px 24px;
					border-top: 1px solid var(--border);
					background: #f8fbff;
				}
			`}</style>
		</MainLayout>
	);
}
