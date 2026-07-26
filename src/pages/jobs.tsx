import MainLayout from '@/components/MainLayout';
import {
	createJob,
	CreateJobData,
	deleteJob,
	getJobs,
	Job,
	updateJob,
	UpdateJobData,
} from '@/lib/jobs';
import { useCallback, useEffect, useState } from 'react';

export default function Jobs() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [titleFilter, setTitleFilter] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [editingJob, setEditingJob] = useState<Job | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage] = useState(10);

	const [jobData, setJobData] = useState<CreateJobData>({
		title: '',
		department: '',
		location: '',
		locations: [],
		type: 'Full Time',
		salaryRange: '',
		probationPeriod: '',
		intro: '',
		responsibilities: [],
		qualifications: [],
		outro: '',
		isActive: true,
	});

	const fetchJobs = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getJobs(currentPage, itemsPerPage, titleFilter || undefined);
			if (response.status === 'success' && response.statusCode === 200) {
				setJobs(response.data || []);
				if (response.pagination) {
					setTotalPages(response.pagination.totalPages);
					setTotalItems(response.pagination.totalItems);
				}
				setError('');
			} else {
				setError(response.error || 'Failed to fetch jobs');
				setJobs([]);
			}
		} catch {
			setError('Failed to fetch jobs');
			setJobs([]);
		} finally {
			setLoading(false);
		}
	}, [currentPage, itemsPerPage, titleFilter]);

	useEffect(() => {
		fetchJobs();
	}, [fetchJobs]);

	const handleCreateJob = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result = await createJob(jobData);
			if (result.status === 'success' && result.statusCode === 201) {
				setShowModal(false);
				setJobData({
					title: '',
					department: '',
					location: '',
					locations: [],
					type: 'Full Time',
					salaryRange: '',
					probationPeriod: '',
					intro: '',
					responsibilities: [],
					qualifications: [],
					outro: '',
					isActive: true,
				});
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to create job');
			}
		} catch {
			setError('Failed to create job');
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditJob = (job: Job) => {
		setEditingJob(job);
		setJobData({
			title: job.title,
			department: job.department,
			location: job.location,
			locations: job.locations,
			type: job.type,
			salaryRange: job.salaryRange,
			probationPeriod: job.probationPeriod,
			intro: job.intro,
			responsibilities: job.responsibilities,
			qualifications: job.qualifications,
			outro: job.outro,
			isActive: job.isActive,
		});
		setShowModal(true);
	};

	const handleUpdateJob = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingJob) return;

		setSubmitting(true);

		try {
			const updateData: UpdateJobData = {
				title: jobData.title,
				department: jobData.department,
				location: jobData.location,
				locations: jobData.locations,
				type: jobData.type,
				salaryRange: jobData.salaryRange,
				probationPeriod: jobData.probationPeriod,
				intro: jobData.intro,
				responsibilities: jobData.responsibilities,
				qualifications: jobData.qualifications,
				outro: jobData.outro,
				isActive: jobData.isActive,
			};

			const result = await updateJob(editingJob._id, updateData);
			if (result.status === 'success' && result.statusCode === 200) {
				setShowModal(false);
				setEditingJob(null);
				setJobData({
					title: '',
					department: '',
					location: '',
					locations: [],
					type: 'Full Time',
					salaryRange: '',
					probationPeriod: '',
					intro: '',
					responsibilities: [],
					qualifications: [],
					outro: '',
					isActive: true,
				});
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to update job');
			}
		} catch {
			setError('Failed to update job');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteJob = async (id: string) => {
		setSubmitting(true);
		try {
			const result = await deleteJob(id);
			if (result.status === 'success' && result.statusCode === 200) {
				setDeleteConfirm(null);
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to delete job');
			}
		} catch {
			setError('Failed to delete job');
		} finally {
			setSubmitting(false);
		}
	};

	const filteredJobs = jobs.filter((job) => {
		const query = titleFilter.toLowerCase();
		return job.title.toLowerCase().includes(query) || job.department.toLowerCase().includes(query);
	});

	return (
		<>
			<MainLayout title="Career">
				<style jsx global>{`
					.chip {
						display: inline-flex;
						align-items: center;
						gap: 6px;
						font-weight: 700;
						font-size: 11px;
						padding: 4px 11px;
						border-radius: 100px;
						white-space: nowrap;
					}
					.chip .cdot {
						width: 6px;
						height: 6px;
						border-radius: 50%;
						background: currentColor;
					}
					.chip.green { background: #E7F7EE; color: #1F8A4D; }
					.chip.grey { background: #EEF1F5; color: #697789; }
					.tag {
						display: inline-block;
						font-weight: 600;
						font-size: 11px;
						padding: 3px 9px;
						border-radius: 6px;
						background: #EEF1F5;
						color: #5A6675;
					}
				`}</style>

				{/* Header */}
				<div style={{
					display: 'flex',
					alignItems: 'center',
					marginBottom: '24px'
				}}>
					<div style={{ flex: 1 }}>
						<h1 style={{
							margin: 0,
							fontWeight: 800,
							fontSize: '24px',
							color: 'var(--dark)'
						}}>
							Career
						</h1>
						<div style={{
							fontSize: '13px',
							color: 'var(--muted)',
							marginTop: '4px'
						}}>
							{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
						</div>
					</div>
					<button
						onClick={() => {
							setEditingJob(null);
							setJobData({
								title: '',
								department: '',
								location: '',
								locations: [],
								type: 'Full Time',
								salaryRange: '',
								probationPeriod: '',
								intro: '',
								responsibilities: [],
								qualifications: [],
								outro: '',
								isActive: true,
							});
							setShowModal(true);
						}}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							height: '38px',
							padding: '0 18px',
							border: 'none',
							borderRadius: '9px',
							cursor: 'pointer',
							fontFamily: "'Montserrat', sans-serif",
							fontWeight: 700,
							fontSize: '13px',
							color: '#fff',
							background: 'var(--grad)',
							transition: '0.18s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.filter = 'brightness(1.07)';
							e.currentTarget.style.transform = 'translateY(-1px)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.filter = 'none';
							e.currentTarget.style.transform = 'none';
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
							<path d="M12 5v14M5 12h14"/>
						</svg>
						Buka Lowongan
					</button>
				</div>

				{error && (
					<div style={{
						background: '#FDECEA',
						border: '1px solid #FE2C23',
						borderRadius: '9px',
						padding: '12px 16px',
						marginBottom: '18px'
					}}>
						<div style={{
							fontSize: '13px',
							color: '#FE2C23',
							fontWeight: 600
						}}>
							{error}
						</div>
					</div>
				)}

				{/* Main Card */}
				<div style={{
					background: 'white',
					border: '1px solid var(--border)',
					borderRadius: '12px',
					padding: '24px 28px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
				}}>
					{/* Toolbar */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						flexWrap: 'wrap',
						marginBottom: '18px'
					}}>
						<div style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							height: '38px',
							padding: '0 14px',
							background: '#fff',
							border: '1px solid var(--border)',
							borderRadius: '9px',
							minWidth: '240px',
							color: 'var(--muted)'
						}}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="11" cy="11" r="7"/>
								<path d="m21 21-4.3-4.3"/>
							</svg>
							<input
								value={titleFilter}
								onChange={(e) => setTitleFilter(e.target.value)}
								placeholder="Cari posisi..."
								style={{
									border: 'none',
									outline: 'none',
									fontFamily: "'Montserrat', sans-serif",
									fontSize: '13px',
									color: 'var(--text)',
									width: '100%',
									background: 'transparent'
								}}
							/>
						</div>
						<div style={{ flex: 1 }}></div>
						<span style={{
							display: 'inline-block',
							fontSize: '12px',
							color: 'var(--muted)',
							background: 'var(--bg)',
							borderRadius: '100px',
							padding: '5px 12px'
						}}>
							Pelamar masuk ke HRGA › Pelamar
						</span>
					</div>

					{/* Table */}
					{loading ? (
						<div style={{
							display: 'flex',
							justifyContent: 'center',
							padding: '48px 20px',
							color: 'var(--muted)'
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								<div style={{
									width: '32px',
									height: '32px',
									border: '4px solid rgba(28, 167, 236, 0.3)',
									borderTopColor: '#1ca7ec',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite'
								}}></div>
								<span>Memuat jobs...</span>
							</div>
						</div>
					) : filteredJobs.length === 0 ? (
						<div style={{
							textAlign: 'center',
							color: 'var(--muted)',
							padding: '48px 20px'
						}}>
							Tidak ada job yang ditemukan
						</div>
					) : (
						<table style={{
							width: '100%',
							borderCollapse: 'collapse'
						}}>
							<thead>
								<tr>
									<th style={{
										textAlign: 'left',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Posisi
									</th>
									<th style={{
										textAlign: 'left',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Departemen
									</th>
									<th style={{
										textAlign: 'left',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Tipe
									</th>
									<th style={{
										textAlign: 'left',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Lokasi
									</th>
									<th style={{
										textAlign: 'right',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Pelamar
									</th>
									<th style={{
										textAlign: 'left',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										color: 'var(--muted)',
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)',
										whiteSpace: 'nowrap'
									}}>
										Status
									</th>
									<th style={{
										padding: '0 14px 12px',
										borderBottom: '1px solid var(--border)'
									}}></th>
								</tr>
							</thead>
							<tbody>
								{filteredJobs.map((job) => (
									<tr
										key={job._id}
										style={{
											transition: 'background 0.15s ease'
										}}
										onMouseEnter={(e) => e.currentTarget.style.background = '#F8FBFF'}
										onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
									>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle',
											fontWeight: 600
										}}>
											{job.title}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--muted)',
											verticalAlign: 'middle'
										}}>
											{job.department}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											verticalAlign: 'middle'
										}}>
											<span className="tag">{job.type}</span>
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--muted)',
											verticalAlign: 'middle'
										}}>
											{job.location}
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle',
											textAlign: 'right',
											fontWeight: 600
										}}>
											0
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											verticalAlign: 'middle'
										}}>
											<span className={`chip ${job.isActive ? 'green' : 'grey'}`}>
												<span className="cdot"></span>
												{job.isActive ? 'Open' : 'Closed'}
											</span>
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle',
											textAlign: 'right'
										}}>
											<div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
												<button
													onClick={() => handleEditJob(job)}
													style={{
														display: 'inline-flex',
														alignItems: 'center',
														gap: '8px',
														height: '32px',
														padding: '0 13px',
														borderRadius: '8px',
														cursor: 'pointer',
														fontFamily: "'Montserrat', sans-serif",
														fontWeight: 700,
														fontSize: '12px',
														background: '#fff',
														border: '1px solid var(--border)',
														color: 'var(--text)',
														transition: '0.18s'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.borderColor = 'var(--blue)';
														e.currentTarget.style.color = 'var(--blue)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.borderColor = 'var(--border)';
														e.currentTarget.style.color = 'var(--text)';
													}}
												>
													Kelola
												</button>
												<button
													onClick={() => setDeleteConfirm(job._id)}
													style={{
														width: '30px',
														height: '30px',
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent: 'center',
														border: '1px solid var(--border)',
														borderRadius: '7px',
														background: '#fff',
														color: 'var(--muted)',
														cursor: 'pointer',
														transition: '0.18s'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.borderColor = 'var(--red)';
														e.currentTarget.style.color = 'var(--red)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.borderColor = 'var(--border)';
														e.currentTarget.style.color = 'var(--muted)';
													}}
												>
													<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				{/* Summary */}
				{!loading && jobs.length > 0 && (
					<div style={{
						marginTop: '16px',
						fontSize: '13px',
						color: 'var(--muted)',
						textAlign: 'right'
					}}>
						Total lowongan: <span style={{ fontWeight: 700, color: 'var(--text)' }}>
							{totalItems}
						</span>
					</div>
				)}
			</MainLayout>

			{/* Create/Edit Job Modal */}
			{showModal && (
				<div style={{
					position: 'fixed',
					inset: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 50,
					padding: '16px'
				}}>
					<div style={{
						background: 'white',
						borderRadius: '12px',
						padding: '24px 28px',
						width: '100%',
						maxWidth: '800px',
						maxHeight: '90vh',
						overflowY: 'auto'
					}}>
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '24px'
						}}>
							<h3 style={{
								fontWeight: 700,
								fontSize: '18px',
								color: 'var(--dark)',
								margin: 0
							}}>
								{editingJob ? 'Edit Lowongan' : 'Buka Lowongan Baru'}
							</h3>
							<button
								onClick={() => {
									setShowModal(false);
									setEditingJob(null);
								}}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--muted)',
									padding: 0
								}}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M18 6L6 18M6 6l12 12"/>
								</svg>
							</button>
						</div>
						<form onSubmit={editingJob ? handleUpdateJob : handleCreateJob}>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px 22px' }}>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Judul Pekerjaan *
									</label>
									<input
										type="text"
										required
										value={jobData.title}
										onChange={(e) => setJobData((prev) => ({ ...prev, title: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%'
										}}
										onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Department *
									</label>
									<input
										type="text"
										required
										value={jobData.department}
										onChange={(e) => setJobData((prev) => ({ ...prev, department: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%'
										}}
										onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Type *
									</label>
									<select
										required
										value={jobData.type}
										onChange={(e) => setJobData((prev) => ({ ...prev, type: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%'
										}}
										onFocus={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
									>
										<option value="Full Time">Full Time</option>
										<option value="Part Time">Part Time</option>
										<option value="Contract">Contract</option>
										<option value="Internship">Internship</option>
									</select>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Lokasi *
									</label>
									<input
										type="text"
										required
										value={jobData.location}
										onChange={(e) => setJobData((prev) => ({ ...prev, location: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%'
										}}
										onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Salary Range *
									</label>
									<input
										type="text"
										required
										placeholder="e.g., Rp 5,000,000 - Rp 7,000,000"
										value={jobData.salaryRange}
										onChange={(e) => setJobData((prev) => ({ ...prev, salaryRange: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%'
										}}
										onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Introduction *
									</label>
									<textarea
										required
										rows={3}
										value={jobData.intro}
										onChange={(e) => setJobData((prev) => ({ ...prev, intro: e.target.value }))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%',
											resize: 'vertical'
										}}
										onFocus={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Responsibilities (one per line) *
									</label>
									<textarea
										required
										rows={5}
										placeholder="Enter each responsibility on a new line"
										value={jobData.responsibilities.join('\n')}
										onChange={(e) => setJobData((prev) => ({
											...prev,
											responsibilities: e.target.value.split('\n').filter(s => s.trim())
										}))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%',
											resize: 'vertical'
										}}
										onFocus={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Qualifications (one per line) *
									</label>
									<textarea
										required
										rows={5}
										placeholder="Enter each qualification on a new line"
										value={jobData.qualifications.join('\n')}
										onChange={(e) => setJobData((prev) => ({
											...prev,
											qualifications: e.target.value.split('\n').filter(s => s.trim())
										}))}
										style={{
											fontFamily: "'Montserrat', sans-serif",
											fontSize: '13px',
											color: 'var(--text)',
											border: '1px solid var(--border)',
											borderRadius: '9px',
											padding: '10px 13px',
											background: '#fff',
											outline: 'none',
											transition: 'border-color 0.18s',
											width: '100%',
											resize: 'vertical'
										}}
										onFocus={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
										onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
									/>
								</div>
								<div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
									<input
										type="checkbox"
										id="isActive"
										checked={jobData.isActive}
										onChange={(e) => setJobData((prev) => ({ ...prev, isActive: e.target.checked }))}
										style={{
											width: '16px',
											height: '16px',
											cursor: 'pointer'
										}}
									/>
									<label htmlFor="isActive" style={{ fontSize: '13px', color: 'var(--text)', cursor: 'pointer' }}>
										Active Job Posting
									</label>
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
								<button
									type="button"
									onClick={() => {
										setShowModal(false);
										setEditingJob(null);
									}}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily: "'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border: '1px solid var(--border)',
										color: 'var(--text)',
										transition: '0.18s'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor = 'var(--blue)';
										e.currentTarget.style.color = 'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor = 'var(--border)';
										e.currentTarget.style.color = 'var(--text)';
									}}
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={submitting}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting ? 'not-allowed' : 'pointer',
										fontFamily: "'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background: 'var(--grad)',
										transition: '0.18s',
										opacity: submitting ? 0.5 : 1
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter = 'brightness(1.07)';
											e.currentTarget.style.transform = 'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter = 'none';
											e.currentTarget.style.transform = 'none';
										}
									}}
								>
									{submitting ? 'Menyimpan...' : editingJob ? 'Update' : 'Buat Lowongan'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div style={{
					position: 'fixed',
					inset: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 50
				}}>
					<div style={{
						background: 'white',
						borderRadius: '12px',
						padding: '24px 28px',
						width: '100%',
						maxWidth: '400px',
						margin: '0 16px'
					}}>
						<div style={{ marginBottom: '20px' }}>
							<h3 style={{
								fontWeight: 700,
								fontSize: '18px',
								color: 'var(--dark)',
								margin: '0 0 10px'
							}}>
								Konfirmasi Hapus
							</h3>
							<p style={{
								fontSize: '13px',
								color: 'var(--muted)',
								margin: 0
							}}>
								Apakah Anda yakin ingin menghapus lowongan ini? Tindakan ini tidak dapat dibatalkan.
							</p>
						</div>
						<div style={{ display: 'flex', gap: '10px' }}>
							<button
								onClick={() => setDeleteConfirm(null)}
								disabled={submitting}
								style={{
									flex: 1,
									height: '38px',
									borderRadius: '9px',
									cursor: submitting ? 'not-allowed' : 'pointer',
									fontFamily: "'Montserrat', sans-serif",
									fontWeight: 700,
									fontSize: '13px',
									background: '#fff',
									border: '1px solid var(--border)',
									color: 'var(--text)',
									transition: '0.18s',
									opacity: submitting ? 0.5 : 1
								}}
								onMouseEnter={(e) => {
									if (!submitting) {
										e.currentTarget.style.borderColor = 'var(--blue)';
										e.currentTarget.style.color = 'var(--blue)';
									}
								}}
								onMouseLeave={(e) => {
									if (!submitting) {
										e.currentTarget.style.borderColor = 'var(--border)';
										e.currentTarget.style.color = 'var(--text)';
									}
								}}
							>
								Batal
							</button>
							<button
								onClick={() => handleDeleteJob(deleteConfirm)}
								disabled={submitting}
								style={{
									flex: 1,
									height: '38px',
									border: 'none',
									borderRadius: '9px',
									cursor: submitting ? 'not-allowed' : 'pointer',
									fontFamily: "'Montserrat', sans-serif",
									fontWeight: 700,
									fontSize: '13px',
									color: '#fff',
									background: 'var(--red)',
									transition: '0.18s',
									opacity: submitting ? 0.5 : 1
								}}
								onMouseEnter={(e) => {
									if (!submitting) {
										e.currentTarget.style.filter = 'brightness(1.07)';
									}
								}}
								onMouseLeave={(e) => {
									if (!submitting) {
										e.currentTarget.style.filter = 'none';
									}
								}}
							>
								{submitting ? 'Menghapus...' : 'Hapus'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
