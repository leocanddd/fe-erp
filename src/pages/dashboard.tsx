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

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-gray-900">
										1,247
									</div>
									<div className="text-sm text-gray-500">
										Total Data
									</div>
								</div>
							</div>
							<h4 className="font-semibold text-gray-900 mb-2">
								Analitik
							</h4>
							<p className="text-sm text-gray-600 mb-4">
								Lihat laporan dan
								wawasan detail
							</p>
							<div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
								<span>
									Lihat laporan
								</span>
								<svg
									className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>

						<div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
										/>
									</svg>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-gray-900">
										234
									</div>
									<div className="text-sm text-gray-500">
										Pengguna Aktif
									</div>
								</div>
							</div>
							<h4 className="font-semibold text-gray-900 mb-2">
								Manajemen Pengguna
							</h4>
							<p className="text-sm text-gray-600 mb-4">
								Kelola pengguna sistem
								dan izin akses
							</p>
							<div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
								<span>
									Kelola pengguna
								</span>
								<svg
									className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>

						<div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-gray-900">
										98%
									</div>
									<div className="text-sm text-gray-500">
										Waktu Aktif
									</div>
								</div>
							</div>
							<h4 className="font-semibold text-gray-900 mb-2">
								Pengaturan Sistem
							</h4>
							<p className="text-sm text-gray-600 mb-4">
								Atur preferensi dan opsi
								sistem
							</p>
							<div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
								<span>
									Buka pengaturan
								</span>
								<svg
									className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</div>
		</MainLayout>
	);
}
