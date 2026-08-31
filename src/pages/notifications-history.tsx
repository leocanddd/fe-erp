import MainLayout from '@/components/MainLayout';
import { useCallback, useEffect, useState } from 'react';

interface Notification {
	_id: string;
	type: string;
	message: string;
	chatId: string;
	sentBy: string;
	createdAt: string;
}

interface NotificationsResponse {
	status: string;
	statusCode: number;
	data: Notification[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
	error?: string;
}

// Chat ID to Name mapping
const CHAT_ID_NAMES: Record<string, string> = {
	// Group chats
	'-1004315914844': 'Dwi - Visits',
	'-1003946533225': 'Tono (C) - Visits',
	'-1004321787688': 'Ardy - Visits',
	'-1004408681789': 'Taufik - Visits',
	'-1004379177862': 'Robby - Visits',
	'-1004490330349': 'Tono - Visits',
	'-1004466813961': 'Haikal - Visits',
	'-1004490478993': 'Diana - Visits',
	'-1004423713030': 'Sugito - Visits',
	'-1004395912306': 'Ozi - Visits',
	'-1004460743094': 'Test group',
	// Individual users
	'7598374093': 'Ana (Kolektor)',
	'2053523881': 'Anita',
	'5375633718': 'Taufik',
	'6992477337': 'Tono',
	'5873477125': 'Ana',
	'5861262889': 'Robi',
	'8816525552': 'Sugito',
	'6708014759': 'Diana',
	'5634128293': 'Ozi',
	'7142339461': 'Haikal',
	'5192043963': 'Rani',
	'5208360934': 'Siti',
	'8660639382': 'Clarissa',
	'7648132521': 'Rayvin',
	'5030056738': 'Leo',
};

const getApiUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const getAuthHeaders = () => {
	const token = localStorage.getItem('accessToken');
	return {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

const getNotifications = async (
	page: number = 1,
	limit: number = 20,
	type?: string,
	chatId?: string
): Promise<NotificationsResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (type) params.append('type', type);
		if (chatId) params.append('chatId', chatId);

		const response = await fetch(
			`${getApiUrl()}/api/notifications-history?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data: NotificationsResponse = await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			data: [],
			pagination: {
				currentPage: 1,
				totalPages: 0,
				totalItems: 0,
				itemsPerPage: limit,
			},
			error: 'Network error occurred',
		};
	}
};

export default function NotificationsHistory() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [typeFilter, setTypeFilter] = useState('');
	const [chatIdFilter, setChatIdFilter] = useState('');

	const fetchNotifications = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getNotifications(
				currentPage,
				20,
				typeFilter || undefined,
				chatIdFilter || undefined
			);
			if (response.statusCode === 200) {
				setNotifications(response.data);
				setTotalPages(response.pagination.totalPages);
				setTotalItems(response.pagination.totalItems);
				setError('');
			} else {
				setError(response.error || 'Failed to fetch notifications');
			}
		} catch {
			setError('Failed to fetch notifications');
		} finally {
			setLoading(false);
		}
	}, [currentPage, typeFilter, chatIdFilter]);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	const getTypeChipColor = (type: string) => {
		switch (type.toLowerCase()) {
			case 'ar':
				return 'blue';
			case 'manual':
				return 'green';
			case 'system':
				return 'violet';
			default:
				return 'grey';
		}
	};

	const getChatName = (chatId: string) => {
		return CHAT_ID_NAMES[chatId] || chatId;
	};

	const handleFilterSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchNotifications();
	};

	const handleResetFilters = () => {
		setTypeFilter('');
		setChatIdFilter('');
		setCurrentPage(1);
	};

	return (
		<MainLayout title="Notifications History">
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
				.chip.blue { background: #E6F4FC; color: #1573A8; }
				.chip.red { background: #FDECEA; color: #D93A2F; }
				.chip.grey { background: #EEF1F5; color: #697789; }
				.chip.violet { background: #F0E9FA; color: #7B4FB5; }
			`}</style>

			{/* Header */}
			<div style={{ marginBottom: '24px' }}>
				<h1 style={{
					margin: 0,
					fontWeight: 800,
					fontSize: '24px',
					color: 'var(--dark)'
				}}>
					Notifications History
				</h1>
				<p style={{
					fontSize: '13px',
					color: 'var(--muted)',
					marginTop: '4px'
				}}>
					View all sent notifications from Telegram bots
				</p>
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

			{/* Filters */}
			<div style={{
				background: 'white',
				border: '1px solid var(--border)',
				borderRadius: '12px',
				padding: '20px 24px',
				marginBottom: '18px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}>
				<form onSubmit={handleFilterSubmit}>
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
						gap: '16px',
						marginBottom: '16px'
					}}>
						<div>
							<label style={{
								display: 'block',
								fontWeight: 600,
								fontSize: '12px',
								color: 'var(--text)',
								marginBottom: '6px'
							}}>
								Type
							</label>
							<input
								type="text"
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value)}
								placeholder="e.g., ar, manual"
								style={{
									width: '100%',
									padding: '8px 12px',
									border: '1px solid var(--border)',
									borderRadius: '6px',
									fontSize: '13px',
									fontFamily: "'Montserrat', sans-serif"
								}}
							/>
						</div>
						<div>
							<label style={{
								display: 'block',
								fontWeight: 600,
								fontSize: '12px',
								color: 'var(--text)',
								marginBottom: '6px'
							}}>
								Chat ID
							</label>
							<input
								type="text"
								value={chatIdFilter}
								onChange={(e) => setChatIdFilter(e.target.value)}
								placeholder="e.g., 5030056738"
								style={{
									width: '100%',
									padding: '8px 12px',
									border: '1px solid var(--border)',
									borderRadius: '6px',
									fontSize: '13px',
									fontFamily: "'Montserrat', sans-serif"
								}}
							/>
						</div>
					</div>
					<div style={{ display: 'flex', gap: '8px' }}>
						<button
							type="submit"
							style={{
								padding: '8px 16px',
								background: 'var(--grad)',
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								fontSize: '13px',
								fontWeight: 600,
								cursor: 'pointer',
								fontFamily: "'Montserrat', sans-serif"
							}}
						>
							Apply Filters
						</button>
						<button
							type="button"
							onClick={handleResetFilters}
							style={{
								padding: '8px 16px',
								background: 'white',
								color: 'var(--muted)',
								border: '1px solid var(--border)',
								borderRadius: '6px',
								fontSize: '13px',
								fontWeight: 600,
								cursor: 'pointer',
								fontFamily: "'Montserrat', sans-serif"
							}}
						>
							Reset
						</button>
					</div>
				</form>
			</div>

			{/* Main Card */}
			<div style={{
				background: 'white',
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
							<span>Loading notifications...</span>
						</div>
					</div>
				) : !notifications || notifications.length === 0 ? (
					<div style={{
						textAlign: 'center',
						color: 'var(--muted)',
						padding: '48px 20px'
					}}>
						No notifications found
					</div>
				) : (
					<>
						{/* Table */}
						<div style={{ overflowX: 'auto' }}>
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
											Type
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
											Message
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
											Recipient
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
											Sent By
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
											Date
										</th>
									</tr>
								</thead>
								<tbody>
									{notifications.map((item) => (
										<tr
											key={item._id}
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
												verticalAlign: 'middle'
											}}>
												<span className={`chip ${getTypeChipColor(item.type)}`}>
													<span className="cdot"></span>
													{item.type}
												</span>
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle',
												maxWidth: '400px'
											}}>
												{item.message}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												<span style={{ fontWeight: 600 }}>
													{getChatName(item.chatId)}
												</span>
												{CHAT_ID_NAMES[item.chatId] && (
													<div style={{
														fontSize: '11px',
														color: 'var(--muted)',
														marginTop: '2px',
														fontFamily: 'monospace'
													}}>
														{item.chatId}
													</div>
												)}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--text)',
												verticalAlign: 'middle'
											}}>
												{item.sentBy}
											</td>
											<td style={{
												padding: '14px',
												borderBottom: '1px solid #F1F4F8',
												fontSize: '13px',
												color: 'var(--muted)',
												verticalAlign: 'middle',
												whiteSpace: 'nowrap'
											}}>
												{new Date(item.createdAt).toLocaleString('id-ID', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						<div style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginTop: '20px',
							paddingTop: '20px',
							borderTop: '1px solid var(--border)',
							flexWrap: 'wrap',
							gap: '12px'
						}}>
							<div style={{
								fontWeight: 400,
								fontSize: '13px',
								color: 'var(--muted)'
							}}>
								Showing <span style={{ fontWeight: 700, color: 'var(--text)' }}>
									{(currentPage - 1) * 20 + 1}
								</span> to <span style={{ fontWeight: 700, color: 'var(--text)' }}>
									{Math.min(currentPage * 20, totalItems)}
								</span> of <span style={{ fontWeight: 700, color: 'var(--text)' }}>
									{totalItems}
								</span> results
							</div>
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
					</>
				)}
			</div>
		</MainLayout>
	);
}
