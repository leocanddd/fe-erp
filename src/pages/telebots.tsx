import MainLayout from '@/components/MainLayout';
import {
	createTeleBot,
	CreateTeleBotData,
	deleteTeleBot,
	getTeleBots,
	TeleBot,
	updateTeleBot,
} from '@/lib/telebots';
import {
	createTeleGroupBot,
	CreateTeleGroupBotData,
	deleteTeleGroupBot,
	getTeleGroupBots,
	TeleGroupBot,
	updateTeleGroupBot,
} from '@/lib/telegroupbots';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function TeleBots() {
	const [bots, setBots] = useState<
		TeleBot[]
	>([]);
	const [groupBots, setGroupBots] =
		useState<TeleGroupBot[]>([]);
	const [loading, setLoading] =
		useState(true);
	const [
		groupLoading,
		setGroupLoading,
	] = useState(true);
	const [error, setError] =
		useState('');
	const [
		successMessage,
		setSuccessMessage,
	] = useState('');
	const [searchQuery, setSearchQuery] =
		useState('');
	const [
		groupSearchQuery,
		setGroupSearchQuery,
	] = useState('');
	const [
		showNewBotModal,
		setShowNewBotModal,
	] = useState(false);
	const [
		showEditModal,
		setShowEditModal,
	] = useState(false);
	const [
		showDeleteModal,
		setShowDeleteModal,
	] = useState(false);
	const [
		showNewGroupBotModal,
		setShowNewGroupBotModal,
	] = useState(false);
	const [
		showEditGroupModal,
		setShowEditGroupModal,
	] = useState(false);
	const [
		showDeleteGroupModal,
		setShowDeleteGroupModal,
	] = useState(false);
	const [editingBot, setEditingBot] =
		useState<TeleBot | null>(null);
	const [deletingBot, setDeletingBot] =
		useState<TeleBot | null>(null);
	const [
		editingGroupBot,
		setEditingGroupBot,
	] = useState<TeleGroupBot | null>(
		null,
	);
	const [
		deletingGroupBot,
		setDeletingGroupBot,
	] = useState<TeleGroupBot | null>(
		null,
	);
	const [submitting, setSubmitting] =
		useState(false);
	const [newBotData, setNewBotData] =
		useState<CreateTeleBotData>({
			employee_number: '',
			name: '',
			telegram_id: 0,
			telegram_username: '',
			role: 'user',
			active: true,
		});
	const [
		newGroupBotData,
		setNewGroupBotData,
	] = useState<CreateTeleGroupBotData>({
		groupName: '',
		chatId: 0,
		category: '',
	});

	const fetchBots =
		useCallback(async () => {
			setLoading(true);
			try {
				const response =
					await getTeleBots();
				if (
					response.statusCode === 200
				) {
					const botData = response.data;
					if (Array.isArray(botData)) {
						setBots(botData);
					} else {
						setBots([]);
						setError(
							'Invalid response format from server',
						);
					}
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch telegram bot users',
					);
					setBots([]);
				}
			} catch {
				setError(
					'Failed to fetch telegram bot users',
				);
				setBots([]);
			} finally {
				setLoading(false);
			}
		}, []);

	const fetchGroupBots =
		useCallback(async () => {
			setGroupLoading(true);
			try {
				const response =
					await getTeleGroupBots();
				if (
					response.statusCode === 200
				) {
					const groupBotData =
						response.data;
					if (
						Array.isArray(groupBotData)
					) {
						setGroupBots(groupBotData);
					} else {
						setGroupBots([]);
						setError(
							'Invalid response format from server',
						);
					}
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch telegram group bots',
					);
					setGroupBots([]);
				}
			} catch {
				setError(
					'Failed to fetch telegram group bots',
				);
				setGroupBots([]);
			} finally {
				setGroupLoading(false);
			}
		}, []);

	useEffect(() => {
		fetchBots();
		fetchGroupBots();
	}, [fetchBots, fetchGroupBots]);

	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(
				() => setSuccessMessage(''),
				3000,
			);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	const handleCreateBot = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result =
				await createTeleBot(newBotData);
			if (result.statusCode === 201) {
				setShowNewBotModal(false);
				setNewBotData({
					employee_number: '',
					name: '',
					telegram_id: 0,
					telegram_username: '',
					role: 'user',
					active: true,
				});
				fetchBots();
				setError('');
				setSuccessMessage(
					result.message ||
						'Telegram bot user created successfully',
				);
			} else {
				setError(
					result.error ||
						'Failed to create telegram bot user',
				);
			}
		} catch {
			setError(
				'Failed to create telegram bot user',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditBot = (
		bot: TeleBot,
	) => {
		console.log('Editing bot:', bot); // Debug log
		const botId = bot.id || bot._id;
		if (!botId) {
			console.error(
				'Bot ID is missing:',
				bot,
			);
			setError(
				'Cannot edit: Bot ID is missing',
			);
			return;
		}
		setEditingBot(bot);
		setNewBotData({
			employee_number:
				bot.employee_number,
			name: bot.name,
			telegram_id: bot.telegram_id,
			telegram_username:
				bot.telegram_username,
			role: bot.role,
			active: bot.active,
		});
		setShowEditModal(true);
	};

	const handleUpdateBot = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		if (!editingBot) return;

		const botId =
			editingBot.id || editingBot._id;
		if (!botId) {
			setError(
				'Cannot update: Bot ID is missing',
			);
			return;
		}

		setSubmitting(true);

		try {
			const result =
				await updateTeleBot(
					botId,
					newBotData,
				);
			if (result.statusCode === 200) {
				setShowEditModal(false);
				setEditingBot(null);
				setNewBotData({
					employee_number: '',
					name: '',
					telegram_id: 0,
					telegram_username: '',
					role: 'user',
					active: true,
				});
				fetchBots();
				setError('');
				setSuccessMessage(
					result.message ||
						'Telegram bot user updated successfully',
				);
			} else {
				setError(
					result.error ||
						'Failed to update telegram bot user',
				);
			}
		} catch {
			setError(
				'Failed to update telegram bot user',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteBot = (
		bot: TeleBot,
	) => {
		setDeletingBot(bot);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!deletingBot) return;

		const botId =
			deletingBot.id || deletingBot._id;
		if (!botId) {
			setError(
				'Cannot delete: Bot ID is missing',
			);
			return;
		}

		setSubmitting(true);

		try {
			const result =
				await deleteTeleBot(botId);
			if (result.statusCode === 200) {
				setShowDeleteModal(false);
				setDeletingBot(null);
				fetchBots();
				setError('');
				setSuccessMessage(
					result.message ||
						'Telegram bot user deleted successfully',
				);
			} else {
				setError(
					result.error ||
						'Failed to delete telegram bot user',
				);
			}
		} catch {
			setError(
				'Failed to delete telegram bot user',
			);
		} finally {
			setSubmitting(false);
		}
	};

	// Group Bot Handlers
	const handleCreateGroupBot = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result =
				await createTeleGroupBot(
					newGroupBotData,
				);
			if (result.statusCode === 201) {
				setShowNewGroupBotModal(false);
				setNewGroupBotData({
					groupName: '',
					chatId: 0,
					category: '',
				});
				fetchGroupBots();
				setError('');
				setSuccessMessage(
					result.message ||
						'Telegram group bot created successfully',
				);
			} else {
				setError(
					result.error ||
						'Failed to create telegram group bot',
				);
			}
		} catch {
			setError(
				'Failed to create telegram group bot',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditGroupBot = (
		groupBot: TeleGroupBot,
	) => {
		const groupBotId =
			groupBot.id || groupBot._id;
		if (!groupBotId) {
			setError(
				'Cannot edit: Group Bot ID is missing',
			);
			return;
		}
		setEditingGroupBot(groupBot);
		setNewGroupBotData({
			groupName: groupBot.groupName,
			chatId: groupBot.chatId,
			category: groupBot.category,
		});
		setShowEditGroupModal(true);
	};

	const handleUpdateGroupBot = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		if (!editingGroupBot) return;

		const groupBotId =
			editingGroupBot.id ||
			editingGroupBot._id;
		if (!groupBotId) {
			setError(
				'Cannot update: Group Bot ID is missing',
			);
			return;
		}

		setSubmitting(true);

		try {
			const result =
				await updateTeleGroupBot(
					groupBotId,
					newGroupBotData,
				);
			if (result.statusCode === 200) {
				setShowEditGroupModal(false);
				setEditingGroupBot(null);
				setNewGroupBotData({
					groupName: '',
					chatId: 0,
					category: '',
				});
				fetchGroupBots();
				setError('');
				setSuccessMessage(
					result.message ||
						'Telegram group bot updated successfully',
				);
			} else {
				setError(
					result.error ||
						'Failed to update telegram group bot',
				);
			}
		} catch {
			setError(
				'Failed to update telegram group bot',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteGroupBot = (
		groupBot: TeleGroupBot,
	) => {
		setDeletingGroupBot(groupBot);
		setShowDeleteGroupModal(true);
	};

	const confirmDeleteGroup =
		async () => {
			if (!deletingGroupBot) return;

			const groupBotId =
				deletingGroupBot.id ||
				deletingGroupBot._id;
			if (!groupBotId) {
				setError(
					'Cannot delete: Group Bot ID is missing',
				);
				return;
			}

			setSubmitting(true);

			try {
				const result =
					await deleteTeleGroupBot(
						groupBotId,
					);
				if (result.statusCode === 200) {
					setShowDeleteGroupModal(
						false,
					);
					setDeletingGroupBot(null);
					fetchGroupBots();
					setError('');
					setSuccessMessage(
						result.message ||
							'Telegram group bot deleted successfully',
					);
				} else {
					setError(
						result.error ||
							'Failed to delete telegram group bot',
					);
				}
			} catch {
				setError(
					'Failed to delete telegram group bot',
				);
			} finally {
				setSubmitting(false);
			}
		};

	const getRoleChipColor = (
		role: string,
	) => {
		const colors: Record<
			string,
			string
		> = {
			admin: 'violet',
			user: 'blue',
			collector: 'amber',
			salesperson: 'green',
		};
		return colors[role] || 'grey';
	};

	const getGroupTypeChipColor = (
		type: string,
	) => {
		const colors: Record<
			string,
			string
		> = {
			retail: 'blue',
			project: 'green',
			collection: 'amber',
			warehouse: 'violet',
			general: 'grey',
		};
		return colors[type] || 'grey';
	};

	const filteredBots = bots.filter(
		(bot) => {
			const name =
				bot.name.toLowerCase();
			const empNum =
				bot.employee_number.toLowerCase();
			const telegramUsername = (
				bot.telegram_username || ''
			).toLowerCase();
			const query =
				searchQuery.toLowerCase();
			return (
				name.includes(query) ||
				empNum.includes(query) ||
				telegramUsername.includes(query)
			);
		},
	);

	const filteredGroupBots =
		groupBots.filter((groupBot) => {
			const groupName =
				groupBot.groupName?.toLowerCase();
			const category = (
				groupBot.category || ''
			).toLowerCase();
			const query =
				groupSearchQuery.toLowerCase();
			return (
				groupName?.includes(query) ||
				category.includes(query)
			);
		});

	return (
		<>
			<MainLayout title="Telegram Bot Users">
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
					.chip.green {
						background: #e7f7ee;
						color: #1f8a4d;
					}
					.chip.amber {
						background: #fef3e0;
						color: #c77e12;
					}
					.chip.blue {
						background: #e6f4fc;
						color: #1573a8;
					}
					.chip.red {
						background: #fdecea;
						color: #d93a2f;
					}
					.chip.grey {
						background: #eef1f5;
						color: #697789;
					}
					.chip.violet {
						background: #f0e9fa;
						color: #7b4fb5;
					}
					@keyframes spin {
						to {
							transform: rotate(360deg);
						}
					}
				`}</style>

				{/* Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginBottom: '24px',
					}}
				>
					<div style={{ flex: 1 }}>
						<h1
							style={{
								margin: 0,
								fontWeight: 800,
								fontSize: '24px',
								color: 'var(--dark)',
							}}
						>
							Telegram Bot Users
						</h1>
						<div
							style={{
								fontSize: '13px',
								color: 'var(--muted)',
								marginTop: '4px',
							}}
						>
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
					<button
						onClick={() =>
							setShowNewBotModal(true)
						}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							height: '38px',
							padding: '0 18px',
							border: 'none',
							borderRadius: '9px',
							cursor: 'pointer',
							fontFamily:
								"'Montserrat', sans-serif",
							fontWeight: 700,
							fontSize: '13px',
							color: '#fff',
							background: 'var(--grad)',
							transition: '0.18s',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.filter =
								'brightness(1.07)';
							e.currentTarget.style.transform =
								'translateY(-1px)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.filter =
								'none';
							e.currentTarget.style.transform =
								'none';
						}}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
						Add Bot User
					</button>
				</div>

				{/* Main Card */}
				<div
					style={{
						background: 'white',
						border:
							'1px solid var(--border)',
						borderRadius: '12px',
						padding: '24px 28px',
						boxShadow:
							'0 2px 8px rgba(0,0,0,0.04)',
					}}
				>
					{/* Search */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							flexWrap: 'wrap',
							marginBottom: '18px',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								height: '38px',
								padding: '0 14px',
								background: '#fff',
								border:
									'1px solid var(--border)',
								borderRadius: '9px',
								minWidth: '320px',
								flex: 1,
								color: 'var(--muted)',
							}}
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
								<circle
									cx="11"
									cy="11"
									r="7"
								/>
								<path d="m21 21-4.3-4.3" />
							</svg>
							<input
								value={searchQuery}
								onChange={(e) =>
									setSearchQuery(
										e.target.value,
									)
								}
								placeholder="Search by name, employee number, or telegram username..."
								style={{
									border: 'none',
									outline: 'none',
									fontFamily:
										"'Montserrat', sans-serif",
									fontSize: '13px',
									color: 'var(--text)',
									width: '100%',
									background:
										'transparent',
								}}
							/>
						</div>
					</div>

					{error && (
						<div
							style={{
								background: '#FDECEA',
								border:
									'1px solid #FE2C23',
								borderRadius: '9px',
								padding: '12px 16px',
								marginBottom: '18px',
							}}
						>
							<div
								style={{
									fontSize: '13px',
									color: '#FE2C23',
									fontWeight: 600,
								}}
							>
								{error}
							</div>
						</div>
					)}

					{successMessage && (
						<div
							style={{
								background: '#E7F7EE',
								border:
									'1px solid #1F8A4D',
								borderRadius: '9px',
								padding: '12px 16px',
								marginBottom: '18px',
							}}
						>
							<div
								style={{
									fontSize: '13px',
									color: '#1F8A4D',
									fontWeight: 600,
								}}
							>
								{successMessage}
							</div>
						</div>
					)}

					{/* Table */}
					{loading ? (
						<div
							style={{
								display: 'flex',
								justifyContent:
									'center',
								padding: '48px 20px',
								color: 'var(--muted)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
								}}
							>
								<div
									style={{
										width: '32px',
										height: '32px',
										border:
											'4px solid rgba(28, 167, 236, 0.3)',
										borderTopColor:
											'#1ca7ec',
										borderRadius: '50%',
										animation:
											'spin 1s linear infinite',
									}}
								></div>
								<span>Loading...</span>
							</div>
						</div>
					) : filteredBots.length ===
					  0 ? (
						<div
							style={{
								textAlign: 'center',
								color: 'var(--muted)',
								padding: '48px 20px',
							}}
						>
							<svg
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								style={{
									opacity: 0.5,
									marginBottom: '12px',
								}}
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle
									cx="12"
									cy="7"
									r="4"
								/>
							</svg>
							<div
								style={{
									fontWeight: 700,
									fontSize: '15px',
									color: 'var(--text)',
									marginBottom: '4px',
								}}
							>
								No Telegram Bot Users
								Found
							</div>
							<div>
								{searchQuery
									? 'Try adjusting your search'
									: 'Click "Add Bot User" to create a new user'}
							</div>
						</div>
					) : (
						<table
							style={{
								width: '100%',
								borderCollapse:
									'collapse',
							}}
						>
							<thead>
								<tr>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Employee No.
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Name
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Telegram ID
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Username
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Role
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Status
									</th>
									<th
										style={{
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
										}}
									></th>
								</tr>
							</thead>
							<tbody>
								{filteredBots.map(
									(bot) => (
										<tr
											key={
												bot.id ||
												bot._id
											}
											style={{
												transition:
													'background 0.15s ease',
											}}
											onMouseEnter={(
												e,
											) =>
												(e.currentTarget.style.background =
													'#F8FBFF')
											}
											onMouseLeave={(
												e,
											) =>
												(e.currentTarget.style.background =
													'transparent')
											}
										>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													verticalAlign:
														'middle',
													fontWeight: 700,
													color:
														'var(--dark)',
												}}
											>
												{
													bot.employee_number
												}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
													fontWeight: 600,
												}}
											>
												{bot.name}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
												}}
											>
												{
													bot.telegram_id
												}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
												}}
											>
												{bot.telegram_username ||
													'—'}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
												}}
											>
												<span
													className={`chip ${getRoleChipColor(bot.role)}`}
												>
													<span className="cdot"></span>
													{bot.role
														.charAt(0)
														.toUpperCase() +
														bot.role.slice(
															1,
														)}
												</span>
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													verticalAlign:
														'middle',
												}}
											>
												<span
													className={`chip ${bot.active ? 'green' : 'grey'}`}
												>
													<span className="cdot"></span>
													{bot.active
														? 'Active'
														: 'Inactive'}
												</span>
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
													textAlign:
														'right',
												}}
											>
												<div
													style={{
														display:
															'flex',
														gap: '8px',
														alignItems:
															'center',
														justifyContent:
															'flex-end',
													}}
												>
													<button
														onClick={() =>
															handleEditBot(
																bot,
															)
														}
														title="Edit"
														style={{
															width:
																'30px',
															height:
																'30px',
															display:
																'inline-flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															border:
																'1px solid var(--border)',
															borderRadius:
																'7px',
															background:
																'#fff',
															color:
																'var(--muted)',
															cursor:
																'pointer',
															transition:
																'0.18s',
														}}
														onMouseEnter={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--blue)';
															e.currentTarget.style.color =
																'var(--blue)';
														}}
														onMouseLeave={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--border)';
															e.currentTarget.style.color =
																'var(--muted)';
														}}
													>
														<svg
															width="15"
															height="15"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M12 20h9" />
															<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
														</svg>
													</button>
													<button
														onClick={() =>
															handleDeleteBot(
																bot,
															)
														}
														title="Delete"
														style={{
															width:
																'30px',
															height:
																'30px',
															display:
																'inline-flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															border:
																'1px solid var(--border)',
															borderRadius:
																'7px',
															background:
																'#fff',
															color:
																'var(--muted)',
															cursor:
																'pointer',
															transition:
																'0.18s',
														}}
														onMouseEnter={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'#FE2C23';
															e.currentTarget.style.color =
																'#FE2C23';
														}}
														onMouseLeave={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--border)';
															e.currentTarget.style.color =
																'var(--muted)';
														}}
													>
														<svg
															width="15"
															height="15"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="3 6 5 6 21 6" />
															<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					)}
				</div>

				{/* Group Bots Table */}
				<div
					style={{
						background: 'white',
						border:
							'1px solid var(--border)',
						borderRadius: '12px',
						padding: '24px 28px',
						boxShadow:
							'0 2px 8px rgba(0,0,0,0.04)',
						marginTop: '24px',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent:
								'space-between',
							marginBottom: '18px',
						}}
					>
						<h2
							style={{
								margin: 0,
								fontWeight: 700,
								fontSize: '18px',
								color: 'var(--dark)',
							}}
						>
							Telegram Group Bots
						</h2>
						<button
							onClick={() =>
								setShowNewGroupBotModal(
									true,
								)
							}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '8px',
								height: '38px',
								padding: '0 18px',
								border: 'none',
								borderRadius: '9px',
								cursor: 'pointer',
								fontFamily:
									"'Montserrat', sans-serif",
								fontWeight: 700,
								fontSize: '13px',
								color: '#fff',
								background:
									'var(--grad)',
								transition: '0.18s',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.filter =
									'brightness(1.07)';
								e.currentTarget.style.transform =
									'translateY(-1px)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.filter =
									'none';
								e.currentTarget.style.transform =
									'none';
							}}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.2"
								strokeLinecap="round"
							>
								<path d="M12 5v14M5 12h14" />
							</svg>
							Add Group Bot
						</button>
					</div>

					{/* Search */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							flexWrap: 'wrap',
							marginBottom: '18px',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								height: '38px',
								padding: '0 14px',
								background: '#fff',
								border:
									'1px solid var(--border)',
								borderRadius: '9px',
								minWidth: '320px',
								flex: 1,
								color: 'var(--muted)',
							}}
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
								<circle
									cx="11"
									cy="11"
									r="7"
								/>
								<path d="m21 21-4.3-4.3" />
							</svg>
							<input
								value={groupSearchQuery}
								onChange={(e) =>
									setGroupSearchQuery(
										e.target.value,
									)
								}
								placeholder="Search by group name or type..."
								style={{
									border: 'none',
									outline: 'none',
									fontFamily:
										"'Montserrat', sans-serif",
									fontSize: '13px',
									color: 'var(--text)',
									width: '100%',
									background:
										'transparent',
								}}
							/>
						</div>
					</div>

					{/* Table */}
					{groupLoading ? (
						<div
							style={{
								display: 'flex',
								justifyContent:
									'center',
								padding: '48px 20px',
								color: 'var(--muted)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
								}}
							>
								<div
									style={{
										width: '32px',
										height: '32px',
										border:
											'4px solid rgba(28, 167, 236, 0.3)',
										borderTopColor:
											'#1ca7ec',
										borderRadius: '50%',
										animation:
											'spin 1s linear infinite',
									}}
								></div>
								<span>Loading...</span>
							</div>
						</div>
					) : filteredGroupBots.length ===
					  0 ? (
						<div
							style={{
								textAlign: 'center',
								color: 'var(--muted)',
								padding: '48px 20px',
							}}
						>
							<div
								style={{
									fontWeight: 700,
									fontSize: '15px',
									color: 'var(--text)',
									marginBottom: '4px',
								}}
							>
								No Telegram Group Bots
								Found
							</div>
							<div>
								{groupSearchQuery
									? 'Try adjusting your search'
									: 'Click "Add Group Bot" to create a new group bot'}
							</div>
						</div>
					) : (
						<table
							style={{
								width: '100%',
								borderCollapse:
									'collapse',
							}}
						>
							<thead>
								<tr>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Group Name
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Chat ID
									</th>
									<th
										style={{
											textAlign: 'left',
											fontWeight: 600,
											fontSize: '11px',
											textTransform:
												'uppercase',
											letterSpacing:
												'0.04em',
											color:
												'var(--muted)',
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
											whiteSpace:
												'nowrap',
										}}
									>
										Category
									</th>
									<th
										style={{
											padding:
												'0 14px 12px',
											borderBottom:
												'1px solid var(--border)',
										}}
									></th>
								</tr>
							</thead>
							<tbody>
								{filteredGroupBots.map(
									(groupBot) => (
										<tr
											key={
												groupBot.id ||
												groupBot._id
											}
											style={{
												transition:
													'background 0.15s ease',
											}}
											onMouseEnter={(
												e,
											) =>
												(e.currentTarget.style.background =
													'#F8FBFF')
											}
											onMouseLeave={(
												e,
											) =>
												(e.currentTarget.style.background =
													'transparent')
											}
										>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
													fontWeight: 600,
												}}
											>
												{
													groupBot.groupName
												}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
												}}
											>
												{
													groupBot.chatId
												}
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
												}}
											>
												<span
													className={`chip ${getGroupTypeChipColor(groupBot.category)}`}
												>
													<span className="cdot"></span>
													{groupBot.category
														?.charAt(0)
														.toUpperCase() +
														groupBot.category?.slice(
															1,
														)}
												</span>
											</td>
											<td
												style={{
													padding:
														'14px',
													borderBottom:
														'1px solid #F1F4F8',
													fontSize:
														'13px',
													color:
														'var(--text)',
													verticalAlign:
														'middle',
													textAlign:
														'right',
												}}
											>
												<div
													style={{
														display:
															'flex',
														gap: '8px',
														alignItems:
															'center',
														justifyContent:
															'flex-end',
													}}
												>
													<button
														onClick={() =>
															handleEditGroupBot(
																groupBot,
															)
														}
														title="Edit"
														style={{
															width:
																'30px',
															height:
																'30px',
															display:
																'inline-flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															border:
																'1px solid var(--border)',
															borderRadius:
																'7px',
															background:
																'#fff',
															color:
																'var(--muted)',
															cursor:
																'pointer',
															transition:
																'0.18s',
														}}
														onMouseEnter={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--blue)';
															e.currentTarget.style.color =
																'var(--blue)';
														}}
														onMouseLeave={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--border)';
															e.currentTarget.style.color =
																'var(--muted)';
														}}
													>
														<svg
															width="15"
															height="15"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M12 20h9" />
															<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
														</svg>
													</button>
													<button
														onClick={() =>
															handleDeleteGroupBot(
																groupBot,
															)
														}
														title="Delete"
														style={{
															width:
																'30px',
															height:
																'30px',
															display:
																'inline-flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															border:
																'1px solid var(--border)',
															borderRadius:
																'7px',
															background:
																'#fff',
															color:
																'var(--muted)',
															cursor:
																'pointer',
															transition:
																'0.18s',
														}}
														onMouseEnter={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'#FE2C23';
															e.currentTarget.style.color =
																'#FE2C23';
														}}
														onMouseLeave={(
															e,
														) => {
															e.currentTarget.style.borderColor =
																'var(--border)';
															e.currentTarget.style.color =
																'var(--muted)';
														}}
													>
														<svg
															width="15"
															height="15"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="3 6 5 6 21 6" />
															<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					)}
				</div>
			</MainLayout>

			{/* New Bot Modal */}
			{showNewBotModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background:
							'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
					}}
					onClick={() =>
						setShowNewBotModal(false)
					}
				>
					<div
						style={{
							background: 'white',
							borderRadius: '12px',
							padding: '24px 28px',
							width: '100%',
							maxWidth: '600px',
							margin: '0 16px',
							maxHeight: '90vh',
							overflowY: 'auto',
						}}
						onClick={(e) =>
							e.stopPropagation()
						}
					>
						<div
							style={{
								display: 'flex',
								justifyContent:
									'space-between',
								alignItems: 'center',
								marginBottom: '24px',
							}}
						>
							<h3
								style={{
									fontWeight: 700,
									fontSize: '18px',
									color: 'var(--dark)',
									margin: 0,
								}}
							>
								Add Telegram Bot User
							</h3>
							<button
								onClick={() =>
									setShowNewBotModal(
										false,
									)
								}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--muted)',
									padding: 0,
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form
							onSubmit={handleCreateBot}
						>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns:
										'repeat(2, 1fr)',
									gap: '18px 22px',
								}}
							>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Employee Number{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.employee_number
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													employee_number:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., EMP001"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Name{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.name
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													name: e.target
														.value,
												}),
											)
										}
										placeholder="Full name"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Telegram ID{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="number"
										required
										value={
											newBotData.telegram_id ||
											''
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													telegram_id:
														Number(
															e.target
																.value,
														),
												}),
											)
										}
										placeholder="e.g., 123456789"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Telegram Username{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.telegram_username
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													telegram_username:
														e.target
															.value,
												}),
											)
										}
										placeholder="@username"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Role{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<select
										value={
											newBotData.role
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													role: e.target
														.value,
												}),
											)
										}
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.currentTarget.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.currentTarget.style.borderColor =
												'var(--border)')
										}
									>
										<option value="admin">
											Admin
										</option>
										<option value="warehouse">
											Warehouse
										</option>
										<option value="retail_staff">
											Retail Staff
										</option>
										<option value="retail_manager">
											Retail Manager
										</option>
										<option value="project_staff">
											Project Staff
										</option>
										<option value="project_manager">
											Project Manager
										</option>
										<option value="collection_staff">
											Collection Staff
										</option>
										<option value="collection_manager">
											Collection Manager
										</option>
										<option value="viewer">
											Viewer
										</option>
										<option value="hr">
											HR
										</option>
										<option value="office">
											Office
										</option>
										<option value="pricing">
											Pricing
										</option>
									</select>
								</div>
								<div
									style={{
										display: 'flex',
										alignItems:
											'center',
										paddingTop: '28px',
									}}
								>
									<label
										style={{
											display: 'flex',
											alignItems:
												'center',
											gap: '8px',
											cursor: 'pointer',
											fontWeight: 600,
											fontSize: '13px',
											color:
												'var(--dark)',
										}}
									>
										<input
											type="checkbox"
											checked={
												newBotData.active
											}
											onChange={(e) =>
												setNewBotData(
													(prev) => ({
														...prev,
														active:
															e.target
																.checked,
													}),
												)
											}
											style={{
												width: '18px',
												height: '18px',
												cursor:
													'pointer',
											}}
										/>
										<span>Active</span>
									</label>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
									marginTop: '24px',
								}}
							>
								<button
									type="button"
									onClick={() =>
										setShowNewBotModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'var(--grad)',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Creating...'
										: 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Bot Modal */}
			{showEditModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background:
							'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
					}}
					onClick={() =>
						setShowEditModal(false)
					}
				>
					<div
						style={{
							background: 'white',
							borderRadius: '12px',
							padding: '24px 28px',
							width: '100%',
							maxWidth: '600px',
							margin: '0 16px',
							maxHeight: '90vh',
							overflowY: 'auto',
						}}
						onClick={(e) =>
							e.stopPropagation()
						}
					>
						<div
							style={{
								display: 'flex',
								justifyContent:
									'space-between',
								alignItems: 'center',
								marginBottom: '24px',
							}}
						>
							<h3
								style={{
									fontWeight: 700,
									fontSize: '18px',
									color: 'var(--dark)',
									margin: 0,
								}}
							>
								Edit Telegram Bot User
							</h3>
							<button
								onClick={() =>
									setShowEditModal(
										false,
									)
								}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--muted)',
									padding: 0,
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form
							onSubmit={handleUpdateBot}
						>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns:
										'repeat(2, 1fr)',
									gap: '18px 22px',
								}}
							>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Employee Number{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.employee_number
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													employee_number:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., EMP001"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Name{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.name
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													name: e.target
														.value,
												}),
											)
										}
										placeholder="Full name"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Telegram ID{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="number"
										required
										value={
											newBotData.telegram_id ||
											''
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													telegram_id:
														Number(
															e.target
																.value,
														),
												}),
											)
										}
										placeholder="e.g., 123456789"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Telegram Username{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newBotData.telegram_username
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													telegram_username:
														e.target
															.value,
												}),
											)
										}
										placeholder="@username"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Role{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<select
										value={
											newBotData.role
										}
										onChange={(e) =>
											setNewBotData(
												(prev) => ({
													...prev,
													role: e.target
														.value,
												}),
											)
										}
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.currentTarget.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.currentTarget.style.borderColor =
												'var(--border)')
										}
									>
										<option value="admin">
											Admin
										</option>
										<option value="warehouse">
											Warehouse
										</option>
										<option value="retail_staff">
											Retail Staff
										</option>
										<option value="retail_manager">
											Retail Manager
										</option>
										<option value="project_staff">
											Project Staff
										</option>
										<option value="project_manager">
											Project Manager
										</option>
										<option value="collection_staff">
											Collection Staff
										</option>
										<option value="collection_manager">
											Collection Manager
										</option>
										<option value="viewer">
											Viewer
										</option>
										<option value="hr">
											HR
										</option>
										<option value="office">
											Office
										</option>
										<option value="pricing">
											Pricing
										</option>
									</select>
								</div>
								<div
									style={{
										display: 'flex',
										alignItems:
											'center',
										paddingTop: '28px',
									}}
								>
									<label
										style={{
											display: 'flex',
											alignItems:
												'center',
											gap: '8px',
											cursor: 'pointer',
											fontWeight: 600,
											fontSize: '13px',
											color:
												'var(--dark)',
										}}
									>
										<input
											type="checkbox"
											checked={
												newBotData.active
											}
											onChange={(e) =>
												setNewBotData(
													(prev) => ({
														...prev,
														active:
															e.target
																.checked,
													}),
												)
											}
											style={{
												width: '18px',
												height: '18px',
												cursor:
													'pointer',
											}}
										/>
										<span>Active</span>
									</label>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
									marginTop: '24px',
								}}
							>
								<button
									type="button"
									onClick={() =>
										setShowEditModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'var(--grad)',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Saving...'
										: 'Save Changes'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal &&
				deletingBot && (
					<div
						style={{
							position: 'fixed',
							inset: 0,
							background:
								'rgba(0, 0, 0, 0.5)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 50,
						}}
						onClick={() =>
							setShowDeleteModal(false)
						}
					>
						<div
							style={{
								background: 'white',
								borderRadius: '12px',
								padding: '24px 28px',
								width: '100%',
								maxWidth: '420px',
								margin: '0 16px',
							}}
							onClick={(e) =>
								e.stopPropagation()
							}
						>
							<div
								style={{
									display: 'flex',
									justifyContent:
										'space-between',
									alignItems: 'center',
									marginBottom: '24px',
								}}
							>
								<h3
									style={{
										fontWeight: 700,
										fontSize: '18px',
										color:
											'var(--dark)',
										margin: 0,
									}}
								>
									Delete Telegram Bot
									User
								</h3>
								<button
									onClick={() =>
										setShowDeleteModal(
											false,
										)
									}
									style={{
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										color:
											'var(--muted)',
										padding: 0,
									}}
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</div>
							<p
								style={{
									margin: '0 0 24px',
									color: 'var(--text)',
									lineHeight: 1.6,
								}}
							>
								Are you sure you want to
								delete{' '}
								<strong>
									{deletingBot.name}
								</strong>
								? This action cannot be
								undone.
							</p>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
								}}
							>
								<button
									onClick={() =>
										setShowDeleteModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									onClick={
										confirmDelete
									}
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'#FE2C23',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Deleting...'
										: 'Delete'}
								</button>
							</div>
						</div>
					</div>
				)}

			{/* New Group Bot Modal */}
			{showNewGroupBotModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background:
							'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
					}}
					onClick={() =>
						setShowNewGroupBotModal(
							false,
						)
					}
				>
					<div
						style={{
							background: 'white',
							borderRadius: '12px',
							padding: '24px 28px',
							width: '100%',
							maxWidth: '600px',
							margin: '0 16px',
							maxHeight: '90vh',
							overflowY: 'auto',
						}}
						onClick={(e) =>
							e.stopPropagation()
						}
					>
						<div
							style={{
								display: 'flex',
								justifyContent:
									'space-between',
								alignItems: 'center',
								marginBottom: '24px',
							}}
						>
							<h3
								style={{
									fontWeight: 700,
									fontSize: '18px',
									color: 'var(--dark)',
									margin: 0,
								}}
							>
								Add Telegram Group Bot
							</h3>
							<button
								onClick={() =>
									setShowNewGroupBotModal(
										false,
									)
								}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--muted)',
									padding: 0,
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form
							onSubmit={
								handleCreateGroupBot
							}
						>
							<div
								style={{
									display: 'grid',
									gap: '18px',
								}}
							>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Group Name{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newGroupBotData.groupName
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													groupName:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., Sales Team Group"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Chat ID{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="number"
										required
										value={
											newGroupBotData.chatId ||
											''
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													chatId:
														Number(
															e.target
																.value,
														),
												}),
											)
										}
										placeholder="e.g., -1001234567890"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Category{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newGroupBotData.category
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													category:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., retail, project, collection"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
									marginTop: '24px',
								}}
							>
								<button
									type="button"
									onClick={() =>
										setShowNewGroupBotModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'var(--grad)',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Creating...'
										: 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Group Bot Modal */}
			{showEditGroupModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background:
							'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
					}}
					onClick={() =>
						setShowEditGroupModal(false)
					}
				>
					<div
						style={{
							background: 'white',
							borderRadius: '12px',
							padding: '24px 28px',
							width: '100%',
							maxWidth: '600px',
							margin: '0 16px',
							maxHeight: '90vh',
							overflowY: 'auto',
						}}
						onClick={(e) =>
							e.stopPropagation()
						}
					>
						<div
							style={{
								display: 'flex',
								justifyContent:
									'space-between',
								alignItems: 'center',
								marginBottom: '24px',
							}}
						>
							<h3
								style={{
									fontWeight: 700,
									fontSize: '18px',
									color: 'var(--dark)',
									margin: 0,
								}}
							>
								Edit Telegram Group Bot
							</h3>
							<button
								onClick={() =>
									setShowEditGroupModal(
										false,
									)
								}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--muted)',
									padding: 0,
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form
							onSubmit={
								handleUpdateGroupBot
							}
						>
							<div
								style={{
									display: 'grid',
									gap: '18px',
								}}
							>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Group Name{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newGroupBotData.groupName
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													groupName:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., Sales Team Group"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Chat ID{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="number"
										required
										value={
											newGroupBotData.chatId ||
											''
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													chatId:
														Number(
															e.target
																.value,
														),
												}),
											)
										}
										placeholder="e.g., -1001234567890"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
								<div>
									<label
										style={{
											fontWeight: 600,
											fontSize: '12px',
											color:
												'var(--dark)',
											display: 'block',
											marginBottom:
												'7px',
										}}
									>
										Category{' '}
										<span
											style={{
												color:
													'#FE2C23',
											}}
										>
											*
										</span>
									</label>
									<input
										type="text"
										required
										value={
											newGroupBotData.category
										}
										onChange={(e) =>
											setNewGroupBotData(
												(prev) => ({
													...prev,
													category:
														e.target
															.value,
												}),
											)
										}
										placeholder="e.g., retail, project, collection"
										style={{
											fontFamily:
												"'Montserrat', sans-serif",
											fontSize: '13px',
											color:
												'var(--text)',
											border:
												'1px solid var(--border)',
											borderRadius:
												'9px',
											padding:
												'10px 13px',
											background:
												'#fff',
											outline: 'none',
											transition:
												'border-color 0.18s',
											width: '100%',
										}}
										onFocus={(e) =>
											(e.target.style.borderColor =
												'var(--blue)')
										}
										onBlur={(e) =>
											(e.target.style.borderColor =
												'var(--border)')
										}
									/>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
									marginTop: '24px',
								}}
							>
								<button
									type="button"
									onClick={() =>
										setShowEditGroupModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'var(--grad)',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Saving...'
										: 'Save Changes'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Group Bot Confirmation Modal */}
			{showDeleteGroupModal &&
				deletingGroupBot && (
					<div
						style={{
							position: 'fixed',
							inset: 0,
							background:
								'rgba(0, 0, 0, 0.5)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 50,
						}}
						onClick={() =>
							setShowDeleteGroupModal(
								false,
							)
						}
					>
						<div
							style={{
								background: 'white',
								borderRadius: '12px',
								padding: '24px 28px',
								width: '100%',
								maxWidth: '420px',
								margin: '0 16px',
							}}
							onClick={(e) =>
								e.stopPropagation()
							}
						>
							<div
								style={{
									display: 'flex',
									justifyContent:
										'space-between',
									alignItems: 'center',
									marginBottom: '24px',
								}}
							>
								<h3
									style={{
										fontWeight: 700,
										fontSize: '18px',
										color:
											'var(--dark)',
										margin: 0,
									}}
								>
									Delete Telegram Group
									Bot
								</h3>
								<button
									onClick={() =>
										setShowDeleteGroupModal(
											false,
										)
									}
									style={{
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										color:
											'var(--muted)',
										padding: 0,
									}}
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</div>
							<p
								style={{
									margin: '0 0 24px',
									color: 'var(--text)',
									lineHeight: 1.6,
								}}
							>
								Are you sure you want to
								delete{' '}
								<strong>
									{
										deletingGroupBot.groupName
									}
								</strong>
								? This action cannot be
								undone.
							</p>
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent:
										'flex-end',
								}}
							>
								<button
									onClick={() =>
										setShowDeleteGroupModal(
											false,
										)
									}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										borderRadius: '9px',
										cursor: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										background: '#fff',
										border:
											'1px solid var(--border)',
										color:
											'var(--text)',
										transition: '0.18s',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											'var(--blue)';
										e.currentTarget.style.color =
											'var(--blue)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											'var(--border)';
										e.currentTarget.style.color =
											'var(--text)';
									}}
								>
									Cancel
								</button>
								<button
									onClick={
										confirmDeleteGroup
									}
									disabled={submitting}
									style={{
										display:
											'inline-flex',
										alignItems:
											'center',
										gap: '8px',
										height: '38px',
										padding: '0 18px',
										border: 'none',
										borderRadius: '9px',
										cursor: submitting
											? 'not-allowed'
											: 'pointer',
										fontFamily:
											"'Montserrat', sans-serif",
										fontWeight: 700,
										fontSize: '13px',
										color: '#fff',
										background:
											'#FE2C23',
										transition: '0.18s',
										opacity: submitting
											? 0.5
											: 1,
									}}
									onMouseEnter={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'brightness(1.07)';
											e.currentTarget.style.transform =
												'translateY(-1px)';
										}
									}}
									onMouseLeave={(e) => {
										if (!submitting) {
											e.currentTarget.style.filter =
												'none';
											e.currentTarget.style.transform =
												'none';
										}
									}}
								>
									{submitting
										? 'Deleting...'
										: 'Delete'}
								</button>
							</div>
						</div>
					</div>
				)}
		</>
	);
}
