import Link from 'next/link';
import { useRouter } from 'next/router';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

interface SidebarProps {
	user: User;
	sidebarOpen: boolean;
	onLogout: () => void;
}

export default function Sidebar({
	user,
	sidebarOpen,
	onLogout,
}: SidebarProps) {
	const router = useRouter();

	const allNavigationItems = [
		{
			name: 'Beranda',
			href: '/dashboard',
			roles: [3, 4, 5, 6, 7, 8, 9, 10], // All roles
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"
					/>
				</svg>
			),
		},
		{
			name: 'Produk',
			href: '/products',
			roles: [3, 4, 5, 6, 7, 8, 9], // Admin, Superadmin, Approver, Pricing, Gudang
			icon: (
				<svg
					className="w-5 h-5"
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
			),
		},
		{
			name: 'Stok Palet',
			href: '/stocks',
			roles: [3, 4, 5, 8], // Admin, Superadmin, Gudang
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
					/>
				</svg>
			),
		},
		{
			name: 'Toko',
			href: '/stores',
			roles: [4, 5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
			),
		},
		{
			name: 'Pesanan',
			href: '/orders',
			roles: [3, 4, 5, 6, 7, 8], // Admin, Manager Retail, Superadmin, Approver, Pricing, Gudang
			icon: (
				<svg
					className="w-5 h-5"
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
			),
		},
		{
			name: 'Analitik',
			href: '/analytics',
			roles: [5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
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
			),
		},
		{
			name: 'Pengguna',
			href: '/users',
			roles: [5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
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
			),
		},
		{
			name: 'Profil',
			href: '/profile',
			roles: [5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			),
		},
		{
			name: 'Pengaturan',
			href: '/settings',
			roles: [5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
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
			),
		},
		{
			name: 'Laporan',
			href: '/reports',
			roles: [4, 5, 10], // Manager Retail, Superadmin, HRD
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
		},
		{
			name: 'Laporan Project',
			href: '/reports-project',
			roles: [5, 9, 10], // Superadmin, Manager Project, HRD
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
		},
		{
			name: 'Demo',
			href: '/demo',
			roles: [4, 5], // Manager Retail, Superadmin
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
					/>
				</svg>
			),
		},
		{
			name: 'Projects',
			href: '/projects',
			roles: [9, 5], // Only Manager Project
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
					/>
				</svg>
			),
		},
		{
			name: 'Kolektor',
			href: '/kolektor',
			roles: [6, 5], // Only Approver
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
			),
		},
		{
			name: 'Blogs',
			href: '/blogs',
			roles: [
				5, 12, 1, 2, 3, 4, 6, 7, 8, 9,
				10, 11, 13, 14,
			], // Superadmin, Blog
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
					/>
				</svg>
			),
		},
		{
			name: 'Jobs',
			href: '/jobs',
			roles: [5], // Only Superadmin
			icon: (
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			),
		},
	];

	// Filter navigation items based on user role
	const navigationItems =
		allNavigationItems.filter((item) =>
			item.roles.includes(user.role)
		);

	return (
		<div
			className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
				sidebarOpen
					? 'translate-x-0'
					: '-translate-x-full'
			} transition-transform duration-300 ease-in-out`}
		>
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
							<div className="w-4 h-4 bg-white rounded-sm"></div>
						</div>
						<span className="text-xl font-bold text-gray-900">
							Admin
						</span>
					</div>
				</div>

				<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
					{navigationItems.map(
						(item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
									router.pathname ===
									item.href
										? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
										: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
								}`}
							>
								{item.icon}
								<span>{item.name}</span>
							</Link>
						)
					)}
				</nav>

				<div className="px-4 py-6 border-t border-gray-200">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
							<span className="text-white font-semibold text-sm">
								{user?.firstName?.charAt(
									0
								)}
								{user?.lastName?.charAt(
									0
								)}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-gray-900 truncate">
								{user.firstName}{' '}
								{user.lastName}
							</p>
							<p className="text-xs text-gray-500 truncate">
								{user.username}
							</p>
						</div>
					</div>
					<button
						onClick={onLogout}
						className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						<span>Keluar</span>
					</button>
				</div>
			</div>
		</div>
	);
}
