export interface NavItem {
	name: string;
	href: string;
	defaultRoles: number[];
	/** Jika true, item hanya dipakai untuk konfigurasi permission, tidak tampil di sidebar */
	permissionOnly?: boolean;
}

export const ROLES: Record<number, string> = {
	1: 'Sales Retail',
	2: 'Sales Project',
	3: 'Admin',
	4: 'Manajer Retail',
	5: 'Superadmin',
	6: 'Approver',
	7: 'Pricing',
	8: 'Gudang',
	9: 'Manajer Project',
	10: 'HRD',
	11: 'Kolektor',
	12: 'Blog',
	13: 'Telemarketing',
	14: 'Role 14',
};

// All role numbers that exist (excluding 5 — superadmin always sees everything)
export const ALL_ROLE_IDS = [
	1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14,
];

export const NAV_ITEMS: NavItem[] = [
	{
		name: 'Beranda',
		href: '/dashboard',
		defaultRoles: [3, 4, 5, 6, 7, 8, 9, 10],
	},
	{
		name: 'Produk',
		href: '/products',
		defaultRoles: [3, 4, 5, 6, 7, 8, 9],
	},
	{
		name: 'Stok Palet',
		href: '/stocks',
		defaultRoles: [3, 4, 5, 8],
	},
	{
		name: 'Toko',
		href: '/stores',
		defaultRoles: [4, 5],
	},
	{
		name: 'Pesanan',
		href: '/orders',
		defaultRoles: [3, 4, 5, 6, 7, 8],
	},
	{
		name: 'Pengguna',
		href: '/users',
		defaultRoles: [5],
	},
	{
		name: 'History',
		href: '/history',
		defaultRoles: [5],
	},
	{
		name: 'Profil',
		href: '/profile',
		defaultRoles: [5],
	},
	{
		name: 'Quotation',
		href: '/quotations',
		defaultRoles: [5, 9, 3],
	},
	{
		name: 'Laporan',
		href: '/reports',
		defaultRoles: [4, 5, 10],
	},
	{
		name: 'Laporan Project',
		href: '/reports-project',
		defaultRoles: [5, 9, 10],
	},
	{
		name: 'Demo',
		href: '/demo',
		defaultRoles: [4, 5],
	},
	{
		name: 'Projects',
		href: '/projects',
		defaultRoles: [9, 5],
	},
	{
		name: 'Kolektor',
		href: '/kolektor',
		defaultRoles: [6, 5],
	},
	{
		name: 'Blogs',
		href: '/blogs',
		defaultRoles: [5, 12, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14],
	},
	{
		name: 'Produk Web',
		href: '/web-products',
		defaultRoles: [5],
	},
	{
		name: 'Jobs',
		href: '/jobs',
		defaultRoles: [5],
	},
	{
		name: 'Kategori Produk',
		href: '/product-categories',
		defaultRoles: [5],
	},
	{
		name: 'Hak Akses Menu',
		href: '/menu-permissions',
		defaultRoles: [5],
	},
	{
		name: 'Approve Blog',
		href: '/blogs/approve',
		defaultRoles: [5, 12],
		permissionOnly: true,
	},
	{
		name: 'Pesanan: Setujui Harga',
		href: '/orders/action/price-approve',
		defaultRoles: [5, 7],
		permissionOnly: true,
	},
	{
		name: 'Pesanan: Setujui & Tolak',
		href: '/orders/action/approve',
		defaultRoles: [5, 6],
		permissionOnly: true,
	},
	{
		name: 'Pesanan: Proses',
		href: '/orders/action/process',
		defaultRoles: [5, 3],
		permissionOnly: true,
	},
	{
		name: 'Pesanan: Kirim & Selesai',
		href: '/orders/action/shipment',
		defaultRoles: [5, 8],
		permissionOnly: true,
	},
	{
		name: 'Kategori Produk: Hapus',
		href: '/product-categories/action/delete',
		defaultRoles: [5],
		permissionOnly: true,
	},
	{
		name: 'Dashboard: Akses Cepat',
		href: '/dashboard/quick-access',
		defaultRoles: [5, 8],
		permissionOnly: true,
	},
];

const STORAGE_KEY = 'menuPermissions';

/** Returns the current role map: { [href]: number[] } */
export function getMenuPermissions(): Record<string, number[]> {
	if (typeof window === 'undefined') return buildDefault();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// fall through
	}
	return buildDefault();
}

export function saveMenuPermissions(
	permissions: Record<string, number[]>,
): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(permissions),
	);
}

function buildDefault(): Record<string, number[]> {
	const map: Record<string, number[]> = {};
	for (const item of NAV_ITEMS) {
		map[item.href] = item.defaultRoles;
	}
	return map;
}
