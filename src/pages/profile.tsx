import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import {
	changeUserPassword,
	getRoleName,
} from '@/lib/users';
import {
	useEffect,
	useState,
} from 'react';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

export default function Profile() {
	const [user, setUser] =
		useState<User | null>(null);
	const [fullName, setFullName] =
		useState('');
	const [oldPassword, setOldPassword] =
		useState('');
	const [newPassword, setNewPassword] =
		useState('');
	const [
		confirmPassword,
		setConfirmPassword,
	] = useState('');
	const [
		isSubmitting,
		setIsSubmitting,
	] = useState(false);
	const [error, setError] =
		useState('');
	const [success, setSuccess] =
		useState('');

	useEffect(() => {
		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
			setFullName(
				`${userData.firstName} ${userData.lastName}`,
			);
		}
	}, []);

	const handlePasswordChange = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();

		if (!user) return;

		// Reset messages
		setError('');
		setSuccess('');

		// Validation
		if (!newPassword.trim()) {
			setError(
				'Password baru tidak boleh kosong',
			);
			return;
		}

		if (newPassword.length < 6) {
			setError(
				'Password minimal 6 karakter',
			);
			return;
		}

		if (
			newPassword !== confirmPassword
		) {
			setError(
				'Konfirmasi password tidak cocok',
			);
			return;
		}

		setIsSubmitting(true);

		try {
			const response =
				await changeUserPassword(
					user.username,
					newPassword,
				);

			if (response.statusCode === 200) {
				setSuccess(
					'Password berhasil diubah!',
				);
				setOldPassword('');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				setError(
					response.error ||
						'Gagal mengubah password',
				);
			}
		} catch {
			setError(
				'Gagal mengubah password',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<MainLayout title="Profil">
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '400px',
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
						<div
							style={{
								fontSize: '18px',
								color: '#111111',
								fontWeight: 500,
							}}
						>
							Memuat...
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	const getRoleChipColor = (
		role: number,
	) => {
		const colors: Record<
			number,
			string
		> = {
			5: 'violet', // superadmin
			1: 'blue', // retail
			2: 'green', // project
			3: 'amber', // kolektor
			4: 'grey', // warehouse
		};
		return colors[role] || 'grey';
	};

	return (
		<MainLayout title="Profil">
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
			`}</style>

			{/* Profile Card */}
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
				{/* Profile Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '20px',
						paddingBottom: '24px',
						borderBottom:
							'1px solid var(--border)',
						marginBottom: '24px',
					}}
				>
					<div
						style={{
							flex: '0 0 76px',
							width: '76px',
							height: '76px',
							borderRadius: '50%',
							background: 'var(--grad)',
							color: '#fff',
							fontWeight: 800,
							fontSize: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{user.firstName.charAt(0)}
						{user.lastName.charAt(0)}
					</div>
					<div>
						<div
							style={{
								fontWeight: 800,
								fontSize: '20px',
								color: 'var(--dark)',
								marginBottom: '6px',
							}}
						>
							{user.firstName}{' '}
							{user.lastName}
						</div>
						<div
							style={{
								marginBottom: '7px',
							}}
						>
							<span
								className={`chip ${getRoleChipColor(user.role)}`}
							>
								<span className="cdot"></span>
								{getRoleName(user.role)}
							</span>
						</div>
					</div>
					{/* <button
						style={{
							marginLeft: 'auto',
							display: 'inline-flex',
							alignItems: 'center',
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
							color: 'var(--text)',
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
						Ganti Foto
					</button> */}
				</div>

				<form
					onSubmit={
						handlePasswordChange
					}
				>
					{/* Account Information */}
					<div
						style={{
							marginBottom: '26px',
						}}
					>
						<h3
							style={{
								fontWeight: 700,
								fontSize: '15px',
								color: 'var(--dark)',
								margin: '0 0 14px',
							}}
						>
							Informasi Akun
						</h3>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns:
									'repeat(2, 1fr)',
								gap: '18px 22px',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Nama Lengkap
								</label>
								<input
									type="text"
									value={fullName}
									onChange={(e) =>
										setFullName(
											e.target.value,
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
										borderRadius: '9px',
										padding:
											'10px 13px',
										background: '#fff',
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
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Jabatan
								</label>
								<input
									type="text"
									value="—"
									disabled
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--muted)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background:
											'#f4f6f9',
										outline: 'none',
										width: '100%',
									}}
								/>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Departemen
								</label>
								<input
									type="text"
									value="—"
									disabled
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--muted)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background:
											'#f4f6f9',
										outline: 'none',
										width: '100%',
									}}
								/>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Role
								</label>
								<input
									type="text"
									value={getRoleName(
										user.role,
									)}
									disabled
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--muted)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background:
											'#f4f6f9',
										outline: 'none',
										width: '100%',
									}}
								/>
							</div>
						</div>
					</div>

					{/* Security Section */}
					<div
						style={{
							marginTop: '26px',
							paddingTop: '24px',
							borderTop:
								'1px solid var(--border)',
						}}
					>
						<h3
							style={{
								fontWeight: 700,
								fontSize: '15px',
								color: 'var(--dark)',
								margin: '0 0 14px',
							}}
						>
							Keamanan
						</h3>

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

						{success && (
							<div
								style={{
									background: '#E7F7EE',
									border:
										'1px solid #27AE60',
									borderRadius: '9px',
									padding: '12px 16px',
									marginBottom: '18px',
								}}
							>
								<div
									style={{
										fontSize: '13px',
										color: '#27AE60',
										fontWeight: 600,
									}}
								>
									{success}
								</div>
							</div>
						)}

						<div
							style={{
								display: 'grid',
								gridTemplateColumns:
									'repeat(2, 1fr)',
								gap: '18px 22px',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Password Lama
								</label>
								<input
									type="password"
									value={oldPassword}
									onChange={(e) =>
										setOldPassword(
											e.target.value,
										)
									}
									placeholder="••••••••"
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--text)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background: '#fff',
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
							<div></div>
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Password Baru
								</label>
								<input
									type="password"
									value={newPassword}
									onChange={(e) =>
										setNewPassword(
											e.target.value,
										)
									}
									placeholder="Password baru"
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--text)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background: '#fff',
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
							<div
								style={{
									display: 'flex',
									flexDirection:
										'column',
									gap: '7px',
									minWidth: 0,
								}}
							>
								<label
									style={{
										fontWeight: 600,
										fontSize: '12px',
										color:
											'var(--dark)',
									}}
								>
									Konfirmasi Password
								</label>
								<input
									type="password"
									value={
										confirmPassword
									}
									onChange={(e) =>
										setConfirmPassword(
											e.target.value,
										)
									}
									placeholder="Ulangi password baru"
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										fontSize: '13px',
										color:
											'var(--text)',
										border:
											'1px solid var(--border)',
										borderRadius: '9px',
										padding:
											'10px 13px',
										background: '#fff',
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
					</div>

					{/* Actions */}
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
							style={{
								display: 'inline-flex',
								alignItems: 'center',
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
								color: 'var(--text)',
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
							Batal
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '8px',
								height: '38px',
								padding: '0 18px',
								border: 'none',
								borderRadius: '9px',
								cursor: isSubmitting
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
								opacity: isSubmitting
									? 0.5
									: 1,
							}}
							onMouseEnter={(e) => {
								if (!isSubmitting) {
									e.currentTarget.style.filter =
										'brightness(1.07)';
									e.currentTarget.style.transform =
										'translateY(-1px)';
								}
							}}
							onMouseLeave={(e) => {
								if (!isSubmitting) {
									e.currentTarget.style.filter =
										'none';
									e.currentTarget.style.transform =
										'none';
								}
							}}
						>
							{isSubmitting
								? 'Menyimpan...'
								: 'Simpan Perubahan'}
						</button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
