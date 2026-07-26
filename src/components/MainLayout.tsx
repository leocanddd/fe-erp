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
			<Sidebar user={user} sidebarOpen={sidebarOpen} onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

			{/* Header */}
			<div style={{
				position: 'fixed',
				top: 0,
				left: collapsed ? '64px' : '220px',
				right: 0,
				height: '64px',
				zIndex: 100,
				background: 'white',
				borderBottom: '1px solid var(--border)',
				display: 'flex',
				alignItems: 'center',
				padding: '0 32px 0 20px',
				transition: 'left 0.3s ease'
			}}>
				<button
					onClick={() => setCollapsed(!collapsed)}
					style={{
							border: 'none',
						cursor: 'pointer',
						fontFamily: "'Montserrat', sans-serif",
						fontWeight: 800,
						fontSize: '20px',
						marginRight: '16px',
						lineHeight: 1,
						padding: 0,
						background: 'linear-gradient(90deg, #61BEDF 0%, #1CA7EC 50%, #1590CD 100%)',
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent'
					}}
				>
					{collapsed ? '»' : '«'}
				</button>
				<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					<svg
						style={{ width: '18px', height: '18px', color: '#1ca7ec' }}
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
					<span style={{
						color: '#1ca7ec',
						fontWeight: 600,
						fontSize: '15px'
					}}>
						{title || 'Dashboard'}
					</span>
				</div>
				<div style={{
					marginLeft: 'auto',
					fontWeight: 800,
					fontSize: '15px',
					letterSpacing: '0.08em',
					background: 'linear-gradient(90deg, #61BEDF 0%, #1CA7EC 50%, #1590CD 100%)',
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent'
				}}>
					PT. DUTA KENCANA INDAH
				</div>
			</div>

			{/* Main content */}
			<div style={{
				marginLeft: collapsed ? '64px' : '220px',
				marginTop: '64px',
				background: '#f0f2f8',
				padding: '32px 40px',
				minHeight: 'calc(100vh - 64px)',
				transition: 'margin-left 0.3s ease'
			}}>
				{children}
			</div>
		</div>
	);
}