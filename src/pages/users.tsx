import MainLayout from '@/components/MainLayout';
import {
	getRoleName,
	getUsers,
	registerUser,
	RegisterUserData,
	updateUser,
	User,
} from '@/lib/users';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [showNewUserModal, setShowNewUserModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [newUserData, setNewUserData] = useState<RegisterUserData>({
		username: '',
		password: '',
		firstName: '',
		lastName: '',
		role: 4,
		target: 0,
		currentOmset: 0,
	});

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getUsers();
			if (response.statusCode === 200) {
				const userData = response.data;
				if (Array.isArray(userData)) {
					setUsers(userData);
				} else {
					setUsers([]);
					setError('Invalid response format from server');
				}
				setError('');
			} else {
				setError(response.error || 'Failed to fetch users');
				setUsers([]);
			}
		} catch {
			setError('Failed to fetch users');
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result = await registerUser(newUserData);
			if (result.statusCode === 201) {
				setShowNewUserModal(false);
				setNewUserData({
					username: '',
					password: '',
					firstName: '',
					lastName: '',
					role: 4,
					target: 0,
					currentOmset: 0,
				});
				fetchUsers();
				setError('');
			} else {
				setError(result.error || 'Failed to create user');
			}
		} catch {
			setError('Failed to create user');
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setNewUserData({
			username: user.username,
			password: '',
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			target: user.target || 0,
			currentOmset: 0,
		});
		setShowEditModal(true);
	};

	const handleUpdateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingUser) return;

		setSubmitting(true);

		try {
			const { password, ...updateData } = newUserData;
			const finalUpdateData = password
				? { ...updateData, password }
				: updateData;

			const result = await updateUser(finalUpdateData);
			if (result.statusCode === 200 || result.statusCode === 201) {
				setShowEditModal(false);
				setEditingUser(null);
				setNewUserData({
					username: '',
					password: '',
					firstName: '',
					lastName: '',
					role: 4,
					target: 0,
					currentOmset: 0,
				});
				fetchUsers();
				setError('');
			} else {
				setError(result.error || 'Failed to update user');
			}
		} catch {
			setError('Failed to update user');
		} finally {
			setSubmitting(false);
		}
	};

	const getRoleChipColor = (role: number) => {
		const colors: Record<number, string> = {
			5: 'violet', // superadmin
			1: 'blue',   // retail
			2: 'blue',   // project
			3: 'amber',  // admin
			4: 'blue',   // manager retail
			6: 'amber',  // approver
			7: 'amber',  // pricing
			8: 'grey',   // gudang
			9: 'blue',   // manager project
			10: 'amber', // hrd
			11: 'blue',  // kolektor
			12: 'grey',  // blog
			13: 'grey',  // telemarketer
		};
		return colors[role] || 'grey';
	};

	const filteredUsers = users.filter((user) => {
		const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
		const username = user.username.toLowerCase();
		const query = searchQuery.toLowerCase();
		return fullName.includes(query) || username.includes(query);
	});

	return (
		<>
			<MainLayout title="Accounts">
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
							Accounts
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
						onClick={() => setShowNewUserModal(true)}
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
						Tambah Akun
					</button>
				</div>

				{/* Main Card */}
				<div style={{
					background: 'white',
					border: '1px solid var(--border)',
					borderRadius: '12px',
					padding: '24px 28px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
				}}>
					{/* Search */}
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
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Cari akun..."
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
								<span>Memuat...</span>
							</div>
						</div>
					) : filteredUsers.length === 0 ? (
						<div style={{
							textAlign: 'center',
							color: 'var(--muted)',
							padding: '48px 20px'
						}}>
							Tidak ada akun yang ditemukan
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
										Nama
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
										Role
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
										Terakhir Login
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
								{filteredUsers.map((user) => (
									<tr
										key={user._id || user.id}
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
											<div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
												<div style={{
													flex: '0 0 34px',
													width: '34px',
													height: '34px',
													borderRadius: '50%',
													background: 'var(--grad)',
													color: '#fff',
													fontWeight: 700,
													fontSize: '13px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center'
												}}>
													{user.firstName.charAt(0)}{user.lastName.charAt(0)}
												</div>
												<span style={{ fontWeight: 600, color: 'var(--text)' }}>
													{user.firstName} {user.lastName}
												</span>
											</div>
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--text)',
											verticalAlign: 'middle'
										}}>
											<span className={`chip ${getRoleChipColor(user.role)}`}>
												<span className="cdot"></span>
												{getRoleName(user.role)}
											</span>
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											color: 'var(--muted)',
											verticalAlign: 'middle'
										}}>
											—
										</td>
										<td style={{
											padding: '14px',
											borderBottom: '1px solid #F1F4F8',
											fontSize: '13px',
											verticalAlign: 'middle'
										}}>
											<span className="chip green">
												<span className="cdot"></span>
												Active
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
													onClick={() => handleEditUser(user)}
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
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</MainLayout>

			{/* New User Modal */}
			{showNewUserModal && (
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
						maxWidth: '500px',
						margin: '0 16px',
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
								Tambah Akun
							</h3>
							<button
								onClick={() => setShowNewUserModal(false)}
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
						<form onSubmit={handleCreateUser}>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px 22px' }}>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Nama
									</label>
									<input
										type="text"
										required
										value={newUserData.firstName}
										onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
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
										Username
									</label>
									<input
										type="text"
										required
										value={newUserData.username}
										onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
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
										Password
									</label>
									<input
										type="password"
										required
										value={newUserData.password}
										onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
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
										Role
									</label>
									<select
										value={newUserData.role}
										onChange={(e) => setNewUserData(prev => ({ ...prev, role: Number(e.target.value) }))}
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
										<option value={5}>Superadmin</option>
										<option value={1}>Sales Retail</option>
										<option value={2}>Sales Project</option>
										<option value={3}>Admin</option>
										<option value={4}>Manager Retail</option>
										<option value={6}>Approver</option>
										<option value={7}>Pricing</option>
										<option value={8}>Gudang</option>
										<option value={9}>Manager Project</option>
										<option value={10}>HRD</option>
										<option value={11}>Kolektor</option>
										<option value={12}>Blog</option>
										<option value={13}>Telemarketer</option>
									</select>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Status
									</label>
									<select
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
										<option value="active">Active</option>
										<option value="suspended">Suspended</option>
									</select>
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
								<button
									type="button"
									onClick={() => setShowNewUserModal(false)}
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
									{submitting ? 'Menyimpan...' : 'Tambah'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit User Modal */}
			{showEditModal && (
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
						maxWidth: '500px',
						margin: '0 16px',
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
								Edit Akun
							</h3>
							<button
								onClick={() => setShowEditModal(false)}
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
						<form onSubmit={handleUpdateUser}>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px 22px' }}>
								<div style={{ gridColumn: '1 / -1' }}>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Nama
									</label>
									<input
										type="text"
										required
										value={newUserData.firstName}
										onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
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
										Username
									</label>
									<input
										type="text"
										required
										value={newUserData.username}
										onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
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
										Password
									</label>
									<input
										type="password"
										value={newUserData.password}
										onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
										placeholder="Kosongkan jika tidak ingin mengubah"
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
										Role
									</label>
									<select
										value={newUserData.role}
										onChange={(e) => setNewUserData(prev => ({ ...prev, role: Number(e.target.value) }))}
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
										<option value={5}>Superadmin</option>
										<option value={1}>Sales Retail</option>
										<option value={2}>Sales Project</option>
										<option value={3}>Admin</option>
										<option value={4}>Manager Retail</option>
										<option value={6}>Approver</option>
										<option value={7}>Pricing</option>
										<option value={8}>Gudang</option>
										<option value={9}>Manager Project</option>
										<option value={10}>HRD</option>
										<option value={11}>Kolektor</option>
										<option value={12}>Blog</option>
										<option value={13}>Telemarketer</option>
									</select>
								</div>
								<div>
									<label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dark)', display: 'block', marginBottom: '7px' }}>
										Status
									</label>
									<select
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
										<option value="active">Active</option>
										<option value="suspended">Suspended</option>
									</select>
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
								<button
									type="button"
									onClick={() => setShowEditModal(false)}
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
									{submitting ? 'Menyimpan...' : 'Simpan'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
