import {
	getMenuPermissions,
	NAV_ITEMS,
	NavItem,
} from '@/lib/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

interface SidebarProps {
	user: User;
	sidebarOpen: boolean;
	onLogout: () => void;
	collapsed: boolean;
	setCollapsed: (
		collapsed: boolean,
	) => void;
}

const ICONS: Record<
	string,
	React.ReactNode
> = {
	'/dashboard': (
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
	'/products': (
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
	'/stocks': (
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
	'/stores': (
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
	'/orders': (
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
	'/users': (
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
	'/history': (
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
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
	'/profile': (
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
	'/quotations': (
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
	'/retail': (
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
				d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
			/>
		</svg>
	),
	'/reports': (
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
	'/reports-project': (
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
	'/demo': (
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
	'/sales-project': (
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
	'/projects': (
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
	'/kolektor': (
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
	'/blogs': (
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
	'/web-products': (
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
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/>
		</svg>
	),
	'/jobs': (
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
	'/product-categories': (
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
				d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h6"
			/>
		</svg>
	),
	'/menu-permissions': (
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
				d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
			/>
		</svg>
	),
	'/website': (
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
				d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
	'/point': (
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
				d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
	'/rockwoolindo': (
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
	'/upload-image': (
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
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	),
	'/inventory': (
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
				d="M21 8L12 3 3 8l9 5 9-5Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 8v8l9 5 9-5V8"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="m7.5 5.5 9 5"
			/>
		</svg>
	),
	'/admin': (
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
				d="M12 3L4 6v5c0 4.5 3.2 7.8 8 10 4.8-2.2 8-5.5 8-10V6l-8-3Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 12l2 2 4-4"
			/>
		</svg>
	),
};

export default function Sidebar({
	user,
	sidebarOpen,
	onLogout,
	collapsed,
	setCollapsed,
}: SidebarProps) {
	const router = useRouter();
	const [
		openDropdown,
		setOpenDropdown,
	] = useState<string | null>(null);

	const permissions =
		getMenuPermissions();

	// Superadmin (role 5) always sees everything
	// permissionOnly items hanya untuk konfigurasi, tidak tampil di sidebar
	const navigationItems =
		NAV_ITEMS.filter(
			(item) =>
				!item.permissionOnly &&
				(user.role === 5 ||
					(
						permissions[item.href] ??
						item.defaultRoles
					).includes(user.role)),
		);

	useEffect(() => {
		const savedCollapsed =
			localStorage.getItem(
				'sidebarCollapsed',
			);
		if (savedCollapsed === '1') {
			setCollapsed(true);
		}
	}, [setCollapsed]);

	const toggleCollapse = () => {
		const newCollapsed = !collapsed;
		setCollapsed(newCollapsed);
		localStorage.setItem(
			'sidebarCollapsed',
			newCollapsed ? '1' : '0',
		);
		if (newCollapsed) {
			setOpenDropdown(null);
		}
	};

	const toggleDropdown = (
		href: string,
	) => {
		if (!collapsed) {
			setOpenDropdown(
				openDropdown === href
					? null
					: href,
			);
		}
	};

	const isActive = (item: NavItem) => {
		if (item.submenu) {
			return item.submenu.some(
				(sub) =>
					router.pathname === sub.href,
			);
		}
		return (
			router.pathname === item.href
		);
	};

	return (
		<>
			<Head>
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<style jsx global>{`
				:root {
					--dark: #121567;
					--blue: #1ca7ec;
					--red: #fe2c23;
					--text: #111111;
					--muted: #9a9a9a;
					--border: #e0e0e0;
					--grad: linear-gradient(
						90deg,
						#61bedf 0%,
						#1ca7ec 50%,
						#1590cd 100%
					);
					--sidebar-w: 220px;
				}
			`}</style>
			<div
				className={`sidebar ${collapsed ? 'collapsed' : ''}`}
				style={{
					position: 'fixed',
					left: 0,
					top: 0,
					height: '100vh',
					width: collapsed
						? '64px'
						: '220px',
					background: 'white',
					borderRight:
						'1px solid var(--border)',
					zIndex: 200,
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					transition: 'width 0.3s ease',
					fontFamily:
						"'Montserrat', sans-serif",
				}}
			>
				{/* Logo */}
				<div
					style={{
						height: '64px',
						minHeight: '64px',
						borderBottom:
							'1px solid var(--border)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: collapsed
							? 'center'
							: 'center',
						padding: collapsed
							? '0'
							: '0 16px',
						overflow: 'hidden',
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="https://assetsdki.my.id/dki-logo.jpeg"
						alt="PT Duta Kencana Indah"
						style={{
							height: collapsed
								? '34px'
								: '40px',
							width: 'auto',
							objectFit: 'contain',
							display: 'block',
						}}
					/>
				</div>

				{/* Navigation */}
				<nav
					style={{
						flex: 1,
						overflowY: 'auto',
						overflowX: 'hidden',
						padding: '12px 0',
					}}
				>
					{navigationItems.map(
						(item) => {
							if (item.submenu) {
								const isOpen =
									openDropdown ===
									item.href;
								const active =
									isActive(item);
								const selectedSubIndex =
									item.submenu.findIndex(
										(sub) =>
											router.pathname ===
											sub.href,
									);

								return (
									<div
										key={item.href}
										style={{
											position:
												'relative',
										}}
										className="nav-group"
									>
										<div
											onClick={() => {
												if (!collapsed)
													toggleDropdown(
														item.href,
													);
												else
													router.push(
														item.href,
													);
											}}
											style={{
												height: '48px',
												display: 'flex',
												alignItems:
													'center',
												gap: '12px',
												padding:
													collapsed
														? '0'
														: '0 16px',
												cursor:
													'pointer',
												position:
													'relative',
												color: active
													? '#fff'
													: 'var(--text)',
												background:
													active
														? 'var(--grad)'
														: 'transparent',
												borderRadius:
													active
														? '10px'
														: '0',
												margin: active
													? '0 8px'
													: '0',
												transition:
													'color 0.2s ease, background 0.2s ease',
												whiteSpace:
													'nowrap',
												justifyContent:
													collapsed
														? 'center'
														: 'flex-start',
											}}
											onMouseEnter={(
												e,
											) => {
												if (!active)
													e.currentTarget.style.color =
														'var(--blue)';
											}}
											onMouseLeave={(
												e,
											) => {
												if (!active)
													e.currentTarget.style.color =
														'var(--text)';
											}}
											className="nav-item"
										>
											<div
												style={{
													flex: collapsed
														? 'none'
														: '0 0 20px',
													width: '20px',
													height:
														'20px',
													color: active
														? '#fff'
														: 'var(--muted)',
													transition:
														'color 0.2s ease',
												}}
											>
												{
													ICONS[
														item.href
													]
												}
											</div>
											{!collapsed && (
												<>
													<span
														style={{
															fontWeight: 500,
															fontSize:
																'14px',
															flex: 1,
														}}
													>
														{item.name}
													</span>
													<svg
														style={{
															width:
																'16px',
															height:
																'16px',
															color:
																active
																	? '#fff'
																	: 'var(--muted)',
															transition:
																'transform 0.2s ease, color 0.2s ease',
															transform:
																isOpen
																	? 'rotate(180deg)'
																	: 'rotate(0deg)',
														}}
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<polyline points="6 9 12 15 18 9" />
													</svg>
												</>
											)}
											{collapsed && (
												<span
													style={{
														position:
															'absolute',
														left: '64px',
														top: '50%',
														transform:
															'translateY(-50%)',
														background:
															'var(--dark)',
														color:
															'#fff',
														fontSize:
															'12px',
														fontWeight: 600,
														padding:
															'5px 10px',
														borderRadius:
															'6px',
														whiteSpace:
															'nowrap',
														opacity: 0,
														pointerEvents:
															'none',
														transition:
															'opacity 0.15s ease',
														zIndex: 300,
														marginLeft:
															'8px',
													}}
													className="tooltip"
												>
													{item.name}
													<span
														style={{
															content:
																'""',
															position:
																'absolute',
															left: '-4px',
															top: '50%',
															transform:
																'translateY(-50%) rotate(45deg)',
															width:
																'8px',
															height:
																'8px',
															background:
																'var(--dark)',
														}}
													/>
												</span>
											)}
										</div>

										{/* Submenu */}
										{!collapsed &&
											isOpen && (
												<div
													style={{
														overflow:
															'hidden',
														transition:
															'height 0.25s ease',
													}}
												>
													{item.submenu
														.filter(
															(
																subItem,
															) =>
																user.role ===
																	5 ||
																(
																	permissions[
																		subItem
																			.href
																	] ??
																	subItem.defaultRoles
																).includes(
																	user.role,
																),
														)
														.map(
															(
																subItem,
															) => {
																const isSelected =
																	router.pathname ===
																	subItem.href;
																return (
																	<Link
																		key={
																			subItem.href
																		}
																		href={
																			subItem.href
																		}
																		style={{
																			display:
																				'block',
																			height:
																				'38px',
																			lineHeight:
																				'38px',
																			paddingLeft:
																				'48px',
																			fontSize:
																				'13px',
																			color:
																				isSelected
																					? 'var(--blue)'
																					: 'var(--muted)',
																			textDecoration:
																				'none',
																			whiteSpace:
																				'nowrap',
																			transition:
																				'color 0.2s ease',
																			fontWeight:
																				isSelected
																					? 600
																					: 400,
																			position:
																				'relative',
																		}}
																		onMouseEnter={(
																			e,
																		) =>
																			(e.currentTarget.style.color =
																				'var(--blue)')
																		}
																		onMouseLeave={(
																			e,
																		) => {
																			if (
																				!isSelected
																			)
																				e.currentTarget.style.color =
																					'var(--muted)';
																		}}
																	>
																		{isSelected && (
																			<span
																				style={{
																					content:
																						'""',
																					position:
																						'absolute',
																					left: '32px',
																					top: '50%',
																					transform:
																						'translateY(-50%)',
																					width:
																						'6px',
																					height:
																						'6px',
																					borderRadius:
																						'50%',
																					background:
																						'var(--grad)',
																				}}
																			/>
																		)}
																		{
																			subItem.name
																		}
																	</Link>
																);
															},
														)}
												</div>
											)}

										{/* Collapsed flyout submenu */}
										{collapsed && (
											<div
												className="submenu-flyout"
												style={{
													position:
														'absolute',
													left: '60px',
													top: 0,
													minWidth:
														'184px',
													background:
														'white',
													border:
														'1px solid var(--border)',
													borderRadius:
														'12px',
													boxShadow:
														'0 12px 32px rgba(18,21,103,0.16)',
													padding:
														'8px 0',
													opacity: 0,
													visibility:
														'hidden',
													transform:
														'translateX(-6px)',
													transition:
														'opacity 0.16s ease, transform 0.16s ease, visibility 0.16s ease',
													zIndex: 300,
													pointerEvents:
														'none',
												}}
											>
												<div
													style={{
														display:
															'block',
														padding:
															'2px 18px 8px',
														marginBottom:
															'4px',
														fontWeight: 700,
														fontSize:
															'13px',
														color:
															'var(--text)',
														borderBottom:
															'1px solid var(--border)',
													}}
												>
													{item.name}
												</div>
												{item.submenu
													.filter(
														(subItem) =>
															user.role ===
																5 ||
															(
																permissions[
																	subItem
																		.href
																] ??
																subItem.defaultRoles
															).includes(
																user.role,
															),
													)
													.map(
														(
															subItem,
														) => {
															const isSelected =
																router.pathname ===
																subItem.href;
															return (
																<Link
																	key={
																		subItem.href
																	}
																	href={
																		subItem.href
																	}
																	style={{
																		display:
																			'block',
																		height:
																			'36px',
																		lineHeight:
																			'36px',
																		paddingLeft:
																			'18px',
																		fontSize:
																			'13px',
																		color:
																			isSelected
																				? 'var(--blue)'
																				: 'var(--muted)',
																		textDecoration:
																			'none',
																		transition:
																			'color 0.2s ease',
																		fontWeight:
																			isSelected
																				? 600
																				: 400,
																		position:
																			'relative',
																	}}
																	onMouseEnter={(
																		e,
																	) =>
																		(e.currentTarget.style.color =
																			'var(--blue)')
																	}
																	onMouseLeave={(
																		e,
																	) => {
																		if (
																			!isSelected
																		)
																			e.currentTarget.style.color =
																				'var(--muted)';
																	}}
																>
																	{isSelected && (
																		<span
																			style={{
																				content:
																					'""',
																				position:
																					'absolute',
																				left: '6px',
																				top: '50%',
																				transform:
																					'translateY(-50%)',
																				width:
																					'6px',
																				height:
																					'6px',
																				borderRadius:
																					'50%',
																				background:
																					'var(--grad)',
																			}}
																		/>
																	)}
																	{
																		subItem.name
																	}
																</Link>
															);
														},
													)}
											</div>
										)}
									</div>
								);
							}

							// Regular menu item
							const active =
								router.pathname ===
								item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									style={{
										height: '48px',
										display: 'flex',
										alignItems:
											'center',
										gap: '12px',
										padding: collapsed
											? '0'
											: '0 16px',
										cursor: 'pointer',
										position:
											'relative',
										color: active
											? '#fff'
											: 'var(--text)',
										background: active
											? 'var(--grad)'
											: 'transparent',
										borderRadius: active
											? '10px'
											: '0',
										margin: active
											? '0 8px'
											: '0',
										transition:
											'color 0.2s ease, background 0.2s ease',
										whiteSpace:
											'nowrap',
										textDecoration:
											'none',
										justifyContent:
											collapsed
												? 'center'
												: 'flex-start',
									}}
									onMouseEnter={(e) => {
										if (!active)
											e.currentTarget.style.color =
												'var(--blue)';
									}}
									onMouseLeave={(e) => {
										if (!active)
											e.currentTarget.style.color =
												'var(--text)';
									}}
								>
									<div
										style={{
											flex: collapsed
												? 'none'
												: '0 0 20px',
											width: '20px',
											height: '20px',
											color: active
												? '#fff'
												: 'var(--muted)',
											transition:
												'color 0.2s ease',
										}}
									>
										{ICONS[item.href]}
									</div>
									{!collapsed && (
										<span
											style={{
												fontWeight: 500,
												fontSize:
													'14px',
												flex: 1,
											}}
										>
											{item.name}
										</span>
									)}
									{collapsed && (
										<span
											style={{
												position:
													'absolute',
												left: '64px',
												top: '50%',
												transform:
													'translateY(-50%)',
												background:
													'var(--dark)',
												color: '#fff',
												fontSize:
													'12px',
												fontWeight: 600,
												padding:
													'5px 10px',
												borderRadius:
													'6px',
												whiteSpace:
													'nowrap',
												opacity: 0,
												pointerEvents:
													'none',
												transition:
													'opacity 0.15s ease',
												zIndex: 300,
												marginLeft:
													'8px',
											}}
											className="tooltip"
										>
											{item.name}
											<span
												style={{
													content: '""',
													position:
														'absolute',
													left: '-4px',
													top: '50%',
													transform:
														'translateY(-50%) rotate(45deg)',
													width: '8px',
													height: '8px',
													background:
														'var(--dark)',
												}}
											/>
										</span>
									)}
								</Link>
							);
						},
					)}
				</nav>

				{/* User section */}
				<div
					style={{
						borderTop:
							'1px solid var(--border)',
						padding: '8px 0',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							padding: '10px 16px',
							whiteSpace: 'nowrap',
							justifyContent: collapsed
								? 'center'
								: 'flex-start',
						}}
					>
						<div
							style={{
								flex: '0 0 40px',
								width: '40px',
								height: '40px',
								borderRadius: '50%',
								background:
									'var(--grad)',
								display: 'flex',
								alignItems: 'center',
								justifyContent:
									'center',
								color: '#fff',
								fontWeight: 700,
								fontSize: '16px',
							}}
						>
							{user?.firstName?.charAt(
								0,
							)}
							{user?.lastName?.charAt(
								0,
							)}
						</div>
						{!collapsed && (
							<div style={{ flex: 1 }}>
								<div
									style={{
										fontWeight: 700,
										fontSize: '14px',
										color:
											'var(--dark)',
										lineHeight: 1.2,
									}}
								>
									{user.firstName}
								</div>
								<div
									style={{
										fontSize: '12px',
										color:
											'var(--muted)',
									}}
								>
									{user.username}
								</div>
							</div>
						)}
					</div>
					<button
						onClick={onLogout}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: collapsed
								? '10px 0'
								: '10px 16px',
							cursor: 'pointer',
							color: 'var(--muted)',
							transition:
								'color 0.2s ease',
							whiteSpace: 'nowrap',
							textDecoration: 'none',
							background: 'none',
							border: 'none',
							width: '100%',
							justifyContent: collapsed
								? 'center'
								: 'flex-start',
							fontFamily:
								"'Montserrat', sans-serif",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color =
								'var(--red)')
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color =
								'var(--muted)')
						}
					>
						<svg
							style={{
								flex: '0 0 20px',
								width: '20px',
								height: '20px',
							}}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						{!collapsed && (
							<span
								style={{
									fontWeight: 600,
									fontSize: '13px',
								}}
							>
								Keluar
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Hover styles for collapsed submenu */}
			<style jsx global>{`
				.nav-group:hover
					.submenu-flyout {
					opacity: 1 !important;
					visibility: visible !important;
					transform: translateX(
						0
					) !important;
					pointer-events: auto !important;
				}
				.nav-item:hover .tooltip {
					opacity: ${collapsed
						? '1'
						: '0'} !important;
				}
				.nav-group:has(.submenu-flyout)
					.tooltip {
					display: none !important;
				}
			`}</style>
		</>
	);
}
