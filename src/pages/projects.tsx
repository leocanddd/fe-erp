import MainLayout from '@/components/MainLayout';
import {
	getProjects,
	Project,
	ProjectFilters,
} from '@/lib/projects';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Projects() {
	const [projects, setProjects] =
		useState<Project[]>([]);
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
		useState<ProjectFilters>({
			page: 1,
			limit: 10,
			projectName: '',
		});

	const fetchProjects =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getProjects(filters);
				if (
					response.statusCode === 200 &&
					response.data
				) {
					setProjects(
						response.data.projects
					);
					setCurrentPage(
						response.data.pagination
							.currentPage
					);
					setTotalPages(
						response.data.pagination
							.totalPages
					);
					setTotalItems(
						response.data.pagination
							.totalItems
					);
					setItemsPerPage(
						response.data.pagination
							.itemsPerPage
					);
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch projects'
					);
					setProjects([]);
				}
			} catch {
				setError(
					'Failed to fetch projects'
				);
				setProjects([]);
			} finally {
				setLoading(false);
			}
		}, [filters]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleFilterChange = (
		key: keyof ProjectFilters,
		value: string | number
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			page:
				key !== 'page'
					? 1
					: typeof value === 'number'
					? value
					: 1,
		}));
	};

	const handleSearch = (
		e: React.FormEvent
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
			projectName: '',
		});
	};

	const handlePageChange = (
		page: number
	) => {
		if (
			page >= 1 &&
			page <= totalPages
		) {
			handleFilterChange('page', page);
		}
	};

	const handleLimitChange = (
		limit: number
	) => {
		handleFilterChange('limit', limit);
	};

	const renderPagination = () => {
		const pages = [];
		const maxVisiblePages = 5;

		let startPage = Math.max(
			1,
			currentPage -
				Math.floor(maxVisiblePages / 2)
		);
		const endPage = Math.min(
			totalPages,
			startPage + maxVisiblePages - 1
		);

		if (
			endPage - startPage + 1 <
			maxVisiblePages
		) {
			startPage = Math.max(
				1,
				endPage - maxVisiblePages + 1
			);
		}

		for (
			let i = startPage;
			i <= endPage;
			i++
		) {
			pages.push(
				<button
					key={i}
					onClick={() =>
						handlePageChange(i)
					}
					style={{
						padding: '6px 12px',
						margin: '0 4px',
						borderRadius: '6px',
						border: 'none',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontSize: '13px',
						fontWeight: 600,
						transition: '0.18s',
						background: i === currentPage ? 'var(--grad)' : '#E5E7EB',
						color: i === currentPage ? '#fff' : 'var(--text)'
					}}
					onMouseEnter={(e) => {
						if (i !== currentPage) {
							e.currentTarget.style.background = '#D1D5DB';
						}
					}}
					onMouseLeave={(e) => {
						if (i !== currentPage) {
							e.currentTarget.style.background = '#E5E7EB';
						}
					}}
				>
					{i}
				</button>
			);
		}

		return (
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginTop: '24px',
				padding: '16px 0'
			}}>
				<div style={{
					fontSize: '13px',
					color: 'var(--muted)'
				}}>
					Menampilkan{' '}
					{Math.min(
						(currentPage - 1) *
							itemsPerPage +
							1,
						totalItems
					)}{' '}
					-{' '}
					{Math.min(
						currentPage * itemsPerPage,
						totalItems
					)}{' '}
					dari {totalItems} projects
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<button
						onClick={() =>
							handlePageChange(
								currentPage - 1
							)
						}
						disabled={currentPage === 1}
						style={{
							padding: '6px 12px',
							margin: '0 4px',
							borderRadius: '6px',
							border: 'none',
							cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
							fontFamily: "'Montserrat', sans-serif",
							fontSize: '13px',
							fontWeight: 600,
							transition: '0.18s',
							background: '#E5E7EB',
							color: 'var(--text)',
							opacity: currentPage === 1 ? 0.5 : 1
						}}
						onMouseEnter={(e) => {
							if (currentPage !== 1) {
								e.currentTarget.style.background = '#D1D5DB';
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = '#E5E7EB';
						}}
					>
						Previous
					</button>
					{pages}
					<button
						onClick={() =>
							handlePageChange(
								currentPage + 1
							)
						}
						disabled={
							currentPage === totalPages
						}
						style={{
							padding: '6px 12px',
							margin: '0 4px',
							borderRadius: '6px',
							border: 'none',
							cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
							fontFamily: "'Montserrat', sans-serif",
							fontSize: '13px',
							fontWeight: 600,
							transition: '0.18s',
							background: '#E5E7EB',
							color: 'var(--text)',
							opacity: currentPage === totalPages ? 0.5 : 1
						}}
						onMouseEnter={(e) => {
							if (currentPage !== totalPages) {
								e.currentTarget.style.background = '#D1D5DB';
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = '#E5E7EB';
						}}
					>
						Next
					</button>
				</div>
			</div>
		);
	};

	return (
		<MainLayout title="Projects">
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
						Projects
					</h1>
					<div style={{
						fontSize: '13px',
						color: 'var(--muted)',
						marginTop: '4px'
					}}>
						{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
					</div>
				</div>
			</div>

			{/* Filters */}
			<div style={{
				background: '#fff',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
				marginBottom: '18px'
			}}>
				<form onSubmit={handleSearch}>
					<div style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: '16px',
						alignItems: 'flex-end'
					}}>
						<div style={{ flex: 1, minWidth: '250px' }}>
							<label style={{
								display: 'block',
								fontSize: '12px',
								fontWeight: 600,
								color: 'var(--dark)',
								marginBottom: '8px'
							}}>
								Nama Project
							</label>
							<input
								type="text"
								value={filters.projectName}
								onChange={(e) =>
									handleFilterChange(
										'projectName',
										e.target.value
									)
								}
								style={{
									width: '100%',
									height: '38px',
									padding: '0 14px',
									border: '1px solid var(--border)',
									borderRadius: '9px',
									fontFamily: "'Montserrat', sans-serif",
									fontSize: '13px',
									color: 'var(--text)',
									outline: 'none',
									transition: '0.18s'
								}}
								placeholder="Cari nama project..."
								onFocus={(e) => {
									e.currentTarget.style.borderColor = 'var(--blue)';
									e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28,167,236,0.1)';
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = 'var(--border)';
									e.currentTarget.style.boxShadow = 'none';
								}}
							/>
						</div>

						<div style={{ width: '180px' }}>
							<label style={{
								display: 'block',
								fontSize: '12px',
								fontWeight: 600,
								color: 'var(--dark)',
								marginBottom: '8px'
							}}>
								Items per page
							</label>
							<select
								value={filters.limit}
								onChange={(e) =>
									handleLimitChange(
										parseInt(e.target.value)
									)
								}
								style={{
									width: '100%',
									height: '38px',
									padding: '0 14px',
									border: '1px solid var(--border)',
									borderRadius: '9px',
									fontFamily: "'Montserrat', sans-serif",
									fontSize: '13px',
									color: 'var(--text)',
									outline: 'none',
									background: '#fff',
									cursor: 'pointer',
									transition: '0.18s'
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = 'var(--blue)';
									e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28,167,236,0.1)';
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = 'var(--border)';
									e.currentTarget.style.boxShadow = 'none';
								}}
							>
								<option value="10">10</option>
								<option value="25">25</option>
								<option value="50">50</option>
								<option value="100">100</option>
							</select>
						</div>

						<div style={{ display: 'flex', gap: '8px' }}>
							<button
								type="submit"
								style={{
									display: 'inline-flex',
									alignItems: 'center',
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
									transition: '0.18s',
									whiteSpace: 'nowrap'
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
								Search
							</button>
							<button
								type="button"
								onClick={clearFilters}
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									height: '38px',
									padding: '0 18px',
									border: '1px solid var(--border)',
									borderRadius: '9px',
									cursor: 'pointer',
									fontFamily: "'Montserrat', sans-serif",
									fontWeight: 700,
									fontSize: '13px',
									color: 'var(--text)',
									background: '#fff',
									transition: '0.18s',
									whiteSpace: 'nowrap'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#F3F4F6';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = '#fff';
								}}
							>
								Clear
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Error Message */}
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

			{/* Projects Table */}
			<section style={{
				background: '#fff',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}>
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
							<span>Memuat projects...</span>
						</div>
					</div>
				) : !projects || projects.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						No projects found
					</div>
				) : (
					<>
						<div style={{ overflowX: 'auto' }}>
							<table style={{
								width: '100%',
								borderCollapse: 'collapse',
								background: '#fff'
							}}>
								<thead>
									<tr style={{ background: '#fff' }}>
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
											Project Name
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
											Location
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
											PIC
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
											Contact
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
											Created By
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
											Last Updated By
										</th>
									</tr>
								</thead>
								<tbody>
									{projects.map((project) => (
										<tr
											key={project.id}
											style={{ background: '#fff', transition: 'background 0.15s ease' }}
											onMouseEnter={(e) => e.currentTarget.style.background = '#F8FBFF'}
											onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
										>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												verticalAlign: 'middle'
											}}>
												<div style={{
													fontWeight: 700,
													fontSize: '13.5px',
													color: 'var(--dark)'
												}}>
													{project.projectName}
												</div>
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{project.location}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												{project.pic}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												{project.contact}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												<span style={{
													display: 'inline-block',
													fontWeight: 600,
													fontSize: '11px',
													padding: '3px 9px',
													borderRadius: '6px',
													background: '#e6f4fc',
													color: '#1573a8',
													textTransform: 'capitalize'
												}}>
													{project.status || '-'}
												</span>
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												{project.createdBy || '-'}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												{project.updatedBy || '-'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && renderPagination()}
					</>
				)}
			</section>
		</MainLayout>
	);
}
