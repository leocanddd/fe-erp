import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import {
	ALL_ROLE_IDS,
	getMenuPermissions,
	NAV_ITEMS,
	ROLES,
	saveMenuPermissions,
} from '@/lib/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function MenuPermissions() {
	const router = useRouter();

	// permissions: { [href]: Set of allowed role IDs (excluding 5 — always allowed) }
	const [permissions, setPermissions] =
		useState<Record<string, number[]>>({});
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const user = getStoredUser();
		if (!user || user.role !== 5) {
			router.replace('/dashboard');
			return;
		}
		setPermissions(getMenuPermissions());
	}, [router]);

	const toggle = (
		href: string,
		roleId: number,
	) => {
		setPermissions((prev) => {
			const current = prev[href] ?? [];
			const has = current.includes(roleId);
			return {
				...prev,
				[href]: has
					? current.filter(
							(r) => r !== roleId,
						)
					: [...current, roleId],
			};
		});
		setSaved(false);
	};

	const handleSave = () => {
		saveMenuPermissions(permissions);
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
	};

	const handleReset = () => {
		const defaults: Record<string, number[]> =
			{};
		for (const item of NAV_ITEMS) {
			defaults[item.href] =
				item.defaultRoles;
		}
		setPermissions(defaults);
		setSaved(false);
	};

	// Only show non-superadmin roles in columns
	const roleColumns = ALL_ROLE_IDS;

	return (
		<MainLayout title="Hak Akses Menu">
			<div className="max-w-full mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Hak Akses Menu
						</h2>
						<p className="text-gray-600 text-sm">
							Centang role yang boleh
							melihat menu. Superadmin
							selalu bisa akses semua
							menu.
						</p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={handleReset}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
						>
							Reset Default
						</button>
						<button
							onClick={handleSave}
							className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow hover:shadow-md transition-all"
						>
							Simpan
						</button>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white rounded-3xl shadow-xl overflow-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b border-gray-100">
								<th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
									Menu
								</th>
								<th className="bg-gray-50 px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[60px]">
									Path
								</th>
								{roleColumns.map(
									(roleId) => (
										<th
											key={roleId}
											className="bg-gray-50 px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[72px]"
										>
											<div className="flex flex-col items-center gap-1">
												<span className="text-blue-600 font-bold">
													{roleId}
												</span>
												<span className="text-gray-500 font-normal normal-case text-[10px] leading-tight">
													{ROLES[roleId]}
												</span>
											</div>
										</th>
									),
								)}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{NAV_ITEMS.map((item) => {
								const allowed =
									permissions[
										item.href
									] ??
									item.defaultRoles;
								return (
									<tr
										key={item.href}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
											{item.name}
										</td>
										<td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
											{item.href}
										</td>
										{roleColumns.map(
											(roleId) => {
												const checked =
													allowed.includes(
														roleId,
													);
												return (
													<td
														key={roleId}
														className="px-3 py-3 text-center"
													>
														<input
															type="checkbox"
															checked={
																checked
															}
															onChange={() =>
																toggle(
																	item.href,
																	roleId,
																)
															}
															className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
														/>
													</td>
												);
											},
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<p className="mt-4 text-xs text-gray-400">
					Perubahan disimpan di browser
					(localStorage). Reload halaman
					lain untuk melihat efeknya di
					sidebar.
				</p>
			</div>

			{/* Success toast */}
			{saved && (
				<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
					<svg
						className="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					Hak akses berhasil disimpan
				</div>
			)}
		</MainLayout>
	);
}
