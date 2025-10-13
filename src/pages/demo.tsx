import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/MainLayout';
import { getUsers, User, getRoleName } from '@/lib/users';

export default function Demo() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	const fetchSalesRetailUsers = useCallback(async () => {
		setLoading(true);
		try {
			// Fetch users with role 1 (Sales Retail)
			const response = await getUsers(undefined, 1);
			if (response.statusCode === 200) {
				const userData = response.data;
				if (Array.isArray(userData)) {
					setUsers(userData);
				} else {
					setUsers([]);
					setError('Invalid response format from server');
				}
				setError('');
			} else {
				setError(response.error || 'Failed to fetch users');
				setUsers([]);
			}
		} catch {
			setError('Failed to fetch users');
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSalesRetailUsers();
	}, [fetchSalesRetailUsers]);

	const handleUserClick = (username: string) => {
		router.push(`/demo/${username}`);
	};

	return (
		<MainLayout title="Demo - Sales Retail Users">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Retail Users</h2>
					<p className="text-gray-600">Click on a user to view their today&apos;s visits on map</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">{error}</div>
					</div>
				)}

				{/* Users Grid */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">Loading users...</span>
							</div>
						</div>
					) : !users || users.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							No sales retail users found
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
							{users.map((user) => (
								<div
									key={user.username}
									onClick={() => handleUserClick(user.username)}
									className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-300 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
											<span className="text-white font-semibold text-lg">
												{user.firstName.charAt(0)}{user.lastName.charAt(0)}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-lg font-semibold text-gray-900 truncate">
												{user.firstName} {user.lastName}
											</h3>
											<p className="text-sm text-gray-500 truncate">@{user.username}</p>
											<span className="inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
												{getRoleName(user.role)}
											</span>
										</div>
										<div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
