import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import Sidebar from './Sidebar';

interface User {
	username: string;
	firstName: string;
	lastName: string;
	role: number;
}

interface MainLayoutProps {
	children: ReactNode;
	title?: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
	const [user, setUser] = useState<User | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated()) {
			router.push('/login');
			return;
		}

		const userData = getStoredUser();
		if (userData) {
			setUser(userData);
		} else {
			router.push('/login');
		}
	}, [router]);

	const handleLogout = () => {
		router.push('/login');
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
					<div className="text-lg text-gray-600 font-medium">
						Memuat...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
			<Sidebar user={user} sidebarOpen={sidebarOpen} onLogout={handleLogout} />

			<div
				className={`transition-all duration-300 ease-in-out ${
					sidebarOpen ? 'pl-64' : 'pl-0'
				}`}
			>
				<nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-30">
					<div className="px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center space-x-3">
								<button
									onClick={() => setSidebarOpen(!sidebarOpen)}
									className="p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
									title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
								>
									{sidebarOpen ? (
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
											/>
										</svg>
									) : (
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 5l7 7-7 7M5 5l7 7-7 7"
											/>
										</svg>
									)}
								</button>
								<h1 className="text-xl font-bold text-gray-900">
									{title || 'Dashboard'}
								</h1>
							</div>
							<div className="flex items-center space-x-4">
								<div className="hidden sm:block">
									<span className="text-sm text-gray-600">
										Selamat datang,{' '}
										<span className="font-semibold text-gray-900">
											{user.firstName}
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</nav>

				<main className="py-8 px-4 sm:px-6 lg:px-8">
					{children}
				</main>
			</div>
		</div>
	);
}