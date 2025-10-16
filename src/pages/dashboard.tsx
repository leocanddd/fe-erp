import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getRoleName } from '@/lib/users';
import Link from 'next/link';
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

export default function AdminDashboard() {
	const [user, setUser] =
		useState<User | null>(null);
	console.log('p');
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
										{user?.role ? getRoleName(user.role) : 'Unknown'}
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
								Semua sistem beroperasi
								normal
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Access Shortcuts for Role 8 (Gudang) */}
			{user?.role === 8 && (
				<div className="mb-8">
					<h3 className="text-xl font-bold text-gray-900 mb-4">
						Akses Cepat
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Link href="/products">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer group">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
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
												d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
											/>
										</svg>
									</div>
									<div>
										<h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											Produk
										</h4>
										<p className="text-sm text-gray-600">
											Kelola inventaris produk
										</p>
									</div>
								</div>
							</div>
						</Link>

						<Link href="/orders">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer group">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
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
												d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 5a2 2 0 012 2v1a2 2 0 01-2 2H9V5z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 17h8l-3 3m0 0l3-3m-3 3v-9a4 4 0 00-4-4H9"
											/>
										</svg>
									</div>
									<div>
										<h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
											Pesanan
										</h4>
										<p className="text-sm text-gray-600">
											Kelola pesanan pelanggan
										</p>
									</div>
								</div>
							</div>
						</Link>
					</div>
				</div>
			)}
		</MainLayout>
	);
}
