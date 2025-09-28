import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

export default function AdminDashboard() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
		}
	}, []);

	return (
		<MainLayout title="Beranda">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Selamat datang kembali,{' '}
					{user?.firstName || 'User'}
						</h2>
						<p className="text-gray-600">
							Kelola sistem ERP PT. Duta
							Kencana Indah dari beranda
							ini.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
						<div className="lg:col-span-2">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Informasi Akun
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-1">
										<dt className="text-sm font-medium text-gray-500">
											Nama Pengguna
										</dt>
										<dd className="text-base font-semibold text-gray-900">
											{user?.username}
										</dd>
									</div>
									<div className="space-y-1">
										<dt className="text-sm font-medium text-gray-500">
											Nama Depan
										</dt>
										<dd className="text-base font-semibold text-gray-900">
											{user?.firstName}
										</dd>
									</div>
									<div className="space-y-1">
										<dt className="text-sm font-medium text-gray-500">
											Nama Belakang
										</dt>
										<dd className="text-base font-semibold text-gray-900">
											{user?.lastName}
										</dd>
									</div>
									<div className="space-y-1">
										<dt className="text-sm font-medium text-gray-500">
											Tingkat Peran
										</dt>
										<dd className="text-base font-semibold text-gray-900">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
												Admin (
												{user?.role})
											</span>
										</dd>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
								<h3 className="text-lg font-semibold mb-2">
									Status Sistem
								</h3>
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
									<span className="text-sm font-medium">
										Semua sistem
										beroperasi normal
									</span>
								</div>
							</div>
						</div>
					</div>

		</MainLayout>
	);
}
