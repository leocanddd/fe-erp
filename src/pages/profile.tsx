import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { changeUserPassword, getRoleName, getRoleColor } from '@/lib/users';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

export default function Profile() {
	const [user, setUser] = useState<User | null>(null);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
		}
	}, []);

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) return;

		// Reset messages
		setError('');
		setSuccess('');

		// Validation
		if (!newPassword.trim()) {
			setError('Password baru tidak boleh kosong');
			return;
		}

		if (newPassword.length < 6) {
			setError('Password minimal 6 karakter');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Konfirmasi password tidak cocok');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await changeUserPassword(user.username, newPassword);

			if (response.statusCode === 200) {
				setSuccess('Password berhasil diubah!');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				setError(response.error || 'Gagal mengubah password');
			}
		} catch {
			setError('Gagal mengubah password');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<MainLayout title="Profil">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<div className="text-lg text-gray-600 font-medium">
							Memuat...
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Profil">
			<div className="max-w-4xl mx-auto">
				{/* Profile Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Profil Pengguna
					</h2>
					<p className="text-gray-600">
						Kelola informasi akun dan ubah password Anda
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* User Info Card */}
					<div className="lg:col-span-1">
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Informasi Akun
							</h3>

							<div className="flex items-center space-x-4 mb-6">
								<div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-xl">
										{user.firstName.charAt(0)}
										{user.lastName.charAt(0)}
									</span>
								</div>
								<div>
									<div className="text-lg font-semibold text-gray-900">
										{user.firstName} {user.lastName}
									</div>
									<div className="text-sm text-gray-500">
										@{user.username}
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Nama Lengkap
									</dt>
									<dd className="text-sm font-semibold text-gray-900">
										{user.firstName} {user.lastName}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Username
									</dt>
									<dd className="text-sm font-semibold text-gray-900">
										{user.username}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Role
									</dt>
									<dd className="text-sm font-semibold text-gray-900">
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
											{getRoleName(user.role)}
										</span>
									</dd>
								</div>
							</div>
						</div>
					</div>

					{/* Change Password Form */}
					<div className="lg:col-span-2">
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
							<h3 className="text-lg font-semibold text-gray-900 mb-6">
								Ubah Password
							</h3>

							<form onSubmit={handlePasswordChange} className="space-y-6">
								{error && (
									<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
										<div className="text-sm text-red-600 font-medium">
											{error}
										</div>
									</div>
								)}

								{success && (
									<div className="bg-green-50 border border-green-200 rounded-2xl p-4">
										<div className="text-sm text-green-600 font-medium">
											{success}
										</div>
									</div>
								)}

								<div>
									<label
										htmlFor="newPassword"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Password Baru *
									</label>
									<input
										type="password"
										id="newPassword"
										required
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
										placeholder="Masukkan password baru"
									/>
									<p className="mt-1 text-xs text-gray-500">
										Password minimal 6 karakter
									</p>
								</div>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Konfirmasi Password *
									</label>
									<input
										type="password"
										id="confirmPassword"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
										placeholder="Konfirmasi password baru"
									/>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={isSubmitting}
										className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSubmitting ? (
											<div className="flex items-center">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
												Mengubah Password...
											</div>
										) : (
											'Ubah Password'
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}