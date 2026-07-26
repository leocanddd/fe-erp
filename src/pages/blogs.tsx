import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getMenuPermissions } from '@/lib/navigation';
import { Blog } from '@/types/blog';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

export default function Blogs() {
	const router = useRouter();
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
	const [approveLoading, setApproveLoading] = useState<string | null>(null);
	const [canApproveBlog, setCanApproveBlog] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [allBlogsCount, setAllBlogsCount] = useState({ all: 0, pending: 0, approved: 0 });

	useEffect(() => {
		const user = getStoredUser();
		if (user) {
			const permissions = getMenuPermissions();
			const approveRoles = permissions['/blogs/approve'] ?? [5, 12];
			setCanApproveBlog(approveRoles.includes(user.role));
		}
		fetchBlogs();
	}, [activeTab, currentPage]);

	const fetchBlogs = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');

			// Build query params
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: itemsPerPage.toString(),
			});

			// Add filter based on active tab
			if (activeTab === 'pending') {
				params.append('isApproved', 'false');
			} else if (activeTab === 'approved') {
				params.append('isApproved', 'true');
			}

			const response = await fetch(`/api/blogs?${params.toString()}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch blogs');
			}

			const data = await response.json();
			const blogsData = data.data || data || [];
			const normalizedBlogs = Array.isArray(blogsData)
				? blogsData.map((blog: Blog & { id?: string }) => ({
						...blog,
						_id: blog._id || blog.id || '',
				  }))
				: [];
			setBlogs(normalizedBlogs);

			// Set pagination data from API
			if (data.pagination) {
				setTotalPages(data.pagination.totalPages);
				setTotalItems(data.pagination.totalItems);
				setItemsPerPage(data.pagination.itemsPerPage);
			}

			// Fetch counts for tabs if we don't have them
			fetchBlogCounts();

			setError('');
		} catch (err) {
			console.error('Error fetching blogs:', err);
			setError('Failed to fetch blogs');
			setBlogs([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchBlogCounts = async () => {
		try {
			const token = localStorage.getItem('token');

			// Fetch all counts in parallel
			const [allRes, pendingRes, approvedRes] = await Promise.all([
				fetch('/api/blogs?limit=1', {
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch('/api/blogs?limit=1&isApproved=false', {
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch('/api/blogs?limit=1&isApproved=true', {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			const [allData, pendingData, approvedData] = await Promise.all([
				allRes.json(),
				pendingRes.json(),
				approvedRes.json(),
			]);

			setAllBlogsCount({
				all: allData.pagination?.totalItems || 0,
				pending: pendingData.pagination?.totalItems || 0,
				approved: approvedData.pagination?.totalItems || 0,
			});
		} catch (err) {
			console.error('Error fetching blog counts:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Yakin ingin menghapus blog ini?')) {
			return;
		}

		setDeleteLoading(id);
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to delete blog');
			}

			fetchBlogs();
		} catch (err) {
			console.error('Error deleting blog:', err);
			alert('Gagal menghapus blog');
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleApprove = async (id: string, currentStatus: boolean) => {
		const newStatus = !currentStatus;

		setApproveLoading(id);
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					isApproved: newStatus,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update approval status');
			}

			fetchBlogs();
		} catch (err) {
			console.error('Error updating approval status:', err);
			alert('Gagal mengubah status approval');
		} finally {
			setApproveLoading(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Pagination display calculations
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	// Reset to page 1 when changing tabs
	const handleTabChange = (tab: 'all' | 'pending' | 'approved') => {
		setActiveTab(tab);
		setCurrentPage(1);
	};

	return (
		<MainLayout title="Blogs">
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
				.chip.amber { background: #FEF3E0; color: #C77E12; }
				.chip.grey { background: #EEF1F5; color: #697789; }
				.tag-mini {
					display: inline-block;
					font-weight: 600;
					font-size: 10px;
					padding: 2px 7px;
					border-radius: 5px;
					background: #EEF1F5;
					color: #5A6675;
					margin-right: 4px;
					margin-bottom: 2px;
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
						Blogs
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
					onClick={() => router.push('/blogs/new')}
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
					Tulis Blog
				</button>
			</div>

			{/* Tabs */}
			<div style={{
				display: 'flex',
				gap: '8px',
				marginBottom: '24px'
			}}>
				<button
					onClick={() => handleTabChange('all')}
					style={{
						height: '38px',
						padding: '0 18px',
						borderRadius: '9px',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontWeight: 700,
						fontSize: '13px',
						background: activeTab === 'all' ? 'var(--grad)' : '#fff',
						color: activeTab === 'all' ? '#fff' : 'var(--text)',
						transition: '0.18s',
						boxShadow: activeTab === 'all' ? '0 2px 8px rgba(28, 167, 236, 0.3)' : 'none',
						border: activeTab === 'all' ? 'none' : '1px solid var(--border)'
					}}
					onMouseEnter={(e) => {
						if (activeTab !== 'all') {
							e.currentTarget.style.borderColor = 'var(--blue)';
							e.currentTarget.style.color = 'var(--blue)';
						}
					}}
					onMouseLeave={(e) => {
						if (activeTab !== 'all') {
							e.currentTarget.style.borderColor = 'var(--border)';
							e.currentTarget.style.color = 'var(--text)';
						}
					}}
				>
					Semua ({allBlogsCount.all})
				</button>
				<button
					onClick={() => handleTabChange('pending')}
					style={{
						height: '38px',
						padding: '0 18px',
						borderRadius: '9px',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontWeight: 700,
						fontSize: '13px',
						background: activeTab === 'pending' ? 'var(--grad)' : '#fff',
						color: activeTab === 'pending' ? '#fff' : 'var(--text)',
						transition: '0.18s',
						boxShadow: activeTab === 'pending' ? '0 2px 8px rgba(28, 167, 236, 0.3)' : 'none',
						border: activeTab === 'pending' ? 'none' : '1px solid var(--border)'
					}}
					onMouseEnter={(e) => {
						if (activeTab !== 'pending') {
							e.currentTarget.style.borderColor = 'var(--blue)';
							e.currentTarget.style.color = 'var(--blue)';
						}
					}}
					onMouseLeave={(e) => {
						if (activeTab !== 'pending') {
							e.currentTarget.style.borderColor = 'var(--border)';
							e.currentTarget.style.color = 'var(--text)';
						}
					}}
				>
					Waiting For Review ({allBlogsCount.pending})
				</button>
				<button
					onClick={() => handleTabChange('approved')}
					style={{
						height: '38px',
						padding: '0 18px',
						borderRadius: '9px',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontWeight: 700,
						fontSize: '13px',
						background: activeTab === 'approved' ? 'var(--grad)' : '#fff',
						color: activeTab === 'approved' ? '#fff' : 'var(--text)',
						transition: '0.18s',
						boxShadow: activeTab === 'approved' ? '0 2px 8px rgba(28, 167, 236, 0.3)' : 'none',
						border: activeTab === 'approved' ? 'none' : '1px solid var(--border)'
					}}
					onMouseEnter={(e) => {
						if (activeTab !== 'approved') {
							e.currentTarget.style.borderColor = 'var(--blue)';
							e.currentTarget.style.color = 'var(--blue)';
						}
					}}
					onMouseLeave={(e) => {
						if (activeTab !== 'approved') {
							e.currentTarget.style.borderColor = 'var(--border)';
							e.currentTarget.style.color = 'var(--text)';
						}
					}}
				>
					Approved ({allBlogsCount.approved})
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
							<span>Memuat blogs...</span>
						</div>
					</div>
				) : blogs.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						Tidak ada blog yang ditemukan
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
									Judul
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
									Penulis
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
									Tags
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
									Produk Terkait
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
									Tanggal
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
							{blogs.map((blog) => (
								<tr
									key={blog._id}
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
										fontWeight: 600,
										maxWidth: '250px'
									}}>
										<div style={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}>
											{blog.title}
										</div>
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{blog.author}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										verticalAlign: 'middle'
									}}>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
											{blog.tags && blog.tags.slice(0, 3).map((tag, index) => (
												<span key={index} className="tag-mini">{tag}</span>
											))}
											{blog.tags && blog.tags.length > 3 && (
												<span className="tag-mini">+{blog.tags.length - 3}</span>
											)}
										</div>
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle'
									}}>
										{blog.relatedProducts && blog.relatedProducts.length > 0
											? blog.relatedProducts.length + ' produk'
											: '—'}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										color: 'var(--muted)',
										verticalAlign: 'middle',
										whiteSpace: 'nowrap'
									}}>
										{formatDate(blog.publishDate)}
									</td>
									<td style={{
										padding: '14px',
										borderBottom: '1px solid #F1F4F8',
										fontSize: '13px',
										verticalAlign: 'middle'
									}}>
										<span className={`chip ${blog.isApproved ? 'green' : 'grey'}`}>
											<span className="cdot"></span>
											{blog.isApproved ? 'Published' : 'Draft'}
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
												onClick={() => router.push(`/blogs/edit/${blog._id}`)}
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
													e.currentTarget.style.borderColor = 'var(--blue)';
													e.currentTarget.style.color = 'var(--blue)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = 'var(--border)';
													e.currentTarget.style.color = 'var(--muted)';
												}}
											>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M12 20h9"/>
													<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
												</svg>
											</button>
											{canApproveBlog && (
												<button
													onClick={() => handleApprove(blog._id, blog.isApproved || false)}
													disabled={approveLoading === blog._id}
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
														cursor: approveLoading === blog._id ? 'not-allowed' : 'pointer',
														transition: '0.18s',
														opacity: approveLoading === blog._id ? 0.5 : 1
													}}
													onMouseEnter={(e) => {
														if (approveLoading !== blog._id) {
															e.currentTarget.style.borderColor = blog.isApproved ? 'var(--amber)' : '#1F8A4D';
															e.currentTarget.style.color = blog.isApproved ? 'var(--amber)' : '#1F8A4D';
														}
													}}
													onMouseLeave={(e) => {
														if (approveLoading !== blog._id) {
															e.currentTarget.style.borderColor = 'var(--border)';
															e.currentTarget.style.color = 'var(--muted)';
														}
													}}
													title={blog.isApproved ? 'Unapprove' : 'Approve'}
												>
													{blog.isApproved ? (
														<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<path d="M18 6L6 18M6 6l12 12"/>
														</svg>
													) : (
														<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<polyline points="20 6 9 17 4 12"/>
														</svg>
													)}
												</button>
											)}
											<button
												onClick={() => handleDelete(blog._id)}
												disabled={deleteLoading === blog._id}
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
													cursor: deleteLoading === blog._id ? 'not-allowed' : 'pointer',
													transition: '0.18s',
													opacity: deleteLoading === blog._id ? 0.5 : 1
												}}
												onMouseEnter={(e) => {
													if (deleteLoading !== blog._id) {
														e.currentTarget.style.borderColor = 'var(--red)';
														e.currentTarget.style.color = 'var(--red)';
													}
												}}
												onMouseLeave={(e) => {
													if (deleteLoading !== blog._id) {
														e.currentTarget.style.borderColor = 'var(--border)';
														e.currentTarget.style.color = 'var(--muted)';
													}
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

			{/* Pagination */}
			{!loading && blogs.length > 0 && totalPages > 1 && (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginTop: '20px'
				}}>
					<div style={{
						fontSize: '13px',
						color: 'var(--muted)'
					}}>
						Showing <span style={{ fontWeight: 700, color: 'var(--text)' }}>
							{startIndex + 1}
						</span> to <span style={{ fontWeight: 700, color: 'var(--text)' }}>
							{Math.min(endIndex, totalItems)}
						</span> of <span style={{ fontWeight: 700, color: 'var(--text)' }}>
							{totalItems}
						</span> results
					</div>
					<div style={{ display: 'flex', gap: '8px' }}>
						<button
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							style={{
								height: '30px',
								padding: '0 14px',
								border: '1px solid var(--border)',
								background: '#fff',
								borderRadius: '6px',
								cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
								fontFamily: "'Montserrat', sans-serif",
								fontWeight: 500,
								fontSize: '13px',
								color: 'var(--muted)',
								transition: '0.2s',
								opacity: currentPage === 1 ? 0.5 : 1
							}}
							onMouseEnter={(e) => {
								if (currentPage !== 1) {
									e.currentTarget.style.borderColor = 'var(--blue)';
									e.currentTarget.style.color = 'var(--blue)';
								}
							}}
							onMouseLeave={(e) => {
								if (currentPage !== 1) {
									e.currentTarget.style.borderColor = 'var(--border)';
									e.currentTarget.style.color = 'var(--muted)';
								}
							}}
						>
							Previous
						</button>

						{/* Page numbers */}
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							let pageNum;
							if (totalPages <= 5) {
								pageNum = i + 1;
							} else if (currentPage <= 3) {
								pageNum = i + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}

							const isActive = pageNum === currentPage;

							return (
								<button
									key={pageNum}
									onClick={() => setCurrentPage(pageNum)}
									style={{
										height: '30px',
										padding: '0 14px',
										border: isActive ? 'none' : '1px solid var(--border)',
										background: isActive ? 'var(--grad)' : '#fff',
										borderRadius: '6px',
										cursor: 'pointer',
										fontFamily: "'Montserrat', sans-serif",
										fontWeight: 500,
										fontSize: '13px',
										color: isActive ? '#fff' : 'var(--muted)',
										transition: '0.2s'
									}}
									onMouseEnter={(e) => {
										if (!isActive) {
											e.currentTarget.style.borderColor = 'var(--blue)';
											e.currentTarget.style.color = 'var(--blue)';
										}
									}}
									onMouseLeave={(e) => {
										if (!isActive) {
											e.currentTarget.style.borderColor = 'var(--border)';
											e.currentTarget.style.color = 'var(--muted)';
										}
									}}
								>
									{pageNum}
								</button>
							);
						})}

						<button
							onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
							disabled={currentPage === totalPages}
							style={{
								height: '30px',
								padding: '0 14px',
								border: '1px solid var(--border)',
								background: '#fff',
								borderRadius: '6px',
								cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
								fontFamily: "'Montserrat', sans-serif",
								fontWeight: 500,
								fontSize: '13px',
								color: 'var(--muted)',
								transition: '0.2s',
								opacity: currentPage === totalPages ? 0.5 : 1
							}}
							onMouseEnter={(e) => {
								if (currentPage !== totalPages) {
									e.currentTarget.style.borderColor = 'var(--blue)';
									e.currentTarget.style.color = 'var(--blue)';
								}
							}}
							onMouseLeave={(e) => {
								if (currentPage !== totalPages) {
									e.currentTarget.style.borderColor = 'var(--border)';
									e.currentTarget.style.color = 'var(--muted)';
								}
							}}
						>
							Next
						</button>
					</div>
				</div>
			)}

			{/* Summary */}
			{!loading && blogs.length > 0 && (
				<div style={{
					marginTop: '16px',
					fontSize: '13px',
					color: 'var(--muted)',
					textAlign: 'right'
				}}>
					Total blog: <span style={{ fontWeight: 700, color: 'var(--text)' }}>
						{totalItems}
					</span>
				</div>
			)}
		</MainLayout>
	);
}
