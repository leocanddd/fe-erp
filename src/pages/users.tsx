import MainLayout from '@/components/MainLayout';
import {
	getRoleColor,
	getRoleName,
	getUsers,
	registerUser,
	RegisterUserData,
	updateUser,
	User,
} from '@/lib/users';
import {
	useCallback,
	useEffect,
	useState,
} from 'react';

export default function Users() {
	const [users, setUsers] = useState<
		User[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [
		usernameFilter,
		setUsernameFilter,
	] = useState('');
	const [roleFilter, setRoleFilter] =
		useState<number | ''>('');
	const [
		showNewUserModal,
		setShowNewUserModal,
	] = useState(false);
	const [
		showEditModal,
		setShowEditModal,
	] = useState(false);
	const [editingUser, setEditingUser] =
		useState<User | null>(null);
	const [submitting, setSubmitting] =
		useState(false);
	const [newUserData, setNewUserData] =
		useState<RegisterUserData>({
			username: '',
			password: '',
			firstName: '',
			lastName: '',
			role: 4,
			target: 0,
			currentOmset: 0,
		});

	const fetchUsers =
		useCallback(async () => {
			setLoading(true);
			try {
				const response = await getUsers(
					usernameFilter || undefined,
					roleFilter !== ''
						? roleFilter
						: undefined
				);
				if (
					response.statusCode === 200
				) {
					// Ensure we have an array
					const userData =
						response.data;
					if (Array.isArray(userData)) {
						setUsers(userData);
					} else {
						console.log(
							'API response data:',
							userData
						);
						setUsers([]);
						setError(
							'Invalid response format from server'
						);
					}
					setError('');
				} else {
					setError(
						response.error ||
							'Failed to fetch users'
					);
					setUsers([]);
				}
			} catch {
				console.error(
					'Error fetching users'
				);
				setError(
					'Failed to fetch users'
				);
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}, [usernameFilter, roleFilter]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleSearch = (
		e: React.FormEvent
	) => {
		e.preventDefault();
		fetchUsers();
	};

	const clearFilters = () => {
		setUsernameFilter('');
		setRoleFilter('');
	};

	const handleCreateUser = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result = await registerUser(
				newUserData
			);
			if (result.statusCode === 201) {
				setShowNewUserModal(false);
				setNewUserData({
					username: '',
					password: '',
					firstName: '',
					lastName: '',
					role: 4,
					target: 0,
					currentOmset: 0,
				});
				fetchUsers();
				setError('');
			} else {
				setError(
					result.error ||
						'Failed to create user'
				);
			}
		} catch {
			setError('Failed to create user');
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditUser = (
		user: User
	) => {
		setEditingUser(user);
		setNewUserData({
			username: user.username,
			password: '',
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			target: user.target || 0,
			currentOmset: 0,
		});
		setShowEditModal(true);
	};

	const handleUpdateUser = async (
		e: React.FormEvent
	) => {
		e.preventDefault();
		if (!editingUser) return;

		setSubmitting(true);

		try {
			const {
				password,
				...updateData
			} = newUserData;
			const finalUpdateData = password
				? { ...updateData, password }
				: updateData;

			const result = await updateUser(
				finalUpdateData
			);
			if (
				result.statusCode === 200 ||
				result.statusCode === 201
			) {
				setShowEditModal(false);
				setEditingUser(null);
				setNewUserData({
					username: '',
					password: '',
					firstName: '',
					lastName: '',
					role: 4,
					target: 0,
					currentOmset: 0,
				});
				fetchUsers();
				setError('');
			} else {
				setError(
					result.error ||
						'Failed to update user'
				);
			}
		} catch {
			setError('Failed to update user');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<MainLayout title="Pengguna">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8 flex justify-between items-center">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Pengguna
							</h2>
							<p className="text-gray-600">
								Kelola daftar pengguna
								sistem
							</p>
						</div>
						<button
							onClick={() =>
								setShowNewUserModal(
									true
								)
							}
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
						>
							+ Tambah Pengguna
						</button>
					</div>

					{/* Filters */}
					<div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
						<form
							onSubmit={handleSearch}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label
										htmlFor="username"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Username
									</label>
									<input
										type="text"
										id="username"
										value={
											usernameFilter
										}
										onChange={(e) =>
											setUsernameFilter(
												e.target.value
											)
										}
										placeholder="Cari berdasarkan username..."
										className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									/>
								</div>
								<div>
									<label
										htmlFor="role"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Role
									</label>
									<select
										id="role"
										value={roleFilter}
										onChange={(e) =>
											setRoleFilter(
												e.target
													.value === ''
													? ''
													: Number(
															e.target
																.value
													  )
											)
										}
										className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									>
										<option value="">
											Semua Role
										</option>
										<option value={1}>
											Sales Retail
										</option>
										<option value={2}>
											Sales Project
										</option>
										<option value={3}>
											Admin
										</option>
										<option value={4}>
											Manager Retail
										</option>
										<option value={5}>
											Superadmin
										</option>
										<option value={6}>
											Approver
										</option>
										<option value={7}>
											Pricing
										</option>
										<option value={8}>
											Gudang
										</option>
										<option value={9}>
											Manager Project
										</option>
										<option value={10}>
											HRD
										</option>
										<option value={11}>
											Kolektor
										</option>
									</select>
								</div>
								<div className="flex items-end space-x-2">
									<button
										type="submit"
										className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
									>
										Filter
									</button>
									<button
										type="button"
										onClick={
											clearFilters
										}
										className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
									>
										Clear
									</button>
								</div>
							</div>
						</form>
					</div>

					{error && (
						<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
							<div className="text-sm text-red-600 font-medium">
								{error}
							</div>
						</div>
					)}

					{/* Users table */}
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
						{loading ? (
							<div className="p-8 text-center">
								<div className="inline-flex items-center space-x-3">
									<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
									<span className="text-gray-600">
										Memuat pengguna...
									</span>
								</div>
							</div>
						) : !Array.isArray(users) ||
						  users.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								Tidak ada pengguna yang
								ditemukan
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												User Info
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Username
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Role
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Target
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Omset
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{Array.isArray(
											users
										) &&
											users.map(
												(user) => (
													<tr
														key={
															user._id ||
															user.id
														}
														className="hover:bg-gray-50"
													>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="flex items-center">
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
																<div className="ml-4">
																	<div className="text-sm font-medium text-gray-900">
																		{
																			user.firstName
																		}{' '}
																		{
																			user.lastName
																		}
																	</div>
																</div>
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm text-gray-900 font-medium">
																{
																	user.username
																}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
																	user.role
																)}`}
															>
																{getRoleName(
																	user.role
																)}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{user.target
																? `Rp ${user.target.toLocaleString(
																		'id-ID'
																  )}`
																: '-'}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{user.currentOmset
																? `Rp ${user.currentOmset.toLocaleString(
																		'id-ID'
																  )}`
																: '-'}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															<button
																onClick={() =>
																	handleEditUser(
																		user
																	)
																}
																className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
																title="Edit user"
															>
																<svg
																	className="w-5 h-5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={
																			2
																		}
																		d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																	/>
																</svg>
															</button>
														</td>
													</tr>
												)
											)}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Summary */}
					{!loading &&
						users.length > 0 && (
							<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
								<div className="text-sm text-gray-600">
									Total pengguna
									ditemukan:{' '}
									<span className="font-semibold text-gray-900">
										{users.length}
									</span>
								</div>
							</div>
						)}
				</div>
			</MainLayout>

			{/* New User Modal */}
			{showNewUserModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Tambah Pengguna Baru
							</h3>
							<button
								onClick={() =>
									setShowNewUserModal(
										false
									)
								}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form
							onSubmit={
								handleCreateUser
							}
							className="space-y-4"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Username
								</label>
								<input
									type="text"
									required
									autoComplete="username"
									value={
										newUserData.username
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												username:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<input
									type="password"
									required
									autoComplete="new-password"
									value={
										newUserData.password
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												password:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									First Name
								</label>
								<input
									type="text"
									required
									autoComplete="given-name"
									value={
										newUserData.firstName
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												firstName:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Last Name
								</label>
								<input
									type="text"
									required
									autoComplete="family-name"
									value={
										newUserData.lastName
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												lastName:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Role
								</label>
								<select
									value={
										newUserData.role
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												role: Number(
													e.target.value
												),
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								>
									<option value={1}>
										Sales Retail
									</option>
									<option value={2}>
										Sales Project
									</option>
									<option value={3}>
										Admin
									</option>
									<option value={4}>
										Manager Retail
									</option>
									<option value={5}>
										Superadmin
									</option>
									<option value={6}>
										Approver
									</option>
									<option value={7}>
										Pricing
									</option>
									<option value={8}>
										Gudang
									</option>
									<option value={9}>
										Manager Project
									</option>
									<option value={10}>
										HRD
									</option>
									<option value={11}>
										Kolektor
									</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Target
								</label>
								<input
									type="number"
									step="0.01"
									autoComplete="off"
									value={
										newUserData.target
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												target: Number(
													e.target.value
												),
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={() =>
										setShowNewUserModal(
											false
										)
									}
									className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
								>
									{submitting
										? 'Creating...'
										: 'Create User'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit User Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Edit Pengguna
							</h3>
							<button
								onClick={() =>
									setShowEditModal(
										false
									)
								}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form
							onSubmit={
								handleUpdateUser
							}
							className="space-y-4"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Username
								</label>
								<input
									type="text"
									required
									autoComplete="username"
									value={
										newUserData.username
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												username:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Password (leave empty
									to keep current)
								</label>
								<input
									type="password"
									autoComplete="new-password"
									value={
										newUserData.password
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												password:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									First Name
								</label>
								<input
									type="text"
									required
									autoComplete="given-name"
									value={
										newUserData.firstName
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												firstName:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Last Name
								</label>
								<input
									type="text"
									required
									autoComplete="family-name"
									value={
										newUserData.lastName
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												lastName:
													e.target
														.value,
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Role
								</label>
								<select
									value={
										newUserData.role
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												role: Number(
													e.target.value
												),
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								>
									<option value={1}>
										Sales Retail
									</option>
									<option value={2}>
										Sales Project
									</option>
									<option value={3}>
										Admin
									</option>
									<option value={4}>
										Manager Retail
									</option>
									<option value={5}>
										Superadmin
									</option>
									<option value={6}>
										Approver
									</option>
									<option value={7}>
										Pricing
									</option>
									<option value={8}>
										Gudang
									</option>
									<option value={9}>
										Manager Project
									</option>
									<option value={10}>
										HRD
									</option>
									<option value={11}>
										Kolektor
									</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Target
								</label>
								<input
									type="number"
									step="0.01"
									autoComplete="off"
									value={
										newUserData.target
									}
									onChange={(e) =>
										setNewUserData(
											(prev) => ({
												...prev,
												target: Number(
													e.target.value
												),
											})
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>
							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={() =>
										setShowEditModal(
											false
										)
									}
									className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
								>
									{submitting
										? 'Updating...'
										: 'Update User'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
