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
	const [collapsed, setCollapsed] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
			<div style={{
				minHeight: '100vh',
				background: '#f0f2f8',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: "'Montserrat', sans-serif"
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
					<div style={{
						fontSize: '18px',
						color: '#111111',
						fontWeight: 500
					}}>
						Memuat...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={{
			minHeight: '100vh',
			background: '#f0f2f8',
			fontFamily: "'Montserrat', sans-serif"
		}}>
			<style jsx global>{`
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
			<Sidebar
				user={user}
				sidebarOpen={sidebarOpen}
				onLogout={handleLogout}
				collapsed={collapsed}
				setCollapsed={setCollapsed}
				mobileMenuOpen={mobileMenuOpen}
				setMobileMenuOpen={setMobileMenuOpen}
			/>

			{/* Header */}
			<style jsx>{`
				.app-header {
					position: fixed;
					top: 0;
					left: ${collapsed ? '64px' : '220px'};
					right: 0;
					height: 64px;
					z-index: 100;
					background: white;
					border-bottom: 1px solid #e5e7eb;
					display: flex;
					align-items: center;
					padding: 0 32px;
					transition: left 0.3s ease;
				}
				@media (max-width: 639px) {
					.app-header {
						left: 0 !important;
						padding: 0 12px !important;
					}
				}
				@media (min-width: 640px) and (max-width: 1023px) {
					.app-header {
						padding: 0 20px !important;
					}
				}
			`}</style>
			<div className="app-header">
				{/* Mobile menu button */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="sm:hidden border-0 cursor-pointer p-2 mr-2 text-[#1ca7ec]"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				{/* Desktop collapse button */}
				<button
					onClick={() => setCollapsed(!collapsed)}
					className="hidden md:block border-0 cursor-pointer font-extrabold text-xl mr-4 leading-none p-0 bg-gradient-to-r from-[#61BEDF] via-[#1CA7EC] to-[#1590CD] bg-clip-text text-transparent"
					style={{
						fontFamily: "'Montserrat', sans-serif",
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
					}}
				>
					{collapsed ? '»' : '«'}
				</button>
				<div className="flex items-center gap-2">
					<svg
						className="w-4 h-4 sm:w-5 sm:h-5 text-[#1ca7ec]"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 9.5L12 3l9 6.5" />
						<path d="M5 10v10h14V10" />
					</svg>
					<span className="text-[#1ca7ec] font-semibold text-sm sm:text-base">
						{title || 'Dashboard'}
					</span>
				</div>
				<div className="ml-auto font-extrabold text-[10px] sm:text-xs md:text-sm tracking-wider bg-gradient-to-r from-[#61BEDF] via-[#1CA7EC] to-[#1590CD] bg-clip-text text-transparent"
					style={{
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
					}}
				>
					PT. DUTA KENCANA INDAH
				</div>
			</div>

			{/* Main content */}
			<style jsx>{`
				.app-content {
					margin-left: ${collapsed ? '64px' : '220px'};
					margin-top: 64px;
					background: #f0f2f8;
					padding: 32px 40px;
					min-height: calc(100vh - 64px);
					transition: margin-left 0.3s ease;
				}
				@media (max-width: 639px) {
					.app-content {
						margin-left: 0 !important;
						padding: 16px !important;
					}
				}
				@media (min-width: 640px) and (max-width: 1023px) {
					.app-content {
						padding: 24px !important;
					}
				}
			`}</style>
			<div className="app-content">
				{children}
			</div>
		</div>
	);
}