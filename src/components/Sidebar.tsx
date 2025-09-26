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

	const navigationItems = [
		{
			name: 'Beranda',
			href: '/dashboard',
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
			name: 'Toko',
			href: '/stores',
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
	];

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

				<nav className="flex-1 px-4 py-6 space-y-2">
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
								{user.firstName.charAt(
									0
								)}
								{user.lastName.charAt(
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
