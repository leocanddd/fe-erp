const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface User {
	_id?: string;
	id?: number; // Keep for compatibility
	username: string;
	firstName: string;
	lastName: string;
	role: number;
	target?: number;
	currentOmset?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface RegisterUserData {
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	role: number;
	target: number;
	currentOmset: number;
}

interface ApiResponse<T> {
	statusCode: number;
	data?: T;
	error?: string;
}

export const getUsers = async (
	username?: string,
	role?: number
): Promise<ApiResponse<User[]>> => {
	try {
		const params =
			new URLSearchParams();
		if (username)
			params.append(
				'username',
				username
			);
		if (role !== undefined)
			params.append(
				'role',
				role.toString()
			);

		const queryString =
			params.toString();
		const url = `${API_BASE_URL}/api/users${
			queryString
				? `?${queryString}`
				: ''
		}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type':
					'application/json',
			},
		});

		const data = await response.json();
		console.log('API response:', data);

		// Handle the actual API response structure
		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: data.data, // Extract the actual users array
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					`HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch users',
		};
	}
};

export const getRoleName = (
	role: number
): string => {
	const roleNames: {
		[key: number]: string;
	} = {
		1: 'Sales Retail',
		2: 'Sales Project',
		3: 'Admin',
		4: 'Manager Retail',
		5: 'Superadmin',
		6: 'Approver',
		7: 'Pricing',
		8: 'Gudang',
		9: 'Manager Project',
		10: 'HRD',
		11: 'Kolektor',
		12: 'Blog',
	};
	return (
		roleNames[role] || 'Unknown Role'
	);
};

export const getRoleColor = (
	role: number
): string => {
	const roleColors: {
		[key: number]: string;
	} = {
		1: 'bg-red-100 text-red-800',
		2: 'bg-purple-100 text-purple-800',
		3: 'bg-blue-100 text-blue-800',
		4: 'bg-green-100 text-green-800',
		5: 'bg-gray-100 text-gray-800',
		6: 'bg-yellow-100 text-yellow-800',
		7: 'bg-indigo-100 text-indigo-800',
		8: 'bg-orange-100 text-orange-800',
		9: 'bg-emerald-100 text-emerald-800',
	};
	return (
		roleColors[role] ||
		'bg-gray-100 text-gray-800'
	);
};

export const registerUser = async (
	userData: RegisterUserData
): Promise<
	ApiResponse<{ message: string }>
> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(userData),
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 201
		) {
			return {
				statusCode: 201,
				data: { message: data.message },
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to register user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to register user',
		};
	}
};

export const updateUser = async (
	userData: Partial<RegisterUserData> & {
		username: string;
	}
): Promise<
	ApiResponse<{ message: string }>
> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/users/update`,
			{
				method: 'PUT',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(userData),
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: { message: data.message },
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to update user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to update user',
		};
	}
};

export const changeUserPassword =
	async (
		username: string,
		newPassword: string
	): Promise<
		ApiResponse<{ message: string }>
	> => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/api/users/change-password`,
				{
					method: 'PUT',
					headers: {
						'Content-Type':
							'application/json',
					},
					body: JSON.stringify({
						username,
						newPassword,
					}),
				}
			);

			const data =
				await response.json();

			if (
				data.status === 'success' &&
				data.statusCode === 200
			) {
				return {
					statusCode: 200,
					data: {
						message: data.message,
					},
				};
			} else {
				return {
					statusCode:
						data.statusCode ||
						response.status,
					error:
						data.message ||
						'Failed to change password',
				};
			}
		} catch {
			return {
				statusCode: 500,
				error:
					'Failed to change password',
			};
		}
	};
